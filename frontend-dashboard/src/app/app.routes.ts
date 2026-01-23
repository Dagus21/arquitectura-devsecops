import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard'; // Importar Guard
import {ProductListComponent} from './features/inventory/product-list/product-list.component'


export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    
    // RUTA PROTEGIDA
    { 
        path: 'dashboard', 
        component: DashboardComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'products', pathMatch: 'full' },
            { path: 'products', component: ProductListComponent } // <--- ESTO CARGA LA TABLA
        ]
    },

    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' } // Cualquier ruta desconocida va al login
];