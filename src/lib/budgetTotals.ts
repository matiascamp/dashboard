export const IVA_RATE = 0.21;

export function calcIva(labor: number, includeIva: boolean) {
  if (!includeIva) return 0;
  return Number((Number(labor) * IVA_RATE).toFixed(2));
}

export function calcBudgetTotal(materialPrice: number, labor: number, includeIva: boolean) {
  return Number(materialPrice) + Number(labor) + calcIva(labor, includeIva);
}
