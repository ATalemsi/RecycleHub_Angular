import { createAction, props } from '@ngrx/store';
import { User} from "../../../shared/models/user.model";

// Inscription
export const register = createAction(
  '[Auth] Register',
  props<{ user: User }>()
);
export const registerSuccess = createAction('[Auth] Register Success');
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
