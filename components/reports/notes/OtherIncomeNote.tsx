import React from 'react';
// FIX: Add file extension to fix module resolution error.
import { GenericScheduleItem } from '../../../types.ts';
import { GenericNote } from './GenericNote.tsx';

interface OtherIncomeNoteProps {
    data: GenericScheduleItem[];
}

export const OtherIncomeNote: React.FC<OtherIncomeNoteProps> = ({ data }) => {
    return (
        <GenericNote title="Other Income" data={data} />
    );
};
