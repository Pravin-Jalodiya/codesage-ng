import { Routes } from '@angular/router';

import {LandingPageComponent} from "./components/landing-page/landing-page.component";
import {LoginFormComponent} from "./components/login-form/login-form.component";
import {SignupFormComponent} from "./components/signup-form/signup-form.component";
import {ProfileComponent} from "./components/profile/profile.component";
import {AddQuestionComponent} from "./components/add-question/add-question.component";
import {QuestionsTableComponent} from "./components/questions-table/questions-table.component";
import { UsersTableComponent } from './components/users-table/users-table.component';
import {StatsComponent} from "./components/stats/stats.component";

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginFormComponent },
  { path: 'signup', component: SignupFormComponent },
  { path: 'profile', component: ProfileComponent},
  { path: 'add-questions', component: AddQuestionComponent},
  { path: 'delete-question', component: QuestionsTableComponent},
  { path: 'manage-users', component: UsersTableComponent},
  { path: 'progress', component: StatsComponent},
  { path: 'platform', component: StatsComponent}
];
