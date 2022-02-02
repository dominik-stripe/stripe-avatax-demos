declare module AvaTaxApi {
  export interface TaxDetail {
    id: number;
    transactionLineId: number;
    transactionId: number;
    country: string;
    region: string;
    exemptAmount: number;
    jurisCode: string;
    jurisName: string;
    stateAssignedNo: string;
    jurisType: string;
    jurisdictionType: string;
    nonTaxableAmount: number;
    rate: number;
    tax: number;
    taxableAmount: number;
    taxType: string;
    taxSubTypeId: string;
    taxName: string;
    taxAuthorityTypeId: number;
    taxCalculated: number;
    rateType: string;
    rateTypeCode: string;
    unitOfBasis: string;
    isNonPassThru: boolean;
    isFee: boolean;
    reportingTaxableUnits: number;
    reportingNonTaxableUnits: number;
    reportingExemptUnits: number;
    reportingTax: number;
    reportingTaxCalculated: number;
    liabilityType: string;
  }

  // See: https://developer.avalara.com/ecommerce-integration-guide/sales-tax-badge/transactions/invoice-lines/
  export interface LineInput {
    /** This is the quantity of goods or services being sold. Note that this value does not affect any totals; to determine the price-per-each, divide the amount value by the quantity value. If you do not provide quantity, the value will be assumed to be 1. Although this field is optional, some taxes are affected by dollar-amount thresholds and caps per item, and AvaTax uses the quantity and amount values to calculate this correctly. We strongly recommend providing the correct quantity for each line. */
    quantity: number;
    /** This is the total price of goods or services for this line item. This is the total, fully extended value. For example, if you specify a `quantity` of 2 and an `amount` of 10, this means that you have sold two $5 items for a total price of $10. */
    amount: number;
    /** This is how you specify the type of good or service that is being sold. If you omit the taxCode value, AvaTax defaults to treating the item as taxable Tangible Personal Property using the tax code `P0000000`. */
    taxCode?: string;
    itemCode?: string;
    description?: string;
    ref1?: string;
    /**
     * Indicates whether the amount for this line already includes tax.
     *
     * If this value is true, the final price of this line including tax will equal the value in amount.
     *
     * If this value is null or false, the final price will equal amount plus whatever taxes apply to this line. */
    taxIncluded?: boolean;
  }

  export interface Line {
    id: number;
    transactionId: number;
    lineNumber: string;
    customerUsageType: string;
    entityUseCode: string;
    description: string;
    discountAmount: number;
    exemptAmount: number;
    exemptCertId: number;
    exemptNo: string;
    isItemTaxable: boolean;
    itemCode: string;
    lineAmount: number;
    quantity: number;
    ref1: string;
    ref2: string;
    reportingDate: string;
    tax: number;
    taxableAmount: number;
    taxCalculated: number;
    taxCode: string;
    taxCodeId: number;
    taxDate: string;
    taxIncluded: boolean;
    details: TaxDetail[];
    nonPassthroughDetails: any[];
    hsCode: string;
    costInsuranceFreight: number;
    vatCode: string;
    vatNumberTypeId: number;
  }

  export interface Address {
    id: number;
    transactionId: number;
    boundaryLevel: string;
    line1: string;
    line2: string;
    line3: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
    taxRegionId: number;
    latitude: string;
    longitude: string;
  }

  export interface Summary {
    country: string;
    region: string;
    jurisType: string;
    jurisCode: string;
    jurisName: string;
    taxAuthorityType: number;
    stateAssignedNo: string;
    taxType: string;
    taxSubType: string;
    taxName: string;
    rateType: string;
    taxable: number;
    rate: number;
    tax: number;
    taxCalculated: number;
    nonTaxable: number;
    exemption: number;
  }

  export interface CreateTransactionResponse {
    id: number;
    code: string;
    companyId: number;
    date: string;
    paymentDate: string;
    status: string;
    type: string;
    batchCode: string;
    currencyCode: string;
    exchangeRateCurrencyCode: string;
    customerUsageType: string;
    entityUseCode: string;
    customerVendorCode: string;
    customerCode: string;
    exemptNo: string;
    reconciled: boolean;
    locationCode: string;
    reportingLocationCode: string;
    purchaseOrderNo: string;
    referenceCode: string;
    salespersonCode: string;
    totalAmount: number;
    totalExempt: number;
    totalDiscount: number;
    totalTax: number;
    totalTaxable: number;
    totalTaxCalculated: number;
    adjustmentReason: string;
    locked: boolean;
    version: number;
    exchangeRateEffectiveDate: string;
    exchangeRate: number;
    description: string;
    modifiedDate: Date;
    modifiedUserId: number;
    taxDate: string;
    lines: Line[];
    addresses: Address[];
    summary: Summary[];
  }
}
