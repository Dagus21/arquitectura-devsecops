import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../config/api.config';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.apiUrl}/media`;

  uploadImage(file: File): Observable<{ url: string }> {
    // 1. Convertimos la promesa de compresión en un Observable de RxJS
    return from(this.compressImage(file)).pipe(
      switchMap((compressedFile) => {
        // 2. Una vez comprimida, la enviamos al backend normalmente
        const formData = new FormData();
        formData.append('file', compressedFile);
        return this.http.post<{ url: string }>(`${this.apiUrl}/upload`, formData);
      })
    );
  }

  /**
   * MAGIA NATIVA: Comprime y convierte cualquier imagen a formato WebP 
   * usando el procesador gráfico del navegador (Canvas HTML5).
   */
  private compressImage(file: File, maxWidth = 800, quality = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Redimensionar respetando la relación de aspecto
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          // Dibujar la imagen en el canvas
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Convertir el canvas a un archivo Blob formato WebP
          canvas.toBlob((blob) => {
            if (blob) {
              // Cambiamos la extensión original por .webp
              const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
              const newFile = new File([blob], newFileName, { type: 'image/webp' });
              resolve(newFile);
            } else {
              resolve(file); // Si algo falla, subimos la original (Fallback)
            }
          }, 'image/webp', quality);
        };
        img.onerror = () => resolve(file); // Si falla carga de imagen, envía original
      };
      reader.onerror = () => resolve(file); // Si falla lectura de archivo, envía original
    });
  }
}