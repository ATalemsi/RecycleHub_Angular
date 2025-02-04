import { Injectable } from "@angular/core"
import {  Actions, createEffect, ofType } from "@ngrx/effects"
import { of } from "rxjs"
import { catchError, map, switchMap } from "rxjs/operators"
import  { AuthService } from "../../services/auth/auth.service"
import * as AuthActions from "./auth.actions"

@Injectable()
export class AuthEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly authService: AuthService,
  ) {}

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ user }) =>
        this.authService.register(user).pipe(
          map(() => AuthActions.registerSuccess()),
          catchError((error) => of(AuthActions.registerFailure({ error: error.message }))),
        ),
      ),
    ),
  )

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map((user) => AuthActions.loginSuccess({ user })),
          catchError((error) => of(AuthActions.loginFailure({ error: error.message }))),
        ),
      ),
    ),
  )

  updateProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updateProfile),
      switchMap(({ user }) =>
        this.authService.updateProfile(user).pipe(
          map((updatedUser) => AuthActions.updateProfileSuccess({ user: updatedUser })),
          catchError((error) => of(AuthActions.updateProfileFailure({ error: error.message }))),
        ),
      ),
    ),
  )

  deleteAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.deleteAccount),
      switchMap(({ userId }) =>
        this.authService.deleteAccount(userId).pipe(
          map(() => AuthActions.deleteAccountSuccess()),
          catchError((error) => of(AuthActions.deleteAccountFailure({ error: error.message }))),
        ),
      ),
    ),
  )
}

