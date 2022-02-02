const companyNames = process.env.NEXT_PUBLIC_COMPANY_NAMES!.split(",");
export const companyCodes = process.env
  .NEXT_PUBLIC_COMPANY_CODES!.split(",")
  .map((value, idx) => {
    const name = companyNames[idx];
    return { name, value };
  });

const priceNames = process.env.NEXT_PUBLIC_PRICE_NAMES!.split(",");
export const prices = process.env
  .NEXT_PUBLIC_PRICE_IDS!.split(",")
  .map((value, idx) => {
    const name = priceNames[idx];
    return { name, value };
  });
