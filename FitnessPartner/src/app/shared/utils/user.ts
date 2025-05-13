export interface User {
  id?: string;
  fName: string | null;
  lName: string | null;
  email: string | null;
  password: string | null;
  mobile?: string;
  gender?: string;
  avatar?: string;
}
