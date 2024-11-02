import { Routes } from '@angular/router';

import {LandingPageComponent} from "./components/landing-page/landing-page.component";
import {AuthFormComponent} from "./components/auth-form/auth-form.component";

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: AuthFormComponent },
  { path: 'signup', component: AuthFormComponent }
];
