import { Injectable } from "@angular/core"
import { type Observable, of, throwError } from "rxjs"
import type { User} from "../../../shared/models/user.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly usersKey = "recyclehub-users"

  constructor() {}

  register(user: User): Observable<void> {
    try {
      const users = this.getUsers()
      users.push(user)
      localStorage.setItem(this.usersKey, JSON.stringify(users))
      return of(void 0)
    } catch (error) {
      return throwError(() => error)
    }
  }

  login(email: string, password: string): Observable<User> {
    const users = this.getUsers()
    const user = users.find((u) => u.email === email && u.password === password)
    if (user) {
      return of(user)
    }
    return throwError(() => new Error("Invalid credentials"))
  }

  updateProfile(user: User): Observable<User> {
    try {
      const users = this.getUsers()
      const index = users.findIndex((u) => u.id === user.id)
      if (index !== -1) {
        users[index] = user
        localStorage.setItem(this.usersKey, JSON.stringify(users))
        return of(user)
      }
      return throwError(() => new Error("User not found"))
    } catch (error) {
      return throwError(() => error)
    }
  }

  deleteAccount(userId: string): Observable<void> {
    try {
      const users = this.getUsers().filter((u) => u.id !== userId)
      localStorage.setItem(this.usersKey, JSON.stringify(users))
      return of(void 0)
    } catch (error) {
      return throwError(() => error)
    }
  }

  private getUsers(): User[] {
    const usersJson = localStorage.getItem(this.usersKey)
    return usersJson ? JSON.parse(usersJson) : []
  }
}

