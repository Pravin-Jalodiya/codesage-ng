import { Component } from '@angular/core';

interface FilterOption {
  name: string;
  code: string;
}

@Component({
  selector: 'app-users-table',
  templateUrl: './users-table.component.html',
  styleUrl: './users-table.component.scss'
})

export class UsersTableComponent {
  role: "admin" | "user" = "user";

  companies: FilterOption[] | undefined;

  selectedCompany: FilterOption | undefined;

  ngOnInit() {
    this.companies = [
      { name: 'Banned', code: 'BND' },
      { name: 'Unbanned', code: 'UBND' },
    ];
  }

  onQuestionDelete(){

  }
}
