import { Component,  OnInit } from "@angular/core"
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms"
import  { User } from "../../../shared/models/user.model"
import  { Store } from "@ngrx/store"
import {
  addWasteRequest,
  updateWasteRequest,
} from "../../../core/state/collection-requests/collection-requests.actions"
import  { Router, ActivatedRoute } from "@angular/router"
import {combineLatest, Observable} from "rxjs"
import {
  selectAllWasteRequests,
  selectWasteRequestById,
  selectWasteRequestError,
  selectWasteRequestLoading,
} from "../../../core/state/collection-requests/collection-requests.selectors"
import { AsyncPipe, NgIf } from "@angular/common"
import  { WasteRequest } from "../../../shared/models/collection-request.model"
import { NavbarComponent } from "../../navbar/navbar.component"
import {map} from "rxjs/operators";

@Component({
  selector: "app-collection-request-form",
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, AsyncPipe, NavbarComponent],
  templateUrl: "./collection-request-form.component.html",
  styleUrl: "./collection-request-form.component.scss",
})
export class CollectionRequestFormComponent implements OnInit {
  wasteRequestForm: FormGroup
  error$: Observable<any>
  loading$: Observable<boolean>
  isEditMode = false
  requestId: string | null = null
  maxSimultaneousRequests = 3
  maxTotalWeight = 10000 // 10kg in grams
  currentRequestsCount$: Observable<number>
  totalWeight$: Observable<number>

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
    this.wasteRequestForm = this.initForm()
    this.error$ = this.store.select(selectWasteRequestError)
    this.loading$ = this.store.select(selectWasteRequestLoading)
    this.currentRequestsCount$ = this.store
      .select(selectAllWasteRequests)
      .pipe(map((requests) => requests.filter((r) => r.status === "pending" || r.status === "ongoing").length))
    this.totalWeight$ = this.store
      .select(selectAllWasteRequests)
      .pipe(map((requests) => requests.reduce((sum, request) => sum + request.estimatedWeight, 0)))
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.requestId = params.get("id")
      if (this.requestId) {
        this.isEditMode = true
        this.store.select(selectWasteRequestById(this.requestId)).subscribe((request) => {
          if (request) {
            // Clear existing waste types
            while (this.wasteTypes.length !== 0) {
              this.wasteTypes.removeAt(0)
            }

            // Add waste types based on the request
            if (Array.isArray(request.wasteType)) {
              request.wasteType.forEach((wasteType, index) => {
                this.addWasteType()
                this.wasteTypes.at(index).patchValue(wasteType)
              })
            } else {
              // Fallback for old data structure
              this.addWasteType()
              this.wasteTypes.at(0).patchValue({
                type: request.wasteType,
                estimatedWeight: request.estimatedWeight,
              })
            }

            // Patch other form values
            this.wasteRequestForm.patchValue({
              id: request.id,
              collectionAddress: request.collectionAddress,
              preferredDateTime: request.preferredDateTime,
              additionalNotes: request.additionalNotes,
              status: request.status,
              userId: request.userId,
            })
          }
        })
      }
    })
  }

  initForm(): FormGroup {
    const currentUser = this.getCurrentUser()
    return this.fb.group({
      id: [null],
      wasteTypes: this.fb.array([this.createWasteTypeGroup()]),
      collectionAddress: [currentUser ? currentUser.address : "", Validators.required],
      preferredDateTime: ["", Validators.required],
      additionalNotes: [""],
      status: ["pending"],
      userId: [currentUser ? currentUser.id : null],
    })
  }

  createWasteTypeGroup(): FormGroup {
    return this.fb.group({
      type: ["", Validators.required],
      estimatedWeight: [null, [Validators.required, Validators.min(100)]], // Minimum 100g per waste type
    })
  }

  get wasteTypes(): FormArray {
    return this.wasteRequestForm.get("wasteTypes") as FormArray
  }

  addWasteType(): void {
    this.wasteTypes.push(this.createWasteTypeGroup())
  }

  removeWasteType(index: number): void {
    this.wasteTypes.removeAt(index)
  }

  onSubmit(): void {
    if (this.wasteRequestForm.valid) {
      const formValue = this.wasteRequestForm.value
      const totalWeight = formValue.wasteTypes.reduce(
        (sum: number, waste: { estimatedWeight: number }) => sum + waste.estimatedWeight,
        0,
      )

      combineLatest([this.currentRequestsCount$, this.totalWeight$]).subscribe(([count, currentTotalWeight]) => {
        if (!this.isEditMode && count >= this.maxSimultaneousRequests) {
          this.error$ = new Observable((observer) =>
            observer.next("Vous avez atteint le nombre maximum de demandes simultanées."),
          )
        } else if (currentTotalWeight + totalWeight > this.maxTotalWeight) {
          this.error$ = new Observable((observer) =>
            observer.next("Le poids total de toutes les collectes ne peut pas dépasser 10kg."),
          )
        } else {
          const wasteRequest: Partial<WasteRequest> = {
            ...formValue,
            estimatedWeight: totalWeight,
          }

          if (this.isEditMode) {
            this.store.dispatch(updateWasteRequest({ request: wasteRequest as WasteRequest }))
          } else {
            const { id, ...newRequest } = wasteRequest
            this.store.dispatch(addWasteRequest({ request: newRequest as WasteRequest }))
          }
          this.router.navigate(["/collections"])
        }
      })
    }
  }

  onReset(): void {
    this.wasteRequestForm.reset()
    if (this.isEditMode) {
      this.router.navigate(["/collections"])
    }
  }

  private getCurrentUser(): User | null {
    const userString = localStorage.getItem("loggedInUser")
    return userString ? JSON.parse(userString) : null
  }
}

