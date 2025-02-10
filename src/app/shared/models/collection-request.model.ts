// models/collection-request.model.ts
import {Address} from "./user.model";

export interface WasteTypeWeight {
  type: string;
  weight: number;
}

export interface WasteRequest {
  id?: string;
  wasteTypes: WasteTypeWeight[];  // Changed from wasteType: string[]
  wastePhotos?: (File | string)[]
  estimatedWeight: number;  // This will be the sum of all waste type weights
  collectionAddress: Address;
  preferredDateTime: Date;
  additionalNotes?: string;
  status: 'pending' | 'occupied' | 'ongoing' | 'validated' | 'rejected';
  userId: string;
}
