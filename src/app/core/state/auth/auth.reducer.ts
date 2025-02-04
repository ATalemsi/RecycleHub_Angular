import { createReducer, on } from '@ngrx/store';
import { User} from "../../../shared/models/user.model";
import * as AuthActions from './auth.actions';

export interface AuthState {
  user: User | null;
  error: string | null;
  loading: boolean;
}

export const initialState: AuthState = {
  user: null,
  error: null,
  loading: false,
};

export const authReducer = createReducer(
  initialState,
  // Inscription
  on(AuthActions.register, (state) => ({ ...state, loading: true })),
  on(AuthActions.registerSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Connexion
  on(AuthActions.login, (state) => ({ ...state, loading: true })),
  on(AuthActions.loginSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Déconnexion
  on(AuthActions.logout, (state) => ({ ...state, user: null })),

  // Mise à jour du profil
  on(AuthActions.updateProfile, (state) => ({ ...state, loading: true })),
  on(AuthActions.updateProfileSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    error: null,
  })),
  on(AuthActions.updateProfileFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Suppression du compte
  on(AuthActions.deleteAccount, (state) => ({ ...state, loading: true })),
  on(AuthActions.deleteAccountSuccess, (state) => ({
    ...state,
    user: null,
    loading: false,
    error: null,
  })),
  on(AuthActions.deleteAccountFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);
