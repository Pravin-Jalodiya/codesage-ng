import { Component, OnInit } from '@angular/core';
import {Role} from "../../shared/config/roles.config";

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent implements OnInit {
  role: "user" | "admin" | undefined = "admin"

  ngOnInit(): void {
    this.role = Math.random() > 0.5 ? 'admin' : 'user';
  }

  protected readonly Role = Role;
}
