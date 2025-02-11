import { Component } from "@angular/core"
import  { User} from "../../../shared/models/user.model"; //Example path, adjust as needed.
import  { VoucherConfig} from "../../../shared/models/voucher-config";
import {Store} from "@ngrx/store";
import {selectUser} from "../../../core/state/auth/auth.selectors";
import {Observable} from "rxjs";
import {AsyncPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {NavbarComponent} from "../../navbar/navbar.component";

@Component({
  selector: "app-voucher-display",
  templateUrl: "./voucher-display.component.html",
  styleUrl: "./voucher-display.component.scss",
  imports: [
    AsyncPipe,
    NavbarComponent,
    NgIf,
    NgForOf,
    NgClass
  ],
  standalone: true
})
export class VoucherDisplayComponent {
  private readonly usersKey = "recyclehub-users"
  currentUser$: Observable<User | null>
  voucherTiers: VoucherConfig[] = [
    {
      points: 100,
      value: 50,
      description: "Bon d'achat basique",
    },
    {
      points: 200,
      value: 120,
      description: "Bon d'achat standard",
    },
    {
      points: 500,
      value: 350,
      description: "Bon d'achat premium",
    },
  ]

  constructor(private store: Store) {
    this.currentUser$ = this.store.select(selectUser)
  }

  ngOnInit(): void {}

  isVoucherEligible(requiredPoints: number, userPoints: number): boolean {
    return userPoints >= requiredPoints
  }

  redeemVoucher(tier: VoucherConfig): void {
    const userString = localStorage.getItem("loggedInUser")
    const usersString = localStorage.getItem(this.usersKey)

    if (userString && usersString) {
      const currentUser: User = JSON.parse(userString)
      const users: User[] = JSON.parse(usersString)
      const currentPoints = currentUser.points || 0

      if (currentPoints >= tier.points) {

        currentUser.points = currentPoints - tier.points

        // Update loggedInUser
        localStorage.setItem("loggedInUser", JSON.stringify(currentUser))

        // Update user in users array
        const userIndex = users.findIndex((u) => u.id === currentUser.id)
        if (userIndex !== -1) {
          users[userIndex] = {
            ...users[userIndex],
            points: currentUser.points,
          }
          // Update users in localStorage
          localStorage.setItem(this.usersKey, JSON.stringify(users))
        }

        // Show success message
        alert(`Voucher redeemed successfully! You received a ${tier.value} Dh voucher.`)
      } else {
        alert(`You need ${tier.points - currentPoints} more points to redeem this voucher.`)
      }
    }
  }

  getCurrentUserPoints(): number {
    const userString = localStorage.getItem("loggedInUser")
    if (userString) {
      const user: User = JSON.parse(userString)
      return user.points || 0
    }
    return 0
  }

  calculateSavings(points: number, value: number): number {
    return Number(((value / points) * 100).toFixed(2))
  }
}

