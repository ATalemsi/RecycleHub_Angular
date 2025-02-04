import {Component} from '@angular/core';
import {User} from "../../../shared/models/user.model";
import {Store} from "@ngrx/store";
import {register} from "../../../core/state/auth/auth.actions";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  user: User = {
    id: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    address: '',
    phoneNumber: '',
    dateOfBirth: '',
    role: 'particulier',
  };

  constructor(private readonly store: Store) {
  }

  onSubmit() {
    this.store.dispatch(register({user: this.user}));
  }

}
