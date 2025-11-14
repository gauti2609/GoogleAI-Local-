
import { RoundingUnit } from '../types.ts';

const divisors: Record<RoundingUnit, number> = {
    ones: 1,
    hundreds: 100,
    thousands: 1000,
    lakhs: 100000,
    millions: 1000000,
    crores: 10000000,
};

export const formatNumber = (num: number, unit: RoundingUnit): string => {
    if (isNaN(num) || num === 0) return '-';
    
    const divisor = divisors[unit] || 1;
    const value = num / divisor;

    const formatted = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Math.abs(value));

    return value < 0 ? `(${formatted})` : formatted;
};
