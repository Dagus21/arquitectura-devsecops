import { Component , OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast'; // Importar


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule], // Agregar al array
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {
  
  ngOnInit() {
    this.killServiceWorker();
  }

  async killServiceWorker() {
    if ('serviceWorker' in navigator) {
      // 1. Obtener todos los SW activos
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      for (const registration of registrations) {
        // 2. Desregistrarlos
        await registration.unregister();
        
      }
    }

    // 3. BORRADO NUCLEAR DE CACHÉ
    if ('caches' in window) {
      const keys = await caches.keys();
      for (const key of keys) {
        await caches.delete(key);
        
      }
    }
  }
}