declare interface TaxDocument {
  /**
   * AvaTax can handle multiple different types of transactions, including Sales, Purchases, Returns and Inventory transfers.
   *
   * @param SalesInvoice - Permanent; A finalized sale made to a customer
   * @param SalesOrder - Temporary; A quote for a potential sale
   * @param PurchaseInvoice - Permanent; A purchase made from a vendor
   * @param PurchaseOrder - Temporary; A quote for identifying estimated tax to pay to a vendor
   * @param ReturnInvoice - Permanent; A finalized refund given to a customer
   * @param ReturnOrder - Temporary; A quote for a refund to a customer
   * @param InventoryTransferInvoice - Permanent; A finalized shipment of inventory from one location to another
   * @param InventoryTransferOrder -  Temporary; An estimate for shipping inventory from one location to another
   */
  type:
    | "SalesInvoice"
    | "SalesOrder"
    | "PurchaseInvoice"
    | "PurchaseOrder"
    | "ReturnInvoice"
    | "ReturnOrder"
    | "InventoryTransferInvoice"
    | "InventoryTransferOrder";
}

declare interface AvataxClientInput {
  /** Specify the name of your application here.  Should not contain any semicolons. */
  appName: string;
  /** Specify the version number of your application here.  Should not contain any semicolons. */
  appVersion: string;
  /** Specify the machine name of the machine on which this code is executing here.  Should not contain any semicolons. */
  machineName: string;
  /** Indicates which server to use; acceptable values are "sandbox" or "production", or the full URL of your AvaTax instance. */
  environment: "sandbox" | "production";
  /** Specify the timeout in milliseconds for AvaTax requests; default value 20 minutes. */
  timeout?: number;
}

declare interface WithSecurityInputUsernamePassword {
  username: string;
  password: string;
}

declare interface WithSecurityInputLicense {
  accountId: string;
  licenseKey: string;
}

declare interface WithSecurityInputBearerToken {
  bearerToken: string;
}

declare interface CreateTransactionInput {
  model: TaxDocument;
  include?: Array<string>;
}

declare class AvaTaxClient {
  constructor(input: AvaTaxClientInput) {}
  withSecurity(input: WithSecurityInputUsernamePassword): this;
  withSecurity(input: WithSecurityInputLicense): this;
  withSecurity(input: WithSecurityInputBearerToken): this {}
  createTransaction(input: CreateTransactionInput): Promise<any> {}
}

declare module "avatax" {
  export = AvaTaxClient;
}
