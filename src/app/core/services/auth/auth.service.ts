import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { User } from '../../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly usersKey = 'recyclehub-users';
  private readonly loggedInUserKey = 'loggedInUser'; // To store the logged-in user's information

  constructor() {}

  // Register a new user
  register(user: User): Observable<void> {
    try {
      const users = this.getUsers();
      users.push(user);
      localStorage.setItem(this.usersKey, JSON.stringify(users));
      return of(void 0);
    } catch (error) {
      return throwError(() => error);
    }
  }

  // Login user
  login(email: string, password: string): Observable<User> {
    const users = this.getUsers();
    const user = users.find((u) => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem(this.loggedInUserKey, JSON.stringify(user));
      return of(user);
    }
    return throwError(() => new Error('Invalid credentials'));
  }

  logout(): void {
    localStorage.removeItem(this.loggedInUserKey)
  }

  isAuthenticated(): Observable<boolean> {
    const user = this.getLoggedInUser();
    return of(user !== null);
  }

  getLoggedInUser(): User | null {
    const userJson = localStorage.getItem(this.loggedInUserKey);
    return userJson ? JSON.parse(userJson) : null;
  }

  updateProfile(user: User): Observable<User> {
    try {
      const users = this.getUsers();
      const index = users.findIndex((u) => u.id === user.id);
      if (index !== -1) {
        users[index] = user;
        localStorage.setItem(this.usersKey, JSON.stringify(users));
        // Update the logged-in user as well
        if (this.getLoggedInUser()?.id === user.id) {
          localStorage.setItem(this.loggedInUserKey, JSON.stringify(user));
        }
        return of(user);
      }
      return throwError(() => new Error('User not found'));
    } catch (error) {
      return throwError(() => error);
    }
  }

  deleteAccount(userId: string): Observable<void> {
    try {
      const users = this.getUsers().filter((u) => u.id !== userId);
      localStorage.setItem(this.usersKey, JSON.stringify(users));
      // If the deleted user is logged in, remove them from localStorage
      if (this.getLoggedInUser()?.id === userId) {
        localStorage.removeItem(this.loggedInUserKey);
      }
      return of(void 0);
    } catch (error) {
      return throwError(() => error);
    }
  }

  private getUsers(): User[] {
    const usersJson = localStorage.getItem(this.usersKey);
    return usersJson ? JSON.parse(usersJson) : [];
  }
}
