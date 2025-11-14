import React from 'react';
import { GenericScheduleItem } from '../../types.ts';
import { GenericSchedule } from './GenericSchedule.tsx';

interface OtherExpensesScheduleProps {
    data: GenericScheduleItem[];
    onUpdate: (data: GenericScheduleItem[]) => void;
    isFinalized: boolean;
}

export const OtherExpensesSchedule: React.FC<OtherExpensesScheduleProps> = ({ data, onUpdate, isFinalized }) => {
    
    return (
        <GenericSchedule
            title="Other Expenses"
            data={data}
            onUpdate={onUpdate}
            isFinalized={isFinalized}
        />
    );
};