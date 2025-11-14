import React from 'react';
import { v4 as uuidv4 } from 'uuid';
// FIX: Add file extension to fix module resolution error.
import { GenericScheduleItem } from '../../types.ts';
import { PlusIcon, TrashIcon } from '../icons.tsx';

interface GenericScheduleProps {
    title: string;
    data: GenericScheduleItem[];
    onUpdate: (data: GenericScheduleItem[]) => void;
    isFinalized: boolean;
}

export const GenericSchedule: React.FC<GenericScheduleProps> = ({ title, data, onUpdate, isFinalized }) => {

    const handleUpdate = (id: string, field: keyof Omit<GenericScheduleItem, 'id'>, value: string) => {
        onUpdate(data.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const addRow = () => {
        const newRow = { id: uuidv4(), particular: '', amountCy: '0', amountPy: '0' };
        onUpdate([...data, newRow]);
    };

    const removeRow = (id: string) => {
        onUpdate(data.filter(item => item.id !== id));
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <div className="space-y-2">
                {data.map(item => (
                    <div key={item.id} className="flex items-center space-x-2 bg-gray-900/50 p-2 rounded-lg">
                        <input type="text" placeholder="Particular" value={item.particular} onChange={e => handleUpdate(item.id, 'particular', e.target.value)} disabled={isFinalized} className="flex-1 bg-gray-700 p-2 rounded-md"/>
                        <input type="text" placeholder="Amount CY" value={item.amountCy} onChange={e => handleUpdate(item.id, 'amountCy', e.target.value)} disabled={isFinalized} className="w-1/4 bg-gray-700 p-2 rounded-md"/>
                        <input type="text" placeholder="Amount PY" value={item.amountPy} onChange={e => handleUpdate(item.id, 'amountPy', e.target.value)} disabled={isFinalized} className="w-1/4 bg-gray-700 p-2 rounded-md"/>
                        {!isFinalized && <button onClick={() => removeRow(item.id)} className="p-2 text-gray-400 hover:text-red-400"><TrashIcon className="w-5 h-5"/></button>}
                    </div>
                ))}
            </div>
             {!isFinalized && (
                <button onClick={addRow} className="mt-4 flex items-center text-sm text-brand-blue-light hover:text-white transition-colors font-medium">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Item
                </button>
            )}
        </div>
    );
};
