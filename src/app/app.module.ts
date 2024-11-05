import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {provideRouter, RouterLink, RouterOutlet} from "@angular/router";
import {ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule, provideHttpClient} from "@angular/common/http";
import {BrowserModule} from "@angular/platform-browser";

import {ButtonDirective} from "primeng/button";

import {AppComponent} from "./app.component";
import {LandingPageComponent} from "./components/landing-page/landing-page.component";
import {LoginFormComponent} from "./components/login-form/login-form.component";
import {SignupFormComponent} from "./components/signup-form/signup-form.component";
import {AuthService} from "./shared/services/auth/auth.service";
import {AppHeaderComponent} from "./components/app-header/app-header.component";
import {routes} from "./app.routes";
import {FloatLabelModule} from "primeng/floatlabel";
import {InputTextModule} from "primeng/inputtext";
import {PasswordModule} from "primeng/password";
import {Ripple} from "primeng/ripple";


@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    LoginFormComponent,
    SignupFormComponent,
    AppHeaderComponent
  ],
  imports: [
    CommonModule,
    RouterOutlet,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    RouterLink,
    BrowserModule,
    ButtonDirective,
    FloatLabelModule,
    InputTextModule,
    PasswordModule,
    Ripple
  ],
  bootstrap: [AppComponent],
  providers: [AuthService, provideHttpClient(), provideRouter(routes)]
})
export class AppModule { }