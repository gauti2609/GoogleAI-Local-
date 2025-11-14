// components/schedules/OtherCurrentAssetsSchedule.tsx
import React from 'react';
import { GenericScheduleItem } from '../../types.ts';
import { GenericSchedule } from './GenericSchedule.tsx';

interface OtherCurrentAssetsScheduleProps {
    data: GenericScheduleItem[];
    onUpdate: (data: GenericScheduleItem[]) => void;
    isFinalized: boolean;
}

export const OtherCurrentAssetsSchedule: React.FC<OtherCurrentAssetsScheduleProps> = ({ data, onUpdate, isFinalized }) => {
    return (
        <GenericSchedule
            title="Other Current Assets"
            data={data}
            onUpdate={onUpdate}
            isFinalized={isFinalized}
        />
    );
};
