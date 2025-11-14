// components/schedules/DiscontinuingOperationsSchedule.tsx
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DiscontinuingOperationData, DiscontinuingOperationAssetLiability } from '../../types.ts';
import { PlusIcon, TrashIcon } from '../icons.tsx';

interface DiscontinuingOperationsScheduleProps {
    data: DiscontinuingOperationData;
    onUpdate: (data: DiscontinuingOperationData) => void;
    isFinalized: boolean;
}

const AssetLiabilityTable: React.FC<{
    title: string;
    items: DiscontinuingOperationAssetLiability[];
    type: 'assets' | 'liabilities';
    onUpdate: (id: string, value: string) => void;
    onAdd: () => void;
    onRemove: (id: string) => void;
    isFinalized: boolean;
}> = ({ title, items, onUpdate, onAdd, onRemove, isFinalized }) => (
    <div className="p-3 bg-gray-800/50 rounded-lg">
        <h4 className="font-semibold text-gray-300 text-sm mb-2">{title}</h4>
        <div className="space-y-2">
            {items.map(item => (
                <div key={item.id} className="flex items-center space-x-2">
                    <input type="text" placeholder="Particular" value={item.particular} onChange={e => onUpdate(item.id, e.target.value)} disabled={isFinalized} className="w-2/3 bg-gray-700 p-2 rounded-md text-sm"/>
                    <input type="text" placeholder="Carrying Amount" value={item.carryingAmount} onChange={e => onUpdate(item.id, e.target.value)} disabled={isFinalized} className="w-1/3 bg-gray-700 p-2 rounded-md text-sm text-right"/>
                    {!isFinalized && <button onClick={() => onRemove(item.id)} className="p-1 text-gray-500 hover:text-red-400"><TrashIcon className="w-4 h-4"/></button>}
                </div>
            ))}
        </div>
        {!isFinalized && <button onClick={onAdd} className="mt-2 flex items-center text-xs text-brand-blue-light hover:text-white"><PlusIcon className="w-3 h-3 mr-1"/> Add Item</button>}
    </div>
);

export const DiscontinuingOperationsSchedule: React.FC<DiscontinuingOperationsScheduleProps> = ({ data, onUpdate, isFinalized }) => {

    const handleFieldUpdate = (field: keyof DiscontinuingOperationData, value: string) => {
        onUpdate({ ...data, [field]: value });
    };

    const handleListUpdate = (type: 'assets' | 'liabilities', id: string, value: string) => {
        onUpdate({ ...data, [type]: data[type].map(item => item.id === id ? { ...item, particular: value } : item) });
    };

     const handleListAmountUpdate = (type: 'assets' | 'liabilities', id: string, value: string) => {
        onUpdate({ ...data, [type]: data[type].map(item => item.id === id ? { ...item, carryingAmount: value } : item) });
    };

    const addListItem = (type: 'assets' | 'liabilities') => {
        const newItem: DiscontinuingOperationAssetLiability = { id: uuidv4(), particular: '', carryingAmount: '0' };
        onUpdate({ ...data, [type]: [...data[type], newItem] });
    };

    const removeListItem = (type: 'assets' | 'liabilities', id: string) => {
        onUpdate({ ...data, [type]: data[type].filter(item => item.id !== id) });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">AS 24: Discontinuing Operations</h3>
            
            <div className="p-4 bg-gray-900/50 rounded-lg space-y-4">
                <InputField label="Description of the discontinuing operation" value={data.description} onChange={v => handleFieldUpdate('description', v)} disabled={isFinalized} isTextarea />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Date of initial disclosure event" value={data.initialDisclosureDate} onChange={v => handleFieldUpdate('initialDisclosureDate', v)} disabled={isFinalized} />
                    <InputField label="Expected completion date" value={data.expectedCompletionDate} onChange={v => handleFieldUpdate('expectedCompletionDate', v)} disabled={isFinalized} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AssetLiabilityTable title="Carrying Amount of Assets to be Disposed" items={data.assets} type="assets" onUpdate={(id, v) => handleListUpdate('assets', id, v)} onAdd={() => addListItem('assets')} onRemove={(id) => removeListItem('assets', id)} isFinalized={isFinalized} />
                <AssetLiabilityTable title="Carrying Amount of Liabilities to be Disposed" items={data.liabilities} type="liabilities" onUpdate={(id, v) => handleListUpdate('liabilities', id, v)} onAdd={() => addListItem('liabilities')} onRemove={(id) => removeListItem('liabilities', id)} isFinalized={isFinalized} />
            </div>

            <div className="p-4 bg-gray-900/50 rounded-lg space-y-4">
                 <h4 className="font-semibold text-gray-300">Financial Impact</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <InputField label="Revenue from operation" value={data.revenue} onChange={v => handleFieldUpdate('revenue', v)} disabled={isFinalized} />
                     <InputField label="Expenses from operation" value={data.expenses} onChange={v => handleFieldUpdate('expenses', v)} disabled={isFinalized} />
                     <InputField label="Related income tax expense" value={data.incomeTaxExpense} onChange={v => handleFieldUpdate('incomeTaxExpense', v)} disabled={isFinalized} />
                 </div>
            </div>

        </div>
    );
};

const InputField: React.FC<{ label: string; value: string; onChange: (value: string) => void; disabled: boolean; isTextarea?: boolean }> = 
({ label, value, onChange, disabled, isTextarea }) => (
    <div>
        <label className="block text-xs font-medium text-gray-400">{label}</label>
        {isTextarea ? (
             <textarea value={value} onChange={e => onChange(e.target.value)} disabled={disabled} rows={2} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-sm disabled:bg-gray-800"/>
        ) : (
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-sm disabled:bg-gray-800"
            />
        )}
    </div>
);