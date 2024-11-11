import { Component } from '@angular/core';
import {LandingPageConstants} from "../../shared/constants";

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})

export class LandingPageComponent {
  protected readonly LandingPageConstants = LandingPageConstants;
}
