import {Injectable} from "@angular/core";
import {WasteRequest} from "../models/collection-request.model";
import {Resolve} from "@angular/router";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs";
import {loadWasteRequests} from "../../core/state/collection-requests/collection-requests.actions";
import {selectAllWasteRequests} from "../../core/state/collection-requests/collection-requests.selectors";


@Injectable({providedIn: "root"})
export class WasteRequestResolver implements Resolve<WasteRequest[]>{

  constructor(private readonly  store : Store) {
  }

  resolve() : Observable<WasteRequest[]> {
    this.store.dispatch(loadWasteRequests());

    return  this.store.select(selectAllWasteRequests);
  }
}
