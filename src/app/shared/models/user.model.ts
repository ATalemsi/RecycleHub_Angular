// models/user.model.ts
export interface Address {
  street: string;
  city: string;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  address: Address;
  phoneNumber: string;
  dateOfBirth: string;
  role: 'particulier' | 'collecteurs';
  profilePhoto?: string | File;
  points?: number
}
