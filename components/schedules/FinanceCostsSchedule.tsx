import React from 'react';
import { GenericScheduleItem } from '../../types.ts';
import { GenericSchedule } from './GenericSchedule.tsx';

interface FinanceCostsScheduleProps {
    data: GenericScheduleItem[];
    onUpdate: (data: GenericScheduleItem[]) => void;
    isFinalized: boolean;
}

export const FinanceCostsSchedule: React.FC<FinanceCostsScheduleProps> = ({ data, onUpdate, isFinalized }) => {
    
    return (
        <GenericSchedule
            title="Finance Costs"
            data={data}
            onUpdate={onUpdate}
            isFinalized={isFinalized}
        />
    );
};