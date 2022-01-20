export type Platform = 'apple' | 'google' | 'windows' | 'stripe';

export type SubscriptionPeriodUnit =
  'Day' | 'Week' | 'Month' | 'Year';

export type DiscountPaymentMode =
  'FreeTrial';

export type DiscountType =
  'Subscription';

export type ProductType =
  'application' |
  'paid subscription' |
  'subscription' |
  'consumable' |
  'non consumable' |
  'product' |
  'non renewing subscription';

export type RenewalIntent = 'Lapse' | 'Renew';

export type PriceConsentStatus = 'Notified' | 'Agreed';

export type CancelationReason =
  '' // - Not canceled
  | 'Developer' // – Subscription canceled by the developer.
  | 'System' // – Subscription canceled by the system for an unspecified reason.
  | 'System.Replaced' // – Subscription upgraded or downgraded to a new subscription.
  | 'System.ProductUnavailable' // – Product not available for purchase at the time of renewal.
  | 'System.BillingError' // – Billing error; for example customer’s payment information is no longer valid.
  | 'System.Deleted' // - Transaction is gone; It has been deleted.
  | 'Customer' // – Subscription canceled by the user for an unspecified reason.
  | 'Customer.TechnicalIssues' // – Customer canceled their transaction due to an actual or perceived issue within your app.
  | 'Customer.PriceIncrease' // – Customer did not agree to a recent price increase. See also priceConsentStatus.
  | 'Customer.Cost' // – Customer canceled for cost-related reasons.
  | 'Customer.FoundBetterApp' // – Customer claimed to have found a better app.
  | 'Customer.NotUsefulEnough' // – Customer did not feel he is using this service enough.
  | 'Customer.OtherReason' // – Subscription canceled for another reason; for example, if the customer made the purchase accidentally.
  | 'Unknown' // – Subscription canceled for unknown reasons.
  ;

export interface DiscountDefinition {
  id?: string;
  price?: string;
  priceMicros?: number;
  paymentMode?: DiscountPaymentMode
  period?: number;
  type?: DiscountType;
  periodUnit?: SubscriptionPeriodUnit;
}

export interface PrePaginated<T> {
  all: ReadonlyArray<T>;
  skip: number;
  limit: number;
  array: Array<T>;
}

export interface Paginated<T> {
  paging: {
    skip: number;
    limit: number;
    total: number;
  },
  rows: Array<T>;
}
