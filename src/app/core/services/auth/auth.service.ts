import { Injectable } from "@angular/core"
import {from, Observable, of, throwError} from "rxjs"
import type { User } from "../../../shared/models/user.model"
import {catchError, map} from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly usersKey = "recyclehub-users"
  readonly loggedInUserKey = "loggedInUser"

  constructor() {}

  // Register a new user
  register(user: User): Observable<User> {
    return from(this.processRegistration(user)).pipe(
      map((newUser) => {
        const users = this.getUsers()
        users.push(newUser)
        localStorage.setItem(this.usersKey, JSON.stringify(users))
        localStorage.setItem(this.loggedInUserKey, JSON.stringify(newUser))
        return newUser
      }),
      catchError((error) => {
        console.error("Error during registration:", error)
        return throwError(() => error)
      }),
    )
  }

  private async processRegistration(user: User): Promise<User> {
    const newUser = { ...user, id: this.getNextId(), points: 0 }

    if (newUser.profilePhoto && newUser.profilePhoto instanceof File) {
      newUser.profilePhoto = await this.convertToBase64(newUser.profilePhoto)
    }

    return newUser
  }

  private convertToBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
      reader.readAsDataURL(file)
    })
  }

  // Login user
  login(email: string, password: string): Observable<User> {
    const users = this.getUsers()
    const user = users.find((u) => u.email === email && u.password === password)
    if (user) {
      if (typeof user.points === "undefined") {
        user.points = 0
      }

      localStorage.setItem(this.loggedInUserKey, JSON.stringify(user))
      return of(user)
    }
    return throwError(() => new Error("Invalid credentials"))
  }

  logout(): void {
    localStorage.removeItem(this.loggedInUserKey)
  }

  isAuthenticated(): Observable<boolean> {
    const user = this.getLoggedInUser()
    return of(user !== null)
  }

  getLoggedInUser(): User | null {
    const userJson = localStorage.getItem(this.loggedInUserKey)
    return userJson ? JSON.parse(userJson) : null
  }

  getUserRole(): string | null {
    const user = this.getLoggedInUser()
    return user ? user.role : null
  }

  updateProfile(user: User): Observable<User> {
    try {
      const users = this.getUsers()
      const index = users.findIndex((u) => u.id === user.id)
      if (index !== -1) {
        // If a new password is provided, update it
        if (user.password) {
          users[index] = { ...user, password: user.password }
        } else {
          // If no new password, keep the existing password
          users[index] = { ...user, password: users[index].password }
        }
        localStorage.setItem(this.usersKey, JSON.stringify(users))
        if (this.getLoggedInUser()?.id === user.id) {
          localStorage.setItem(this.loggedInUserKey, JSON.stringify(users[index]))
        }
        // Remove password from the returned user object
        const { password, ...userWithoutPassword } = users[index]
        return of(userWithoutPassword)
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
      if (this.getLoggedInUser()?.id === userId) {
        localStorage.removeItem(this.loggedInUserKey)
      }
      return of(void 0)
    } catch (error) {
      return throwError(() => error)
    }
  }

  private getUsers(): User[] {
    const usersJson = localStorage.getItem(this.usersKey)
    return usersJson ? JSON.parse(usersJson) : []
  }

  private getNextId(): string {
    const users = this.getUsers()
    const maxId = users.reduce((max, user) => {
      const userId = Number.parseInt(user.id, 10)
      return userId > max ? userId : max
    }, 0)
    return (maxId + 1).toString()
  }
}

