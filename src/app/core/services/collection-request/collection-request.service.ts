import { Injectable } from '@angular/core';
import { WasteRequest } from '../../../shared/models/collection-request.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WasteRequestService {

  private readonly storageKey = 'wasteRequests';

  constructor() {}

  addWasteRequest(request: WasteRequest): void {
    const requests = this.getWasteRequests();
    const newRequest = {
      ...request,
      id: `collection-${Date.now()}`, // Corrected template literal syntax
    };
    requests.push(newRequest);
    this.saveWasteRequests(requests);
  }


  getWasteRequests(): WasteRequest[] {
    const storedRequests = localStorage.getItem(this.storageKey);
    return storedRequests ? JSON.parse(storedRequests) : [];
  }

  updateWasteRequest(request: WasteRequest): void {
    const requests = this.getWasteRequests();
    const index = requests.findIndex(r => r.id === request.id);

    if (index !== -1 && requests[index].status === 'pending') {
      requests[index] = request;
      this.saveWasteRequests(requests);
    }
  }

  deleteWasteRequest(requestId: string): void {
    let requests = this.getWasteRequests();
    requests = requests.filter(r => r.id !== requestId);
    this.saveWasteRequests(requests);
  }

  private saveWasteRequests(requests: WasteRequest[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(requests));
  }
}
