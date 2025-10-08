// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app'; // O './app/app' si tu archivo se llama app.ts

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));