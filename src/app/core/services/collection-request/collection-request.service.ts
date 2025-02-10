import { Injectable } from '@angular/core';
import { WasteRequest } from '../../../shared/models/collection-request.model';
import {from, Observable, of} from 'rxjs';
import {catchError, map} from "rxjs/operators";
type WasteRequestStatus = WasteRequest["status"]
@Injectable({
  providedIn: 'root',
})
export class WasteRequestService {
  private readonly storageKey = "wasteRequests";
  private readonly maxStorageSize = 20 * 1024 * 1024; // 4.5MB (leaving some buffer)

  constructor() {}

  addWasteRequest(request: WasteRequest): Observable<WasteRequest> {
    return from(this.processPhotos(request)).pipe(
      map((processedRequest) => {
        const requests = this.getWasteRequests();
        const newRequest = {
          ...processedRequest,
          id: `collection-${Date.now()}`,
        };
        requests.push(newRequest);
        this.saveWasteRequests(requests);
        return newRequest;
      }),
      catchError((error) => {
        console.error('Error adding waste request:', error);
        return of(error);
      })
    );
  }

  updateWasteRequest(request: WasteRequest): Observable<WasteRequest> {
    return from(this.processPhotos(request)).pipe(
      map((processedRequest) => {
        const requests = this.getWasteRequests();
        const index = requests.findIndex((r) => r.id === processedRequest.id);
        if (index !== -1 && requests[index].status === "pending") {
          requests[index] = processedRequest;
          this.saveWasteRequests(requests);
          return processedRequest;
        } else {
          throw new Error("Request not found or not in pending status");
        }
      }),
      catchError((error) => {
        console.error('Error updating waste request:', error);
        return of(error);
      })
    );
  }

  private async processPhotos(request: WasteRequest): Promise<WasteRequest> {
    if (request.wastePhotos && request.wastePhotos.length > 0) {
      const photoPromises = request.wastePhotos.map((photo) => {
        if (photo instanceof File) {
          return this.fileToBase64(photo);
        }
        return Promise.resolve(photo);
      });
      const processedPhotos = await Promise.all(photoPromises);
      return { ...request, wastePhotos: processedPhotos };
    }
    return request;
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  getWasteRequests(): WasteRequest[] {
    const storedRequests = sessionStorage.getItem(this.storageKey);
    return storedRequests ? JSON.parse(storedRequests) : [];
  }

  deleteWasteRequest(requestId: string): void {
    let requests = this.getWasteRequests();
    requests = requests.filter((r) => r.id !== requestId);
    this.saveWasteRequests(requests);
  }

  private saveWasteRequests(requests: WasteRequest[]): void {
    const data = JSON.stringify(requests);
    if (data.length > this.maxStorageSize) {
      this.cleanupOldRequests(requests);
    }
    try {
      sessionStorage.setItem(this.storageKey, data);
    } catch (error) {
      console.error('Error saving waste requests:', error);
      this.cleanupOldRequests(requests);
      sessionStorage.setItem(this.storageKey, JSON.stringify(requests));
    }
  }

  private cleanupOldRequests(requests: WasteRequest[]): void {
    // Sort requests by date (assuming newer requests have higher IDs)
    requests.sort((a, b) => parseInt(b.id!.split('-')[1]) - parseInt(a.id!.split('-')[1]));

    // Remove old requests until we're under the storage limit
    while (JSON.stringify(requests).length > this.maxStorageSize && requests.length > 0) {
      requests.pop();
    }
  }

  updateWasteRequestStatus(request: WasteRequest, newStatus: WasteRequestStatus): Observable<WasteRequest> {
    const requests = this.getWasteRequests();
    const index = requests.findIndex((r) => r.id === request.id);

    if (index !== -1) {
      const updatedRequest = { ...request, status: newStatus };
      requests[index] = updatedRequest;
      this.saveWasteRequests(requests);
      return of(updatedRequest);
    }

    return of(new Error(`Request with id ${request.id} not found`) as any);
  }
}
