import { Component } from '@angular/core';
import {Store} from "@ngrx/store";
import {login} from "../../../core/state/auth/auth.actions";
import {FormsModule} from "@angular/forms";

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

  constructor(private readonly store: Store) {}

  onSubmit() {
    this.store.dispatch(login({ email: this.email, password: this.password }));
  }
}
