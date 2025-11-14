
import React from 'react';
// FIX: Add file extension to fix module resolution error.
import { GenericScheduleItem } from '../../../types.ts';
import { GenericNote } from './GenericNote.tsx';

interface RevenueFromOpsNoteProps {
    data: GenericScheduleItem[];
}

export const RevenueFromOpsNote: React.FC<RevenueFromOpsNoteProps> = ({ data }) => {
    return (
        <GenericNote title="Revenue from Operations" data={data} />
    );
};
