import React from 'react';
// FIX: Add file extension to fix module resolution error.
import { GenericScheduleItem } from '../../../types.ts';
import { GenericNote } from './GenericNote.tsx';

interface FinanceCostsNoteProps {
    data: GenericScheduleItem[];
}

export const FinanceCostsNote: React.FC<FinanceCostsNoteProps> = ({ data }) => {
    return (
        <GenericNote title="Finance Costs" data={data} />
    );
};
