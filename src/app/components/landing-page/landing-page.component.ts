import { Component } from '@angular/core';
import {ButtonDirective} from "primeng/button";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    ButtonDirective,
    RouterLink
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {

}
