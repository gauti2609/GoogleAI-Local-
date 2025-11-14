import React from 'react';
import { LoansAndAdvancesScheduleData } from '../../../types.ts';
import { GenericNote } from './GenericNote.tsx';

interface LoansAndAdvancesNoteProps {
    data: LoansAndAdvancesScheduleData;
}

const formatCurrency = (val: string): string => {
    const num = parseFloat(val.replace(/,/g, ''));
    if (isNaN(num) || num === 0) return '-';
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);
};

export const LoansAndAdvancesNote: React.FC<LoansAndAdvancesNoteProps> = ({ data }) => {
    return (
        <div className="space-y-4">
            <GenericNote title="" data={data.items} />
            <div>
                <span className="font-semibold text-gray-400">Allowance for bad and doubtful loans and advances: </span>
                <span className="font-mono">{formatCurrency(data.allowanceForBadAndDoubtful)}</span>
            </div>
        </div>
    );
};