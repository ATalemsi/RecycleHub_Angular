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
      tap(() => console.log('Register action received')), // Log de debug
      switchMap(({ user }) =>
        this.authService.register(user).pipe(
          tap(newUser => console.log('Registration successful:', newUser)), // Log de debug
          map((newUser) => AuthActions.registerSuccess({ user: newUser })),
          catchError((error) => {
            console.error('Registration failed:', error); // Log de debug
            return of(AuthActions.registerFailure({ error: error.message }));
          }),
        ),
      ),
    ),
  );

  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(() => {
          console.log('RegisterSuccess action received, navigating...'); // Log de debug
          this.router.navigate(["/collections"]);
        }),
      ),
    { dispatch: false },
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
        tap(() => this.router.navigate(["/collections"])),
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
  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.authService.logout()
          this.router.navigate(["/login"])
        }),
      ),
    { dispatch: false },
  )

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

  hydrateState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.hydrateState),
      map(() => {
        const user = this.authService.getLoggedInUser()
        return AuthActions.hydrateStateSuccess({ user })
      }),
    ),
  )

  // Add this effect to persist state changes
  persistState$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          AuthActions.loginSuccess,
          AuthActions.registerSuccess,
          AuthActions.updateProfileSuccess,
          AuthActions.logout,
        ),
        tap(() => {
          const user = this.authService.getLoggedInUser()
          localStorage.setItem("app-state", JSON.stringify({ auth: { user } }))
        }),
      ),
    { dispatch: false },
  )
}
