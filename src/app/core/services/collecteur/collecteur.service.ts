import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {User} from "../../../shared/models/user.model";

@Injectable({
  providedIn: 'root'
})
export class CollecteurService {
  private readonly jsonUrl = 'assets/collecteurs.json';
  private readonly usersKey = 'recyclehub-users';

  constructor(private readonly http: HttpClient) {}

  // Charger les collecteurs depuis le fichier JSON
  loadCollecteursFromJson(): Observable<User[]> {
    return this.http.get<User[]>(this.jsonUrl);
  }

  // Sauvegarder les collecteurs dans localStorage
  saveCollecteursToLocalStorage(collecteurs: User[]): void {
    localStorage.setItem(this.usersKey, JSON.stringify(collecteurs));
  }

  // Récupérer les collecteurs depuis localStorage
  getCollecteursFromLocalStorage(): User[] {
    const data = localStorage.getItem(this.usersKey);
    return data ? JSON.parse(data) : [];
  }
}
