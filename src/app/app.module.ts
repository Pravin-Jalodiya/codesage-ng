import { NgModule } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {provideRouter, RouterLink, RouterOutlet} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule, provideHttpClient, withInterceptors} from "@angular/common/http";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {CircleProgressOptions, NgCircleProgressModule} from 'ng-circle-progress';

import {ButtonDirective, ButtonModule} from "primeng/button";
import {ConfirmationService, MessageService} from 'primeng/api';
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
import {AuthService} from "./services/auth/auth.service";
import {AppHeaderComponent} from "./components/app-header/app-header.component";
import {routes} from "./app.routes";
import {ProfileComponent} from "./components/profile/profile.component";
import {FileUploadComponent} from './components/upload-file/file-upload.component';
import { AddQuestionComponent } from './components/add-question/add-question.component';
import { QuestionsTableComponent } from './components/questions-table/questions-table.component';
import { PaginatorComponent } from './components/paginator/paginator.component';
import { UsersTableComponent } from './components/users-table/users-table.component';
import { ProgressComponent } from './components/progress/progress.component';
import {AuthInterceptor} from "./shared/interceptors/auth.interceptor";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {DateAndTimePipe} from "./shared/pipes/date-and-time.pipe";
import {PlatformComponent} from "./components/platform/platform.component";
import {MatIcon} from "@angular/material/icon";
import {DialogModule} from "primeng/dialog";
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import {InputOtpModule} from "primeng/inputotp";


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
        UsersTableComponent,
        ProgressComponent,
        PlatformComponent,
        DateAndTimePipe,
        NotFoundComponent,
        ForgotPasswordComponent,
        ResetPasswordComponent
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
    MatSlideToggleModule,
    NgCircleProgressModule,
    ConfirmDialogModule,
    NgOptimizedImage,
    MatIcon,
    DialogModule,
    InputOtpModule,
  ],
    bootstrap: [AppComponent, ],
    exports: [AppHeaderComponent],
    providers: [AuthService,
								provideHttpClient(withInterceptors([AuthInterceptor])),
								provideRouter(routes),
								MessageService,
								CircleProgressOptions,
								ConfirmationService
		]
})
export class AppModule { }
