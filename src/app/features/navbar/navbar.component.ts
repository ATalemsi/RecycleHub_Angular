import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {Store} from "@ngrx/store";
import * as AuthActions from "../../core/state/auth/auth.actions";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  constructor(private store: Store) {}

  logout() {
    this.store.dispatch(AuthActions.logout())
  }
}
