import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard'; // Importar Guard
import {ProductListComponent} from './features/inventory/product-list/product-list.component'
import { VentaListComponent } from './features/ventas/venta-list/venta-list'; // Añadir import
import { UsuarioListComponent } from './features/usuarios/usuario-list/usuario-list'; 

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    
    // RUTA PROTEGIDA
    { 
        path: 'dashboard', 
        component: DashboardComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'products', pathMatch: 'full' },
            { path: 'products', component: ProductListComponent },
            { path: 'ventas', component: VentaListComponent },
            { path: 'usuarios', component: UsuarioListComponent }  // <--- NUEVA RUTA // <--- ESTO CARGA LA TABLA
        ]
    },

    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' } // Cualquier ruta desconocida va al login
];