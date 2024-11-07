import { Component } from '@angular/core';

interface FilterOption {
  name: string;
  code: string;
}

@Component({
  selector: 'app-questions-table',
  templateUrl: './questions-table.component.html',
  styleUrls: ['./questions-table.component.scss']
})
export class QuestionsTableComponent {
  companies: FilterOption[] | undefined;
  topics: FilterOption[] | undefined;
  difficulties: FilterOption[] | undefined;

  selectedCompany: FilterOption | undefined;
  selectedTopic: FilterOption | undefined;
  selectedDifficulty: FilterOption | undefined;

  ngOnInit() {
    this.companies = [
      { name: 'Google', code: 'GOOGL' },
      { name: 'Microsoft', code: 'MSFT' },
      { name: 'Tesla', code: 'TSLA' },
      { name: 'Apple', code: 'AAPL' }
    ];

    this.topics = [
      { name: 'Array', code: 'ARRAY' },
      { name: 'String', code: 'STRING' },
      { name: 'Tree', code: 'TREE' },
      { name: 'Graph', code: 'GRAPH' }
    ];

    this.difficulties = [
      { name: 'Easy', code: 'EASY' },
      { name: 'Medium', code: 'MED' },
      { name: 'Hard', code: 'HARD' }
    ];
  }
}
