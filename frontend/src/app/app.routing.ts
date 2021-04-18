import {ModuleWithProviders} from '@angular/core';
import { Routes, RouterModule} from '@angular/router';

//Importar los componentes.
import { loginComponent} from './components/login/login.component';
import { registerComponent} from './components/register/register.component';

const appRoutes: Routes = [
  {path: '', component: loginComponent},
  {path: 'login', component: loginComponent},
  {path: 'registro',component: registerComponent}
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders<any> = RouterModule.forRoot(appRoutes);
