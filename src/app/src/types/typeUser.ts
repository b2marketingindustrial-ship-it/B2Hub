export type User = {
  id: string;
  name: string;
  role: "guest" | "cliente" | "admin" | "ceo";
  email: string;
  companyName?: string;
};
