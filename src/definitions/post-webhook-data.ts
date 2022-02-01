import { ApiCustomerPurchases } from "./purchases";

export type WebHookPost = ApiCustomerPurchases & {
  type: string;
  password: string
};
