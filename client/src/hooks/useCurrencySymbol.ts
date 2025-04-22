import { useState, useEffect } from 'react';
import { getCurrencySymbol } from '@/lib/utils';

export function useCurrencySymbol(currencyCode: string) {
  const [symbol, setSymbol] = useState(() => getCurrencySymbol(currencyCode));

  useEffect(() => {
    setSymbol(getCurrencySymbol(currencyCode));
  }, [currencyCode]);

  return { symbol };
}
