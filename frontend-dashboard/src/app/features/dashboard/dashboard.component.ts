import { Component, inject , OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Importar HttpClient
import { API_CONFIG } from '../../core/config/api.config'; // Importar Config
import { MessageService } from 'primeng/api';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../../app/core/services/auth/auth.service';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, ButtonModule, ToolbarModule, AvatarModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
   // Implementar OnInit
  private authService = inject(AuthService);
  private http = inject(HttpClient); // Inyectar
  private messageService = inject(MessageService);

  ngOnInit() {
    this.checkConnection();
  }

  // Método para verificar que la API responde realmente
  checkConnection() {
    // Hacemos una petición ligera (ej: listar productos con limite 1 o un endpoint health)
    // Usamos la URL de la API base
    this.http.get(`${API_CONFIG.apiUrl}/productos?limit=1`).subscribe({
      next: () => {
        console.log('✅ Conexión con API verificada');
      },
      error: (err) => {
        if (err.status === 0) {
          console.error('❌ VPN/API no detectada');
          this.messageService.add({
            severity: 'error', 
            summary: 'Modo Offline', 
            detail: 'No se detecta conexión a la API. Verifica tu VPN.',
            life: 10000
          });
          
          // Opcional: Forzar salida si quieres ser estricto
          // this.authService.logout();
        }
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}