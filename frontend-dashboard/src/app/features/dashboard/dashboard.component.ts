import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../../app/core/services/auth/auth.service';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ButtonModule, ToolbarModule, AvatarModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}