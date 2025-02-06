import { createAction, props } from '@ngrx/store';
import { User } from "../../../shared/models/user.model";

// Inscription
export const register = createAction(
  '[Auth] Register',
  props<{ user: User }>()
);
export const registerSuccess = createAction("[Auth] Register Success", props<{ user: User }>())
export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

// Connexion
export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);
export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User }>()
);
export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Déconnexion
export const logout = createAction('[Auth] Logout');

// Mise à jour du profil
export const updateProfile = createAction(
  '[Auth] Update Profile',
  props<{ user: User }>()
);
export const updateProfileSuccess = createAction(
  '[Auth] Update Profile Success',
  props<{ user: User }>()
);
export const updateProfileFailure = createAction(
  '[Auth] Update Profile Failure',
  props<{ error: string }>()
);

// Suppression du compte
export const deleteAccount = createAction(
  '[Auth] Delete Account',
  props<{ userId: string }>()
);
export const deleteAccountSuccess = createAction('[Auth] Delete Account Success');
export const deleteAccountFailure = createAction(
  '[Auth] Delete Account Failure',
  props<{ error: string }>()
);

// Action pour charger les collecteurs depuis JSON
export const loadCollecteurs = createAction('[Collecteurs] Load Collecteurs');

// Succès du chargement
export const loadCollecteursSuccess = createAction(
  '[Collecteurs] Load Collecteurs Success',
  props<{ collecteurs: User[] }>()
);

// Échec du chargement
export const loadCollecteursFailure = createAction(
  '[Collecteurs] Load Collecteurs Failure',
  props<{ error: string }>()
);
// Vérifier l'authentification (Check Authentication)
export const checkAuth = createAction('[Auth] Check Authentication');
export const checkAuthSuccess = createAction(
  '[Auth] Check Authentication Success',
  props<{ user: User }>()
);
export const checkAuthFailure = createAction(
  '[Auth] Check Authentication Failure',
  props<{ error: string }>()
);

export const hydrateState = createAction("[Auth] Hydrate State")
export const hydrateStateSuccess = createAction("[Auth] Hydrate State Success", props<{ user: User | null }>())
