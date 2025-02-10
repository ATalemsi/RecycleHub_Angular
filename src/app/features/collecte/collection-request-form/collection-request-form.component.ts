// collection-request-form.component.ts
import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import { User } from "../../../shared/models/user.model";
import { Store } from "@ngrx/store";
import {
  addWasteRequest,
  updateWasteRequest,
} from "../../../core/state/collection-requests/collection-requests.actions";
import { Router, ActivatedRoute } from "@angular/router";
import {combineLatest, first, Observable, of} from "rxjs";
import {
  selectAllWasteRequests,
  selectWasteRequestById,
  selectWasteRequestError,
  selectWasteRequestLoading,
} from "../../../core/state/collection-requests/collection-requests.selectors";
import { AsyncPipe, NgIf, NgFor } from "@angular/common";
import {WasteRequest, WasteTypeWeight} from "../../../shared/models/collection-request.model";
import { NavbarComponent } from "../../navbar/navbar.component";
import { map } from "rxjs/operators";

interface WasteTypeOption {
  id: string;
  label: string;
  value: string;
  weight?: number;
}

@Component({
  selector: "app-collection-request-form",
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, AsyncPipe, NavbarComponent],
  templateUrl: "./collection-request-form.component.html",
  styleUrl: "./collection-request-form.component.scss",
})
export class CollectionRequestFormComponent implements OnInit {
  wasteRequestForm!: FormGroup
  error$: Observable<any>
  loading$: Observable<boolean>
  isEditMode = false
  requestId: string | null = null
  wasteRequests$!: Observable<WasteRequest[]>
  maxTotalWeight = 10000 // 10kg in grams
  currentRequestsCount$: Observable<number>
  totalWeight$: Observable<number>

  wasteTypes: WasteTypeOption[] = [
    { id: "plastic", label: "Plastique", value: "plastic" },
    { id: "glass", label: "Verre", value: "verre" },
    { id: "paper", label: "Papier", value: "papier" },
    { id: "metal", label: "Métal", value: "metal" },
  ]

