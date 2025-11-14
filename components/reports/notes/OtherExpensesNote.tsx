import React from 'react';
import { GenericScheduleItem } from '../../../types.ts';
import { GenericNote } from './GenericNote.tsx';

interface OtherExpensesNoteProps {
    data: GenericScheduleItem[];
}

export const OtherExpensesNote: React.FC<OtherExpensesNoteProps> = ({ data }) => {
    return (
        <GenericNote title="Other Expenses" data={data} />
    );
};