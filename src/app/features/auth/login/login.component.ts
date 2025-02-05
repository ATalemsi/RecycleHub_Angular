import { Component } from '@angular/core';
import {Store} from "@ngrx/store";
import {login} from "../../../core/state/auth/auth.actions";
import {FormsModule} from "@angular/forms";
import {selectError, selectLoading} from "../../../core/state/auth/auth.selectors";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  error$ = this.store.select(selectError)
  loading$ = this.store.select(selectLoading)

  constructor(private readonly store: Store , private readonly router: Router,) {}

  onSubmit() {
    this.store.dispatch(login({ email: this.email, password: this.password }));
  }
}