  wastePhotos: (File | string)[] = []
  maxFileSize = 5 * 1024 * 1024 // 5MB
  maxFiles = 5
  imagePreviewUrls: string[] = []

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
    this.initializeForm()
    this.error$ = this.store.select(selectWasteRequestError)
    this.loading$ = this.store.select(selectWasteRequestLoading)
    this.currentRequestsCount$ = this.store
      .select(selectAllWasteRequests)
      .pipe(map((requests) => requests.filter((r) => r.status === "pending" || r.status === "ongoing").length))
    this.totalWeight$ = this.store
      .select(selectAllWasteRequests)
      .pipe(map((requests) => requests.reduce((sum, request) => sum + request.estimatedWeight, 0)))
    this.wasteRequests$ = this.store.select(selectAllWasteRequests)
  }

  private initializeForm(): void {
    const currentUser = this.getCurrentUser()

    this.wasteRequestForm = this.fb.group({
      id: [null],
      wasteTypes: this.fb.array([]),
      collectionAddress: this.fb.group({
        street: ["", [Validators.required, Validators.minLength(5)]],
        city: ["", [Validators.required, Validators.minLength(2)]],
      }),
      preferredDateTime: ["", [Validators.required, this.dateTimeValidator()]],
      additionalNotes: [""],
      status: ["pending"],
      userId: [currentUser?.id || null],
      wastePhotos: this.fb.array([]),
    })

    // Initialize waste types with weights
    this.wasteTypes.forEach((type) => {
      const typeGroup = this.fb.group({
        type: [type.id],
        selected: [false],
        weight: [0, [Validators.min(0), Validators.max(10000)]],
      })

      // Update weight validation when selected changes
      typeGroup.get("selected")?.valueChanges.subscribe((selected) => {
        const weightControl = typeGroup.get("weight")
        if (selected) {
          weightControl?.setValidators([Validators.required, Validators.min(1000), Validators.max(10000)])
        } else {
          weightControl?.setValidators([Validators.min(0), Validators.max(10000)])
          weightControl?.setValue(0)
        }
        weightControl?.updateValueAndValidity()
      })
      ;(this.wasteRequestForm.get("wasteTypes") as FormArray).push(typeGroup)
    })

    // Add validator for at least one waste type selected
    this.wasteRequestForm.get("wasteTypes")?.setValidators(this.atLeastOneSelected())
    this.wasteRequestForm.get("wasteTypes")?.updateValueAndValidity()
  }

  get wasteTypesFormArray() {
    return this.wasteRequestForm.get("wasteTypes") as FormArray
  }

  getTotalWeight(): number {
    return this.wasteTypesFormArray.controls.reduce((total, control) => {
      const group = control as FormGroup
      return group.get("selected")?.value ? total + (group.get("weight")?.value || 0) : total
    }, 0)
  }

  private dateTimeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return { required: true }
      }

      const selectedDate = new Date(control.value)
      const today = new Date()

      if (selectedDate < today) {
        return { pastDate: true }
      }

      const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())

      if (selectedDateOnly.getTime() === todayOnly.getTime()) {
        const hours = selectedDate.getHours()
        if (hours < 9 || hours >= 18) {
          return { invalidTime: true }
        }
      }

      return null
    }
  }

  atLeastOneSelected(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!(control instanceof FormArray)) {
        return null
      }
      const hasSelected = control.controls.some((group) => (group as FormGroup).get("selected")?.value === true)
      return hasSelected ? null : { noTypeSelected: true }
    }
  }

  onFileSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (this.isValidImageFile(file) && this.wastePhotos.length < this.maxFiles && file.size <= this.maxFileSize) {
          this.wastePhotos.push(file)
          this.addImagePreview(file)
          ;(this.wasteRequestForm.get("wastePhotos") as FormArray).push(this.fb.control(file))
        }
      }
    }
  }

  private isValidImageFile(file: File): boolean {
    const acceptedImageTypes = ["image/jpeg", "image/png", "image/gif"]
    return acceptedImageTypes.includes(file.type)
  }

  private addImagePreview(file: File): void {
    const reader = new FileReader()
    reader.onload = (e: any) => {
      this.imagePreviewUrls.push(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  removeImage(index: number): void {
    this.wastePhotos.splice(index, 1)
    this.imagePreviewUrls.splice(index, 1)
    ;(this.wasteRequestForm.get("wastePhotos") as FormArray).removeAt(index)
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.requestId = params.get("id");
      if (this.requestId) {
        this.isEditMode = true;
        this.store.select(selectWasteRequestById(this.requestId)).subscribe((request) => {
          if (request) {
            this.patchFormWithRequest(request);
          }
        });
      }
    });
  }
  private patchFormWithRequest(request: WasteRequest): void {
    // Update waste types
    this.wasteTypesFormArray.clear();
    this.wasteTypes.forEach((type) => {
      const wasteType = request.wasteTypes.find(wt => wt.type === type.id);
      this.wasteTypesFormArray.push(this.fb.group({
        type: [type.id],
        selected: [!!wasteType],
        weight: [wasteType ? wasteType.weight : 0, [Validators.min(0), Validators.max(10000)]],
      }));
    });

    // Update other form values
    this.wasteRequestForm.patchValue({
      id: request.id,
      collectionAddress: request.collectionAddress,
      preferredDateTime: request.preferredDateTime,
      additionalNotes: request.additionalNotes,
      status: request.status,
      userId: request.userId,
    });

    // Update waste photos
    this.wastePhotos = [];
    this.imagePreviewUrls = [];
    const photoFormArray = this.wasteRequestForm.get("wastePhotos") as FormArray;
    photoFormArray.clear();
    if (request.wastePhotos) {
      request.wastePhotos.forEach((photo) => {
        this.wastePhotos.push(photo);
        photoFormArray.push(this.fb.control(photo));
        if (typeof photo === "string") {
          this.imagePreviewUrls.push(photo);
        } else {
          this.addImagePreview(photo);
        }
      });
    }
  }

  getWasteTypesDisplay(wasteTypes: WasteTypeWeight[]): string {
    return wasteTypes.map((wt) => `${wt.type} (${wt.weight}g)`).join(", ")
  }

  onSubmit(): void {
    if (this.wasteRequestForm.valid) {
      const formValue = this.wasteRequestForm.value
      const totalWeight = this.getTotalWeight()
      const currentUser = this.getCurrentUser()

      if (totalWeight === 0) {
        this.error$ = of("Le poids total doit être supérieur à 0g")
        return
      }

      combineLatest([this.wasteRequests$])
        .pipe(first())
        .subscribe(([allRequests]) => {
          const userRequests = allRequests.filter((req) => req.userId === currentUser?.id)
          const activeRequestsCount = userRequests.filter(
            (req) => req.status === "pending" || req.status === "ongoing",
          ).length

          if (!this.isEditMode && activeRequestsCount >= 3) {
            this.error$ = of("Vous avez déjà 3 demandes en attente ou en cours.")
            return
          }

          const userTotalWeight = userRequests.reduce((sum, request) => sum + request.estimatedWeight, 0)

          if (!this.isEditMode && userTotalWeight + totalWeight > this.maxTotalWeight) {
            this.error$ = of("Le poids total de vos collectes dépasse la limite de 10kg.")
            return
          }

          const selectedWasteTypes = this.wasteTypesFormArray.controls
            .filter((control) => (control as FormGroup).get("selected")?.value)
            .map((control) => ({
              type: (control as FormGroup).get("type")?.value,
              weight: (control as FormGroup).get("weight")?.value,
            }))

          const wasteRequest: WasteRequest = {
            ...(this.isEditMode ? { id: this.requestId! } : {}),
            wasteTypes: selectedWasteTypes,
            estimatedWeight: totalWeight,
            collectionAddress: formValue.collectionAddress,
            preferredDateTime: new Date(formValue.preferredDateTime),
            additionalNotes: formValue.additionalNotes || "",
            status: formValue.status as WasteRequest["status"],
            userId: formValue.userId,
            wastePhotos: this.wastePhotos,
          }

          if (this.isEditMode) {
            this.store.dispatch(updateWasteRequest({ request: wasteRequest }))
          } else {
            this.store.dispatch(addWasteRequest({ request: wasteRequest }))
          }

          this.router.navigate(["/collections"])
        })
    }
  }

  onReset(): void {
    this.wasteRequestForm.reset({
      wasteTypes: this.wasteTypesFormArray.controls.map(() => ({
        selected: false,
        weight: 0,
      })),
      collectionAddress: {
        street: "",
        city: "",
      },
      status: "pending",
    })
    this.wastePhotos = []
    this.imagePreviewUrls = []
    ;(this.wasteRequestForm.get("wastePhotos") as FormArray).clear()
    if (this.isEditMode) {
      this.router.navigate(["/collections"])
    }
  }


  private getCurrentUser(): User | null {
    try {
      const userString = sessionStorage.getItem("loggedInUser");
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error retrieving user from sessionStorage:', error);
      return null;
    }
  }
}
