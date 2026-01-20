import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // Solo necesitamos el Router
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  // Ya no necesitamos lógica aquí, el Router se encarga de cargar el Login
}