import { Component } from '@angular/core';
import {ButtonDirective} from "primeng/button";

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    ButtonDirective
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {

}
