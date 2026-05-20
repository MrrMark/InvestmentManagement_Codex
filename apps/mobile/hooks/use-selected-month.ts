import { useEffect, useState } from 'react';

export function useSelectedMonth(months: string[], fallbackMonth: string) {
  const [selectedMonth, setSelectedMonth] = useState(fallbackMonth);

  useEffect(() => {
    const nextMonth = months[0] ?? fallbackMonth;

    if (!months.includes(selectedMonth)) {
      setSelectedMonth(nextMonth);
    }
  }, [fallbackMonth, months, selectedMonth]);

  return [selectedMonth, setSelectedMonth] as const;
}
