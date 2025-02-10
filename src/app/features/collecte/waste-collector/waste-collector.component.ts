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
import {AsyncPipe, NgClass, NgForOf, NgIf} from "@angular/common"
import { NavbarComponent } from "../../navbar/navbar.component"
import  { User } from "../../../shared/models/user.model"

interface PointsConfig {
  [key: string]: number
  plastic: number
  glass: number
  paper: number
  metal: number
}

interface VoucherConfig {
  points: number
  value: number
}

type WasteRequestStatus = WasteRequest["status"]

@Component({
  selector: "app-waste-collector",
  standalone: true,
  imports: [NgForOf, AsyncPipe, NgIf, NavbarComponent, NgClass],
  templateUrl: "./waste-collector.component.html",
  styleUrl: "./waste-collector.component.scss",
})
export class WasteCollectorComponent implements OnInit {
  wasteRequests$: Observable<WasteRequest[]>
  filteredRequests$: Observable<WasteRequest[]>
  loading$: Observable<boolean>
  error$: Observable<any>
  currentUser$: Observable<User | null>

  private readonly pointsConfig: PointsConfig = {
    plastic: 2, // 2 points/kg
    glass: 1, // 1 point/kg
    paper: 1, // 1 point/kg
    metal: 5, // 5 points/kg
  }

  private readonly voucherConfig: VoucherConfig[] = [
    { points: 100, value: 50 },
    { points: 200, value: 120 },
    { points: 500, value: 350 },
  ]

  private readonly usersKey = "recyclehub-users"

  constructor(private readonly store: Store) {
    this.wasteRequests$ = this.store.select(selectAllWasteRequests)
    this.loading$ = this.store.select(selectWasteRequestLoading)
    this.error$ = this.store.select(selectWasteRequestError)
    this.currentUser$ = this.store.select(selectUser)

    // Filter requests based on collector's city
    this.filteredRequests$ = combineLatest([this.wasteRequests$, this.currentUser$]).pipe(
      map(([requests, user]) => {
        if (!user) return []
        return requests.filter(
          (request) => request.collectionAddress.city.toUpperCase() === user.address.city.toUpperCase(),
        )
      }),
    )
  }

  ngOnInit() {
    this.store.dispatch(loadWasteRequests())
  }

  private updateUserPoints(userId: string, pointsToAdd: number): void {
    const usersString = localStorage.getItem(this.usersKey)

    if (usersString) {
      const users: User[] = JSON.parse(usersString)
      const userIndex = users.findIndex((u) => u.id === userId)

      if (userIndex !== -1) {
        // Update points for the particulier user
        users[userIndex] = {
          ...users[userIndex],
          points: (users[userIndex].points || 0) + Math.floor(pointsToAdd),
        }

        // Update users in localStorage
        localStorage.setItem(this.usersKey, JSON.stringify(users))

        // If this particulier user is currently logged in, update their session data too
        const loggedInUserString = localStorage.getItem("loggedInUser")
        if (loggedInUserString) {
          const loggedInUser: User = JSON.parse(loggedInUserString)
          if (loggedInUser.id === userId) {
            loggedInUser.points = users[userIndex].points
            localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser))
          }
        }

        // Show success message with user name
        const userName = `${users[userIndex].firstName} ${users[userIndex].lastName}`
        alert(`${Math.floor(pointsToAdd)} points have been awarded to ${userName}`)
      }
    }
  }

  updateRequestStatus(request: WasteRequest, newStatus: WasteRequestStatus) {
    if (newStatus && newStatus !== request.status) {
      // If status is changing to validated, calculate and award points
      if (newStatus === "validated") {
        const pointsEarned = this.calculatePoints(request.wasteTypes)
        // Pass the particulier's userId from the request
        this.updateUserPoints(request.userId, pointsEarned)
      }
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

  calculatePoints(wasteTypes: WasteTypeWeight[]): number {
    return wasteTypes.reduce((total, waste) => {
      const pointsPerKg = this.pointsConfig[waste.type.toLowerCase()] || 0
      // Convert grams to kg for points calculation
      const weightInKg = waste.weight / 1000
      return total + pointsPerKg * weightInKg
    }, 0)
  }

  getPointsPreview(wasteTypes: WasteTypeWeight[]): string {
    const points = this.calculatePoints(wasteTypes)
    return `${Math.floor(points)} points`
  }

  getVoucherOptions(points: number): VoucherConfig[] {
    return this.voucherConfig.filter((voucher) => points >= voucher.points)
  }


}

