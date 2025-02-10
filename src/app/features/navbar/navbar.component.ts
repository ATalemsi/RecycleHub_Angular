import { Component } from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {Store} from "@ngrx/store";
import * as AuthActions from "../../core/state/auth/auth.actions";
import {AsyncPipe, NgIf} from "@angular/common";
import {selectUser} from "../../core/state/auth/auth.selectors";
import {User} from "../../shared/models/user.model";
import {Observable} from "rxjs";
import {AuthService} from "../../core/services/auth/auth.service";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    RouterLink
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  user$: Observable<User | null> = this.store.select(selectUser)

  constructor(
    private readonly store: Store,
  ) {}

  logout() {
    this.store.dispatch(AuthActions.logout())
  }
}
