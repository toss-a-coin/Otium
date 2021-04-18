import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { routing, appRoutingProviders} from './app.routing';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule} from '@angular/forms';
// import { HttpModule} from '@angular/http';
import { HttpClientModule} from '@angular/common/http';
//Cargar componentes para la app.

import { loginComponent} from './components/login/login.component';
import { registerComponent} from './components/register/register.component';
@NgModule({
  declarations: [
    AppComponent,
    loginComponent,
    registerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    routing,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    appRoutingProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
