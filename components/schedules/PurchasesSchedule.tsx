// components/schedules/PurchasesSchedule.tsx
import React from 'react';
import { GenericScheduleItem } from '../../types.ts';
import { GenericSchedule } from './GenericSchedule.tsx';

interface PurchasesScheduleProps {
    data: GenericScheduleItem[];
    onUpdate: (data: GenericScheduleItem[]) => void;
    isFinalized: boolean;
}

export const PurchasesSchedule: React.FC<PurchasesScheduleProps> = ({ data, onUpdate, isFinalized }) => {
    return (
        <GenericSchedule
            title="Purchases of Stock-in-Trade"
            data={data}
            onUpdate={onUpdate}
            isFinalized={isFinalized}
        />
    );
};
