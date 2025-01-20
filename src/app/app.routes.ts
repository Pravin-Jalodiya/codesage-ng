import { Routes } from '@angular/router';
import {ProgressComponent} from "./components/progress/progress.component";
import {PlatformComponent} from "./components/platform/platform.component";
import {UsersTableComponent} from "./components/users-table/users-table.component";
import {QuestionsTableComponent} from "./components/questions-table/questions-table.component";
import {ProfileComponent} from "./components/profile/profile.component";
import {SignupFormComponent} from "./components/signup-form/signup-form.component";
import {LoginFormComponent} from "./components/login-form/login-form.component";
import {LandingPageComponent} from "./components/landing-page/landing-page.component";
import {adminGuard} from "./shared/guards/admin.guard";
import {userGuard} from "./shared/guards/user.guard";
import {authGuard} from "./shared/guards/auth.guard";
import {NotFoundComponent} from "./components/not-found/not-found.component";
import {ForgotPasswordComponent} from "./components/forgot-password/forgot-password.component";
import {ResetPasswordComponent} from "./components/reset-password/reset-password.component";
import {FormGuard} from "./shared/guards/form.guard";

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginFormComponent },
  { path: 'signup', component: SignupFormComponent },
  { path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
		canDeactivate: [FormGuard]
  },
  { path: 'questions',
    component: QuestionsTableComponent,
    canActivate: [authGuard]
  },
  {
    path: 'users',
    component: UsersTableComponent,
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'platform',
    component: PlatformComponent,
    canActivate: [authGuard ,adminGuard]
  },
  { path: 'progress',
    component: ProgressComponent,
    canActivate: [authGuard ,userGuard]
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
    canActivate: [authGuard]
  }
];
