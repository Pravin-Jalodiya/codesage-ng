import {Component, inject} from '@angular/core';

import {LandingPageConstants} from "../../shared/constants";
import {AuthService} from "../../services/auth/auth.service";

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
  protected readonly LandingPageConstants = LandingPageConstants;
  private authService: AuthService = inject(AuthService);
}
