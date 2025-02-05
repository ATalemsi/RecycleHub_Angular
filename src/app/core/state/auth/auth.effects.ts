import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, map, switchMap, mergeMap, tap } from "rxjs/operators";
import { AuthService } from "../../services/auth/auth.service";
import * as AuthActions from "./auth.actions";
import { CollecteurService } from "../../services/collecteur/collecteur.service";
import {Router} from "@angular/router";

@Injectable()
export class AuthEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly authService: AuthService,
    private readonly collecteursService: CollecteurService,
    private readonly router: Router,
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
  );

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

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => this.router.navigate(["/profile"])),
      ),
    { dispatch: false },
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
  );

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
  );

  loadCollecteurs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadCollecteurs),
      mergeMap(() =>
        this.collecteursService.loadCollecteursFromJson().pipe(
          tap((collecteurs) => this.collecteursService.saveCollecteursToLocalStorage(collecteurs)),
          map((collecteurs) => AuthActions.loadCollecteursSuccess({ collecteurs })),
          catchError((error) => of(AuthActions.loadCollecteursFailure({ error: error.message }))),
        ),
      ),
    ),
  );

  checkAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.checkAuth),
      switchMap(() =>
        this.authService.isAuthenticated().pipe(
          map((isAuthenticated) =>
            isAuthenticated
              ? AuthActions.loginSuccess({ user: this.authService.getLoggedInUser()! })
              : AuthActions.loginFailure({ error: 'Not authenticated' })
          ),
          catchError((error) => of(AuthActions.loginFailure({ error: error.message })))
        )
      )
    )
  );
}
