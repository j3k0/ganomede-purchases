import { CancelationReason, Platform, PriceConsentStatus, RenewalIntent } from "./api-types";
export type ISODate = string;

export type PurchasesCollection = { [key: string]: ApiTransaction }

export interface ApiTransaction {

  /** Identifier */
  transactionId: string;

  /** Identifier for the purchase this transaction is a part of */
  purchaseId: string;

  /** Purchased product */
  productId: string;

  /** Platform the purchase was made from */
  platform: Platform;

  /**
   * True when the transaction was made in sandbox environment.
   */
  sandbox?: boolean;

  /**
   * Time the purchase was made.
   *
   * For subscriptions this is equal to the date of the first transaction.
   * Note that it might be undefined for deleted transactions
   * (google for instance don't provide any info in that case).
   */
  purchaseDate?: ISODate;

  /**
   * Time a subscription was last renewed.
   */
  lastRenewalDate?: ISODate;

  /**
   * When the subscription is set to expire following this transaction.
   */
  expirationDate?: ISODate;

  // renewalDate?: ISODate;
  // creationDate?: ISODate;
  // isExpired?: boolean;

  /**
   * Is the subscription set to renew.
   */
  renewalIntent?: RenewalIntent;

  /**
   * When the renewal intent was changed.
   */
  renewalIntentChangeDate?: ISODate;

  /**
   * Reason for a purchase to have been cancelled.
   */
  cancelationReason?: CancelationReason;

  /**
   * True when the transaction is still pending payment.
   */
  isPending?: boolean;

  /**
   * True when the transaction has been acknowledged to the platform.
   */
  isAcknowledged?: boolean;

  /**
   * True when the transaction was consumed.
   */
  isConsumed?: boolean;

  /**
   * True when the subscription is in the grace period.
   */
  isBillingRetryPeriod?: boolean;

  /**
   * True when this is a transaction for the trial period.
   *
   * Note that a trial period is a *free* introductory period.
   */
  isTrialPeriod?: boolean;

  /**
   * True when this is the introductory period.
   */
  isIntroPeriod?: boolean;

  /**
   * Whether the user approved a price change.
   */
  priceConsentStatus?: PriceConsentStatus;

  /**
   * Identifier of a discount applied to this transaction.
   */
  discountId?: string;

  /**
   * Number of elements purchases (only meaningful for consumables).
   */
  quantity?: number;

  /**
   * Amount in USD for this transaction, when known.
   */
  amountUSD: number | null;

  /**
   * Amount in micro units (1/1000000) for this transaction, in provided currency, when known.
   */
  amountMicros: number | null;

  /**
   * Currency used to make this transaction.
   *
   * 3 letters code. Example: EUR, USD, ...
   */
  currency: string | null;

  raw?: any;
}
