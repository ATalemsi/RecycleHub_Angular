export interface WasteRequest {
  id?: string;
  wasteType: 'plastic' | 'glass' | 'paper' | 'metal';
  wastePhotos?: string[];
  estimatedWeight: number;
  collectionAddress: string;
  preferredDateTime: Date;
  additionalNotes?: string;
  status: 'pending' | 'occupied' | 'ongoing' | 'validated' | 'rejected';
  userId: number;
}

