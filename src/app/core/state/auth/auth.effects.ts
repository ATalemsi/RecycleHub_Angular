import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, map, switchMap, mergeMap, tap } from "rxjs/operators";
import { AuthService } from "../../services/auth/auth.service";
import * as AuthActions from "./auth.actions";
import { CollecteurService } from "../../services/collecteur/collecteur.service";
import { Router } from "@angular/router";

export enum UserRole {
  PARTICULIER = 'particulier',
  COLLECTEURS = 'collecteurs'
}

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
          map((newUser) => AuthActions.registerSuccess({ user: newUser })),
          catchError((error) => of(AuthActions.registerFailure({ error: error.message }))),
        ),
      ),
    ),
  );

  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(() => {
          this.router.navigate(["/login"]);
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
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ user }) => {
          if (user.role === UserRole.PARTICULIER) {
            this.router.navigate(["/collections"]);
          } else if (user.role === UserRole.COLLECTEURS) {
            this.router.navigate(["/collections/dashboard"]);
          } else {
            this.router.navigate(["/profile"]);
          }
        }),
      ),
    { dispatch: false },
  );

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
          map(() => {
            this.authService.logout();
            this.router.navigate(['/login']);
            return AuthActions.deleteAccountSuccess();
          }),
          catchError((error) => of(AuthActions.deleteAccountFailure({ error: error.message }))),
        ),
      ),
    )
  );

  loadCollecteurs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadCollecteurs),
      mergeMap(() =>
        this.collecteursService.loadCollecteursFromJson().pipe(
          tap((collecteurs) => {
            try {
              // Save collecteurs to sessionStorage instead of localStorage
              sessionStorage.setItem('collecteurs', JSON.stringify(collecteurs));
            } catch (error) {
              console.error('Error saving collecteurs to sessionStorage:', error);
            }
          }),
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
          this.authService.logout();
          this.router.navigate(["/login"]);
        }),
      ),
    { dispatch: false },
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

  hydrateState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.hydrateState),
      map(() => {
        const user = this.authService.getLoggedInUser();
        return AuthActions.hydrateStateSuccess({ user });
      }),
    ),
  );

  // Modify the persistState$ effect to use sessionStorage
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
          const user = this.authService.getLoggedInUser();

          // Only store essential user information
          const minimalUserData = user ? {
            id: user.id,
            email: user.email,
            role: user.role,
            points: user.points,
            // Add other essential fields here
          } : null;

          try {
            // Use sessionStorage instead of localStorage
            sessionStorage.setItem(this.authService.loggedInUserKey, JSON.stringify(minimalUserData));
          } catch (error) {
            console.error('Error persisting state:', error);
            // Optionally, dispatch an action to notify about the storage error
            // this.store.dispatch(AuthActions.storageError({ error: error.message }));
          }
        }),
      ),
    { dispatch: false },
  );

  // Add a new effect to clean up old data
  cleanupStorage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => {
          try {
            // Remove any unnecessary items from sessionStorage
            sessionStorage.removeItem('oldItem1');
            sessionStorage.removeItem('oldItem2');
            // Add more items to remove if needed
          } catch (error) {
            console.error('Error cleaning up storage:', error);
          }
        })
      ),
    { dispatch: false }
  );
}
