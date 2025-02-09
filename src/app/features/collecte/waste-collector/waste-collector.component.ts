import { Component,  OnInit } from "@angular/core"
import {  Observable, combineLatest, map } from "rxjs"
import  { WasteRequest, WasteTypeWeight } from "../../../shared/models/collection-request.model"
import  { Store } from "@ngrx/store"
import { selectUser } from "../../../core/state/auth/auth.selectors"
import {
  loadWasteRequests,
  updateWasteRequestStatus,
} from "../../../core/state/collection-requests/collection-requests.actions"
import {
  selectAllWasteRequests,
  selectWasteRequestError,
  selectWasteRequestLoading,
} from "../../../core/state/collection-requests/collection-requests.selectors"
import { AsyncPipe, NgForOf, NgIf } from "@angular/common"
import { NavbarComponent } from "../../navbar/navbar.component"
import  { User } from "../../../shared/models/user.model"

type WasteRequestStatus = WasteRequest["status"]

@Component({
  selector: "app-waste-collector",
  standalone: true,
  imports: [NgForOf, AsyncPipe, NgIf, NavbarComponent],
  templateUrl: "./waste-collector.component.html",
  styleUrl: "./waste-collector.component.scss",
})
export class WasteCollectorComponent implements OnInit {
  wasteRequests$: Observable<WasteRequest[]>
  filteredRequests$: Observable<WasteRequest[]>
  loading$: Observable<boolean>
  error$: Observable<any>
  currentUser$: Observable<User | null>

  constructor(private readonly store: Store) {
    this.wasteRequests$ = this.store.select(selectAllWasteRequests)
    this.loading$ = this.store.select(selectWasteRequestLoading)
    this.error$ = this.store.select(selectWasteRequestError)
    this.currentUser$ = this.store.select(selectUser)

    // Filter requests based on collector's city
    this.filteredRequests$ = combineLatest([this.wasteRequests$, this.currentUser$]).pipe(
      map(([requests, user]) => {
        if (!user) return []; // Return an empty array if user is undefined
        return requests.filter(
          (request) => request.collectionAddress.city.toUpperCase() === user.address.city.toUpperCase(),
        );
      }),
    );
  }

  ngOnInit() {
    this.store.dispatch(loadWasteRequests())
  }

  updateRequestStatus(request: WasteRequest, newStatus: WasteRequestStatus) {
    if (newStatus && newStatus !== request.status) {
      this.store.dispatch(updateWasteRequestStatus({ request, newStatus }))
    }
  }

  handleStatusChange(request: WasteRequest, event: Event) {
    const select = event.target as HTMLSelectElement
    const newStatus = select.value as WasteRequestStatus
    this.updateRequestStatus(request, newStatus)
  }

  getStatusOptions(currentStatus: WasteRequestStatus): { value: WasteRequestStatus; label: string }[] {
    const statusLabels = {
      pending: "En attente",
      occupied: "Occupé",
      ongoing: "En cours",
      validated: "Validé",
      rejected: "Rejeté",
    }

    let availableStatuses: WasteRequestStatus[] = []
    switch (currentStatus) {
      case "pending":
        availableStatuses = ["pending", "occupied"]
        break
      case "occupied":
        availableStatuses = ["occupied", "ongoing"]
        break
      case "ongoing":
        availableStatuses = ["ongoing", "validated", "rejected"]
        break
      default:
        availableStatuses = [currentStatus]
    }

    return availableStatuses.map((status) => ({
      value: status,
      label: statusLabels[status],
    }))
  }

  getStatusBadgeClass(status: WasteRequestStatus): string {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-semibold"
    switch (status) {
      case "pending":
        return `${baseClasses} bg-gray-100 text-gray-800`
      case "occupied":
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case "ongoing":
        return `${baseClasses} bg-blue-100 text-blue-800`
      case "validated":
        return `${baseClasses} bg-green-100 text-green-800`
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return baseClasses
    }
  }

  canChangeStatus(request: WasteRequest): boolean {
    return request.status !== "validated" && request.status !== "rejected"
  }

  getStatusLabel(status: WasteRequestStatus): string {
    const statusLabels = {
      pending: "En attente",
      occupied: "Occupé",
      ongoing: "En cours",
      validated: "Validé",
      rejected: "Rejeté",
    }
    return statusLabels[status] || status
  }

  formatAddress(address: { street: string; city: string }): string {
    return `${address.street}, ${address.city}`
  }

  getWasteTypesDisplay(wasteTypes: WasteTypeWeight[]): string {
    return wasteTypes.map((wt) => `${wt.type} (${wt.weight}g)`).join(", ")
  }
}

