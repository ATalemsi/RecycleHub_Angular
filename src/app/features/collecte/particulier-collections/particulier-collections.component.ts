  import {Component, OnDestroy, OnInit} from '@angular/core';
  import {Observable, Subject, map, takeUntil, combineLatest} from "rxjs";
  import {WasteRequest, WasteTypeWeight} from "../../../shared/models/collection-request.model";
  import {Store} from "@ngrx/store";
  import {selectUser} from "../../../core/state/auth/auth.selectors";
  import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf, TitleCasePipe} from "@angular/common";
  import {ActivatedRoute, Router, RouterLink} from "@angular/router";
  import {NavbarComponent} from "../../navbar/navbar.component";
  import {
    selectAllWasteRequests, selectWasteRequestLoading,
  } from "../../../core/state/collection-requests/collection-requests.selectors";
  import {User} from "../../../shared/models/user.model";
  import {
    deleteWasteRequest,
    loadWasteRequests
  } from "../../../core/state/collection-requests/collection-requests.actions";

  @Component({
    selector: 'app-particulier-collections',
    standalone: true,
    imports: [
      AsyncPipe,
      RouterLink,
      NgIf,
      NgForOf,
      NavbarComponent,
      DatePipe,
      TitleCasePipe,
      NgClass
    ],
    templateUrl: './particulier-collections.component.html',
    styleUrl: './particulier-collections.component.scss'
  })
  export class ParticulierCollectionsComponent  implements OnInit  {
    wasteRequests$!: Observable<WasteRequest[]>;
    currentUser$!: Observable<User | null>;
    userName$!: Observable<string>;
    loading$: Observable<boolean> = this.store.select(selectWasteRequestLoading);

    constructor(private readonly store: Store ,  private readonly router: Router , private readonly route: ActivatedRoute) {}

    ngOnInit(): void {
      this.wasteRequests$ = this.route.data.pipe(
        map((data) => data['wasteRequests'])
      );

      // Fetch current user
      this.currentUser$ = this.store.select(selectUser);
      this.userName$ = this.store.select(selectUser).pipe(
        map((user) => (user ? user.firstName : ''))
      );
      this.store.select(selectAllWasteRequests).subscribe((requests) => {
        console.log('All Waste Requests:', requests);
      });
    }

    get filteredWasteRequests$(): Observable<WasteRequest[]> {
      return combineLatest([this.currentUser$, this.wasteRequests$]).pipe(
        map(([currentUser, requests]) => {
          if (currentUser) {
            return requests.filter((request) => {
              const userId = currentUser.id;
              const requestUserId = request.userId;
              return String(requestUserId) === String(userId);
            });
          }
          return [];
        })
      );
    }

    editRequest(requestId: string): void {
      this.router.navigate(["/collections/edit", requestId])
    }

    deleteRequest(requestId: string): void {
      if (confirm("Are you sure you want to delete this request?")) {
        this.store.dispatch(deleteWasteRequest({ requestId: requestId }))
      }
    }

    private getCurrentUser(): void {
      const userString = localStorage.getItem("loggedInUser")
      if (userString) {
        this.currentUser$ = JSON.parse(userString)
      }
    }
    formatAddress(address: { street: string; city: string }): string {
      return `${address.street}, ${address.city}`
    }
    getWasteTypesDisplay(wasteTypes: WasteTypeWeight[]): string {
      return wasteTypes.map((wt) => `${wt.type} (${wt.weight}g)`).join(", ")
    }

    getImageUrl(photo: string | File): string {
      return typeof photo === 'string' ? photo : URL.createObjectURL(photo);
    }

  }
