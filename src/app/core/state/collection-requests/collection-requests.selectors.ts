import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WasteRequest } from '../../../shared/models/collection-request.model';
import { State } from './collection-requests.reducer';

const getWasteRequestState = createFeatureSelector<State>('wasteRequests');

export const selectAllWasteRequests = createSelector(
  getWasteRequestState,
  (state: State) => state.wasteRequests
);

export const selectWasteRequestLoading = createSelector(
  getWasteRequestState,
  (state: State) => state.loading
);

export const selectWasteRequestError = createSelector(
  getWasteRequestState,
  (state: State) => state.error
);

export const selectWasteRequestById = (id: string) => createSelector(
  getWasteRequestState,
  (state: State) => state.wasteRequests.find((request: WasteRequest) => request.id === id)
);
