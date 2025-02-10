import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {WasteRequest} from "../models/collection-request.model";
import {loadWasteRequests} from "../../core/state/collection-requests/collection-requests.actions";
import {selectAllWasteRequests} from "../../core/state/collection-requests/collection-requests.selectors";


@Injectable({ providedIn: 'root' })
export class WasteRequestsResolver implements Resolve<WasteRequest[]> {
  constructor(private readonly store: Store) {}

  resolve(): Observable<WasteRequest[]> {
    // Dispatch the action to load waste requests
    this.store.dispatch(loadWasteRequests());

    // Return the observable of all waste requests
    return this.store.select(selectAllWasteRequests);
  }
}
