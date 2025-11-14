import React from 'react';
import { GenericScheduleItem } from '../../types.ts';
import { GenericSchedule } from './GenericSchedule.tsx';

interface OtherIncomeScheduleProps {
    data: GenericScheduleItem[];
    onUpdate: (data: GenericScheduleItem[]) => void;
    isFinalized: boolean;
}

export const OtherIncomeSchedule: React.FC<OtherIncomeScheduleProps> = ({ data, onUpdate, isFinalized }) => {
    
    return (
        <GenericSchedule
            title="Other Income"
            data={data}
            onUpdate={onUpdate}
            isFinalized={isFinalized}
        />
    );
};