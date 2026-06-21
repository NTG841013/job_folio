export const MATCH_THRESHOLD = 70;

export const CURRENCY_MAP: Record<string, { symbol: string; code: string; rate: number }> = {
  us: { symbol: '$', code: 'USD', rate: 1 },
  gb: { symbol: '£', code: 'GBP', rate: 1.27 },
  au: { symbol: '$', code: 'AUD', rate: 0.66 },
  ca: { symbol: '$', code: 'CAD', rate: 0.73 },
  de: { symbol: '€', code: 'EUR', rate: 1.08 },
  fr: { symbol: '€', code: 'EUR', rate: 1.08 },
  in: { symbol: '₹', code: 'INR', rate: 0.012 },
  br: { symbol: 'R$', code: 'BRL', rate: 0.18 },
  za: { symbol: 'R', code: 'ZAR', rate: 0.054 },
  nl: { symbol: '€', code: 'EUR', rate: 1.08 },
  at: { symbol: '€', code: 'EUR', rate: 1.08 },
  nz: { symbol: '$', code: 'NZD', rate: 0.61 },
  pl: { symbol: 'zł', code: 'PLN', rate: 0.25 },
  it: { symbol: '€', code: 'EUR', rate: 1.08 },
  mx: { symbol: '$', code: 'MXN', rate: 0.055 },
  sg: { symbol: '$', code: 'SGD', rate: 0.74 },
};

export function formatSalary(min: number, max: number | undefined, country: string): string {
  const config = CURRENCY_MAP[country.toLowerCase()] || CURRENCY_MAP.us;
  const { symbol, rate } = config;
  
  const minK = Math.round(min / 1000);
  const maxK = max ? Math.round(max / 1000) : null;
  
  const localStr = maxK && maxK !== minK
    ? `${symbol}${minK}k - ${symbol}${maxK}k`
    : `${symbol}${minK}k`;

  // If not USD, also show approximate USD
  if (country.toLowerCase() !== 'us') {
    const usdMinK = Math.round((min * rate) / 1000);
    const usdMaxK = max ? Math.round((max * rate) / 1000) : null;
    const usdStr = usdMaxK && usdMaxK !== usdMinK
      ? `$${usdMinK}k - $${usdMaxK}k`
      : `$${usdMinK}k`;
    
    return `${localStr} (~${usdStr})`;
  }

  return localStr;
}

export function formatDistanceToNow(date: Date | string | number): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return new Date(date).toLocaleDateString();
  }
  if (days > 0) {
    return days === 1 ? 'Yesterday' : `${days} days ago`;
  }
  if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
  }
  return 'Just now';
}
