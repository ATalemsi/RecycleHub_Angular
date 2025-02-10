import { Component } from '@angular/core';
import {Store} from "@ngrx/store";
import {login} from "../../../core/state/auth/auth.actions";
import {FormsModule} from "@angular/forms";
import {selectError, selectLoading} from "../../../core/state/auth/auth.selectors";
import {Router, RouterLink} from "@angular/router";
import {AsyncPipe, NgIf} from "@angular/common";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    AsyncPipe,
    NgIf,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  error$ = this.store.select(selectError);
  loading$ = this.store.select(selectLoading);

  // Objets pour gérer les erreurs par champ
  formErrors = {
    email: '',
    password: '',
    general: ''
  };

  constructor(private readonly store: Store, private readonly router: Router) {}

  onSubmit() {
    // Réinitialiser les erreurs
    this.resetErrors();

    // Validation des inputs
    if (!this.email && !this.password) {
      this.formErrors.general = "Tous les champs sont obligatoires.";
      return;
    }

    if (!this.email) {
      this.formErrors.email = "L'email est requis.";
      return;
    }

    if (!this.password) {
      this.formErrors.password = "Le mot de passe est requis.";
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.formErrors.email = "Veuillez entrer une adresse e-mail valide.";
      return;
    }

    // Vérification de l'utilisateur dans localStorage
    const usersJson = localStorage.getItem("recyclehub-users");
    const users = usersJson ? JSON.parse(usersJson) : [];
    const user = users.find((u: any) => u.email === this.email);

    if (!user) {
      this.formErrors.email = "Cet utilisateur n'existe pas.";
      return;
    }

    if (user.password !== this.password) {
      this.formErrors.password = "Mot de passe incorrect.";
      return;
    }

    // Si tout est bon, on dispatch l'action
    this.store.dispatch(login({ email: this.email, password: this.password }));
  }

  private resetErrors() {
    this.formErrors = {
      email: '',
      password: '',
      general: ''
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
