

import React from 'react';
// FIX: Add file extension to fix module resolution error.
import { EventsAfterBalanceSheetData, ScheduleData } from '../../../types.ts';

interface EventsAfterBalanceSheetNoteProps {
    data: EventsAfterBalanceSheetData;
    onUpdate?: React.Dispatch<React.SetStateAction<ScheduleData>>;
    isFinalized?: boolean;
}

export const EventsAfterBalanceSheetNote: React.FC<EventsAfterBalanceSheetNoteProps> = ({ data, onUpdate, isFinalized = false }) => {

    const handleUpdate = (value: string) => {
        if (onUpdate) {
            onUpdate(prev => ({ ...prev, eventsAfterBalanceSheet: { content: value } }));
        }
    };
    
    if (!onUpdate) {
         return (
            <div className="space-y-3 text-sm">
                <p>{data.content}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
             <h3 className="text-lg font-semibold text-white">Events after Balance Sheet Date</h3>
             <p className="text-sm text-gray-400">Disclose any significant events, both adjusting and non-adjusting, that occurred between the balance sheet date and the date the financial statements were approved.</p>
             <textarea
                value={data.content}
                onChange={e => handleUpdate(e.target.value)}
                disabled={isFinalized}
                rows={5}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white disabled:bg-gray-800 disabled:cursor-not-allowed"
            />
        </div>
    );
};