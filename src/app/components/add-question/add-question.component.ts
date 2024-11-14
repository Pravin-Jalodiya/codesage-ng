import { Component } from '@angular/core';

import { AddQuestionConstants } from '../../shared/constants';

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.scss'],
})
export class AddQuestionComponent {
  protected readonly AddQuestionConstants = AddQuestionConstants;
}
