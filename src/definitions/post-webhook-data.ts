import { PurchasesCollection } from "./purchases";

export type WebHookPost = {
  type: string;
  applicationUsername: string;
  purchases: PurchasesCollection,
  password: string
};
