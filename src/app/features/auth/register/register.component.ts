import { Component } from '@angular/core';
import { User } from "../../../shared/models/user.model";
import { Store } from "@ngrx/store";
import { register } from "../../../core/state/auth/auth.actions";
import { FormsModule } from "@angular/forms";
import { selectError, selectLoading } from "../../../core/state/auth/auth.selectors";
import { NgIf, AsyncPipe } from "@angular/common";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    AsyncPipe,
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  user: User = {
    id: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    address: {
      street: '',
      city: ''
    },
    phoneNumber: '',
    dateOfBirth: '',
    role: 'particulier',
    profilePhoto: undefined,
  };

  formErrors = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dateOfBirth: '',
    'address.street': '',
    'address.city': '',
    phoneNumber: '',
    terms: '',
    profilePhoto: "",
    general: ''
  };

  loading$ = this.store.select(selectLoading);
  error$ = this.store.select(selectError);
  termsAccepted = false;

  constructor(private readonly store: Store) {}

  onFieldChange(field: keyof typeof this.formErrors) {
    this.validateField(field);
  }

  validateField(field: keyof typeof this.formErrors) {
    switch(field) {
      case 'firstName':
        if (!this.user.firstName.trim()) {
          this.formErrors.firstName = 'Le prénom est requis';
        } else if (this.user.firstName.length < 2) {
          this.formErrors.firstName = 'Le prénom doit contenir au moins 2 caractères';
        } else {
          this.formErrors.firstName = '';
        }
        break;

      case 'lastName':
        if (!this.user.lastName.trim()) {
          this.formErrors.lastName = 'Le nom est requis';
        } else if (this.user.lastName.length < 2) {
          this.formErrors.lastName = 'Le nom doit contenir au moins 2 caractères';
        } else {
          this.formErrors.lastName = '';
        }
        break;

      case 'email':
        if (!this.user.email) {
          this.formErrors.email = 'L\'email est requis';
        } else if (!this.isValidEmail(this.user.email)) {
          this.formErrors.email = 'Format d\'email invalide';
        } else if (this.emailExists(this.user.email)) {
          this.formErrors.email = 'Cet email est déjà utilisé';
        } else {
          this.formErrors.email = '';
        }
        break;

      case 'password':
        if (!this.user.password) {
          this.formErrors.password = 'Le mot de passe est requis';
        } else if (!this.isValidPassword(this.user.password)) {
          this.formErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
        } else {
          this.formErrors.password = '';
        }
        break;

      case 'dateOfBirth':
        if (!this.user.dateOfBirth) {
          this.formErrors.dateOfBirth = 'La date de naissance est requise';
        } else if (!this.isValidAge(this.user.dateOfBirth)) {
          this.formErrors.dateOfBirth = 'Vous devez avoir au moins 18 ans';
        } else {
          this.formErrors.dateOfBirth = '';
        }
        break;

      case 'address.street':
        if (!this.user.address.street.trim()) {
          this.formErrors['address.street'] = 'La rue est requise';
        } else if (this.user.address.street.length < 5) {
          this.formErrors['address.street'] = 'Veuillez entrer une rue valide';
        } else {
          this.formErrors['address.street'] = '';
        }
        break;

      case 'address.city':
        if (!this.user.address.city.trim()) {
          this.formErrors['address.city'] = 'La ville est requise';
        } else if (this.user.address.city.length < 2) {
          this.formErrors['address.city'] = 'Veuillez entrer une ville valide';
        } else {
          this.formErrors['address.city'] = '';
        }
        break;

      case 'phoneNumber':
        if (!this.user.phoneNumber) {
          this.formErrors.phoneNumber = 'Le numéro de téléphone est requis';
        } else if (!this.isValidPhoneNumber(this.user.phoneNumber)) {
          this.formErrors.phoneNumber = 'Format de numéro de téléphone invalide';
        } else {
          this.formErrors.phoneNumber = '';
        }
        break;

      case 'profilePhoto':
        if (this.user.profilePhoto && !this.isValidImageFile(this.user.profilePhoto as File)) {
          this.formErrors.profilePhoto = "Le fichier sélectionné n'est pas une image valide"
        } else {
          this.formErrors.profilePhoto = ""
        }
        break;
    }
  }

  validateForm(): boolean {
    this.resetErrors();
    let isValid = true;

    Object.keys(this.formErrors).forEach(field => {
      this.validateField(field as keyof typeof this.formErrors);
      if (this.formErrors[field as keyof typeof this.formErrors]) {
        isValid = false;
      }
    });

    if (!this.termsAccepted) {
      this.formErrors.terms = 'Vous devez accepter les conditions d\'utilisation';
      isValid = false;
    }

    return isValid;
  }

  onSubmit() {
    if (this.validateForm()) {
      this.store.dispatch(register({ user: this.user }));
    } else {
      this.formErrors.general = 'Veuillez corriger les erreurs dans le formulaire';
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      this.user.profilePhoto = file
      this.validateField("profilePhoto")
    }
  }


  private resetErrors() {
    this.formErrors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      dateOfBirth: '',
      'address.street': '',
      'address.city': '',
      phoneNumber: '',
      terms: '',
      profilePhoto: "",
      general: ''
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    return password.length >= 6;
  }

  private isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return phoneRegex.test(phone);
  }

  private isValidAge(dateOfBirth: string): boolean {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }

    return age >= 18;
  }

  private emailExists(email: string): boolean {
    const users = JSON.parse(localStorage.getItem('recyclehub-users') || '[]');
    return users.some((user: User) => user.email === email);
  }

  private isValidImageFile(file: File): boolean {
    const acceptedImageTypes = ["image/jpeg", "image/png", "image/gif"]
    return file && acceptedImageTypes.includes(file.type)
  }
}
