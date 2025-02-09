import { Injectable } from "@angular/core"
import  { CanActivate, Router } from "@angular/router"
import  { AuthService } from "../core/services/auth/auth.service"

@Injectable({
  providedIn: "root",
})
export class CollectorGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  canActivate(): boolean {
    if (this.authService.getUserRole() === "collecteurs") {
      return true
    } else {
      this.router.navigate(["/profile"])
      return false
    }
  }
}

