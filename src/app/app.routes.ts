import { Routes } from '@angular/router';
import {ProgressComponent} from "./components/progress/progress.component";
import {PlatformComponent} from "./components/platform/platform.component";
import {UsersTableComponent} from "./components/users-table/users-table.component";
import {QuestionsTableComponent} from "./components/questions-table/questions-table.component";
import {AddQuestionComponent} from "./components/add-question/add-question.component";
import {ProfileComponent} from "./components/profile/profile.component";
import {SignupFormComponent} from "./components/signup-form/signup-form.component";
import {LoginFormComponent} from "./components/login-form/login-form.component";
import {LandingPageComponent} from "./components/landing-page/landing-page.component";
import {adminGuard} from "./shared/guards/admin.guard";

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginFormComponent },
  { path: 'signup', component: SignupFormComponent },
  { path: 'profile', component: ProfileComponent },
  {
    path: 'add-questions',
    component: AddQuestionComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'delete-question',
    component: QuestionsTableComponent,
    canActivate: [adminGuard]
  },
  { path: 'questions', component: QuestionsTableComponent },
  {
    path: 'manage-users',
    component: UsersTableComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'platform',
    component: PlatformComponent,
    canActivate: [adminGuard]
  },
  { path: 'progress', component: ProgressComponent }
];
