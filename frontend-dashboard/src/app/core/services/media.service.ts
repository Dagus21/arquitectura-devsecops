import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../config/api.config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.apiUrl}/media`;

  uploadImage(file: File): Observable<{ url: string }> {
    // Para subir archivos, es OBLIGATORIO usar FormData
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ url: string }>(`${this.apiUrl}/upload`, formData);
  }
}