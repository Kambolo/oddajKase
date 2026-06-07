export const formatMoney = (value: number) => {
  const prefix = value < 0 ? "-" : "";
  return `${prefix}€${Math.abs(value).toFixed(2)}`;
};
