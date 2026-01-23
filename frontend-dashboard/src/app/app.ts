import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast'; // Importar


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule], // Agregar al array
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {}