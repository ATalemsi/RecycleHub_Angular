export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
  phoneNumber: string;
  dateOfBirth: string;
  profilePhoto?: string; // Optionnel
  role: 'particulier' | 'collecteur'; // Rôle de l'utilisateur
}
