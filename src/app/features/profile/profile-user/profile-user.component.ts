import { Component,  OnInit,  OnDestroy } from "@angular/core"
import { selectError, selectLoading, selectUser } from "../../../core/state/auth/auth.selectors"
import  { Store } from "@ngrx/store"
import  { AuthService } from "../../../core/services/auth/auth.service"
import  { Router } from "@angular/router"
import { AsyncPipe, NgIf } from "@angular/common"
import  { AuthState } from "../../../core/state/auth/auth.reducer"
import {  Observable, Subject,  Subscription, takeUntil } from "rxjs"
import  { User } from "../../../shared/models/user.model"
import {  FormBuilder,  FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { deleteAccount, updateProfile } from "../../../core/state/auth/auth.actions"
import { NavbarComponent } from "../../navbar/navbar.component"

@Component({
  selector: "app-profile-user",
  standalone: true,
  imports: [NgIf, AsyncPipe, ReactiveFormsModule, NavbarComponent],
  templateUrl: "./profile-user.component.html",
  styleUrl: "./profile-user.component.scss",
})
export class ProfileUserComponent implements OnInit, OnDestroy {
  user$: Observable<User | null> = this.store.select(selectUser)
  error$: Observable<string | null> = this.store.select(selectError)
  loading$: Observable<boolean> = this.store.select(selectLoading)
  profileForm: FormGroup
  isEditing = false
  showPassword = false
  private userSubscription!: Subscription
  private readonly destroy$ = new Subject<void>()
  profilePhotoUrl: string | null = null

  constructor(
    private readonly store: Store<{ auth: AuthState }>,
    private readonly fb: FormBuilder,
  ) {
    this.profileForm = this.fb.group(
      {
        id: [""],
        firstName: ["", Validators.required],
        lastName: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        phoneNumber: ["", Validators.required],
        address: this.fb.group({
          street: ["", [Validators.required, Validators.minLength(5)]],
          city: ["", [Validators.required, Validators.minLength(2)]],
        }),
        dateOfBirth: ["", Validators.required],
        password: ["", [Validators.minLength(6)]],
        confirmPassword: [""],
        role: [""],
        points: [""],
      },
      { validator: this.passwordMatchValidator },
    )
  }

  ngOnInit() {
    this.userSubscription = this.user$.subscribe((user) => {
      if (user) {
        this.profileForm.patchValue({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: {
            street: user.address.street,
            city: user.address.city,
          },
          dateOfBirth: user.dateOfBirth,
          role: user.role,
          points: user.points,
        })
        if (user.profilePhoto) {
          if (typeof user.profilePhoto === "string") {
            this.profilePhotoUrl = user.profilePhoto
          } else if (user.profilePhoto instanceof File) {
            this.convertToBase64(user.profilePhoto)
          }
        } else {
          this.profilePhotoUrl = null
        }
      }
    })
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe()
    this.destroy$.next()
    this.destroy$.complete()
  }

  toggleEdit() {
    this.isEditing = !this.isEditing
    if (!this.isEditing) {
      this.profileForm.patchValue({
        password: "",
        confirmPassword: "",
      })
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const updatedUser = { ...this.profileForm.value }
      if (!updatedUser.password) {
        delete updatedUser.password
        delete updatedUser.confirmPassword
      }
      this.store.dispatch(updateProfile({ user: updatedUser }))
      this.isEditing = false
    }
  }

  onDeleteAccount() {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      this.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
        if (user) {
          this.store.dispatch(deleteAccount({ userId: user.id }))
        }
      })
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get("password")
    const confirmPassword = form.get("confirmPassword")
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true })
    } else {
      confirmPassword?.setErrors(null)
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      this.convertToBase64(file)
      this.profileForm.patchValue({ profilePhoto: file })
    }
  }

  private convertToBase64(file: File): void {
    const reader = new FileReader()
    reader.onload = (e: any) => {
      this.profilePhotoUrl = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

