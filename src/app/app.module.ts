import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {provideRouter, RouterLink, RouterOutlet} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule, provideHttpClient} from "@angular/common/http";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

import {ButtonDirective, ButtonModule} from "primeng/button";
import { MessageService } from 'primeng/api';
import {FloatLabelModule} from "primeng/floatlabel";
import {InputTextModule} from "primeng/inputtext";
import {PasswordModule} from "primeng/password";
import {Ripple} from "primeng/ripple";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {ToastModule} from "primeng/toast";
import {AvatarModule} from "primeng/avatar";
import {FileUploadModule} from "primeng/fileupload";
import {ProgressBarModule} from "primeng/progressbar";
import {BadgeModule} from "primeng/badge";
import {DropdownModule} from "primeng/dropdown";
import { PaginatorModule } from 'primeng/paginator';

import {AppComponent} from "./app.component";
import {LandingPageComponent} from "./components/landing-page/landing-page.component";
import {LoginFormComponent} from "./components/login-form/login-form.component";
import {SignupFormComponent} from "./components/signup-form/signup-form.component";
import {AuthService} from "./shared/services/auth/auth.service";
import {AppHeaderComponent} from "./components/app-header/app-header.component";
import {routes} from "./app.routes";
import {ProfileComponent} from "./components/profile/profile.component";
import {FileUploadComponent} from './components/upload-file/file-upload.component';
import { AddQuestionComponent } from './components/add-question/add-question.component';
import { QuestionsTableComponent } from './components/questions-table/questions-table.component';
import { PaginatorComponent } from './components/paginator/paginator.component';
import { UsersTableComponent } from './components/users-table/users-table.component';


@NgModule({
    declarations: [
        AppComponent,
        LandingPageComponent,
        LoginFormComponent,
        SignupFormComponent,
        AppHeaderComponent,
        ProfileComponent,
        FileUploadComponent,
        AddQuestionComponent,
        QuestionsTableComponent,
        PaginatorComponent,
        UsersTableComponent
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
    FileUploadModule,
    ButtonModule,
    PaginatorModule,
    BadgeModule,
    ProgressBarModule,
    Ripple,
    ProgressSpinnerModule,
    BrowserAnimationsModule,
    ToastModule,
    AvatarModule,
    DropdownModule,
    FormsModule,
    MatSlideToggleModule
  ],
    bootstrap: [AppComponent],
    providers: [AuthService, provideHttpClient(), provideRouter(routes), MessageService]
})
export class AppModule { }
