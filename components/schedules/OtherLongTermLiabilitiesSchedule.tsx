// components/schedules/OtherLongTermLiabilitiesSchedule.tsx
import React from 'react';
import { GenericScheduleItem } from '../../types.ts';
import { GenericSchedule } from './GenericSchedule.tsx';

interface OtherLongTermLiabilitiesScheduleProps {
    data: GenericScheduleItem[];
    onUpdate: (data: GenericScheduleItem[]) => void;
    isFinalized: boolean;
}

export const OtherLongTermLiabilitiesSchedule: React.FC<OtherLongTermLiabilitiesScheduleProps> = ({ data, onUpdate, isFinalized }) => {
    return (
        <GenericSchedule
            title="Other Long-Term Liabilities"
            data={data}
            onUpdate={onUpdate}
            isFinalized={isFinalized}
        />
    );
};
