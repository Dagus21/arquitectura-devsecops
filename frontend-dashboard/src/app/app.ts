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
    // Lógica de "Autodestrucción" del Service Worker antiguo
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for (let registration of registrations) {
          registration.unregister();
          console.log('🧹 Service Worker antiguo eliminado.');
        }
      });
    }
  }
}