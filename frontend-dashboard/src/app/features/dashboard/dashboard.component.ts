import { Component, inject , OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Importar HttpClient
import { API_CONFIG } from '../../core/config/api.config'; // Importar Config
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../../app/core/services/auth/auth.service';

// IMPORTANTE: Importar RouterLink y RouterLinkActive
import { RouterLink, RouterLinkActive } from '@angular/router'; 


// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // AGREGARLOS AL ARRAY DE IMPORTS AQUÍ:
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, ToolbarModule, AvatarModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
   // Implementar OnInit
  private authService = inject(AuthService);
  private http = inject(HttpClient); // Inyectar

  mobileMenuOpen: boolean = false; // <--- AÑADIR ESTA LÍNEA
  

  ngOnInit() {
    this.checkConnection();
  }

  checkConnection() {
    this.http.get(`${API_CONFIG.apiUrl}/productos?limit=1`).subscribe({
      next: () => {
        //console.log('✅ Conexión con API verificada');
      },
      error: (err) => {
        if (err.status === 0) {
          console.error('❌ VPN/API no detectada');
          
          // --- BLOQUE ELIMINADO ---
          // this.messageService.add({
          //   severity: 'error', 
          //   summary: 'Modo Offline', 
          //   detail: 'No se detecta conexión...'
          // });
          // ------------------------

          // Opcional: Si quieres redirigir al login silenciosamente
          // this.authService.logout(); 
        }
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}