export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
  phoneNumber: string;
  dateOfBirth: string;
  role: 'particulier' | 'collecteur';
  profilePhoto?: string; // Optional profile photo URL
}
