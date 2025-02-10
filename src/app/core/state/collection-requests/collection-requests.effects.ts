import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import * as WasteRequestActions from './collection-requests.actions';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { WasteRequestService} from "../../services/collection-request/collection-request.service";

@Injectable()
export class WasteRequestEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly wasteRequestService: WasteRequestService,
    private readonly store: Store
  ) {}

  loadWasteRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WasteRequestActions.loadWasteRequests),
      mergeMap(() => {
        const requests = this.wasteRequestService.getWasteRequests();
        return of(WasteRequestActions.loadWasteRequestsSuccess({ requests }));
      })
    )
  );


  addWasteRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WasteRequestActions.addWasteRequest),
      mergeMap((action) =>
        this.wasteRequestService.addWasteRequest(action.request).pipe(
          map((request) => WasteRequestActions.addWasteRequestSuccess({ request })),
          catchError((error) => of(WasteRequestActions.addWasteRequestFailure({ error }))),
        ),
      ),
    ),
  )

  updateWasteRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WasteRequestActions.updateWasteRequest),
      mergeMap((action) =>
        this.wasteRequestService.updateWasteRequest(action.request).pipe(
          map((request) => WasteRequestActions.updateWasteRequestSuccess({ request })),
          catchError((error) => of(WasteRequestActions.updateWasteRequestFailure({ error }))),
        ),
      ),
    ),
  )

  updateWasteRequestStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WasteRequestActions.updateWasteRequestStatus),
      mergeMap((action) =>
        this.wasteRequestService.updateWasteRequestStatus(action.request, action.newStatus).pipe(
          map((updatedRequest) => WasteRequestActions.updateWasteRequestStatusSuccess({ updatedRequest })),
          catchError((error) => of(WasteRequestActions.updateWasteRequestStatusFailure({ error: error.message }))),
        ),
      ),
    ),
  )

  deleteWasteRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WasteRequestActions.deleteWasteRequest),
      mergeMap(action => {
        this.wasteRequestService.deleteWasteRequest(action.requestId);
        return of(WasteRequestActions.loadWasteRequests());
      })
    )
  );
}
