import {Component} from '@angular/core';
import {selectError, selectLoading, selectUser} from '../../../core/state/auth/auth.selectors';
import {Store} from "@ngrx/store";
import {AuthService} from "../../../core/services/auth/auth.service";
import {Router} from "@angular/router";
import {AsyncPipe, NgIf} from "@angular/common";
import {AuthState} from "../../../core/state/auth/auth.reducer";
import {Observable} from "rxjs";
import {User} from "../../../shared/models/user.model";

@Component({
  selector: 'app-profile-user',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe
  ],
  templateUrl: './profile-user.component.html',
  styleUrl: './profile-user.component.scss'
})
export class ProfileUserComponent {
  user$: Observable<User | null> = this.store.select(selectUser);
  error$: Observable<string | null> = this.store.select(selectError);
  loading$: Observable<boolean> = this.store.select(selectLoading);

  constructor(
    private readonly store: Store<{ auth: AuthState }>,
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {
  }

  logout() {
    this.authService.logout()
    this.router.navigate(["/login"])
  }
}
