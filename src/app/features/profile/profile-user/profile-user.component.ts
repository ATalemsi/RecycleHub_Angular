import { Component } from '@angular/core';
import {selectError, selectLoading, selectUser} from '../../../core/state/auth/auth.selectors';
import {Store} from "@ngrx/store";

@Component({
  selector: 'app-profile-user',
  standalone: true,
  imports: [],
  templateUrl: './profile-user.component.html',
  styleUrl: './profile-user.component.scss'
})
export class ProfileUserComponent {
  user$ = this.store.select(selectUser);
  error$ = this.store.select(selectError);
  loading$ = this.store.select(selectLoading);

  constructor(private readonly store: Store) {}

}
