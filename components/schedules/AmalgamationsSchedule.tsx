// components/schedules/AmalgamationsSchedule.tsx
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AmalgamationData, AmalgamationConsiderationItem } from '../../types.ts';
import { PlusIcon, TrashIcon } from '../icons.tsx';

interface AmalgamationsScheduleProps {
    data: AmalgamationData;
    onUpdate: (data: AmalgamationData) => void;
    isFinalized: boolean;
}

export const AmalgamationsSchedule: React.FC<AmalgamationsScheduleProps> = ({ data, onUpdate, isFinalized }) => {

    const handleFieldUpdate = (field: keyof AmalgamationData, value: string) => {
        onUpdate({ ...data, [field]: value });
    };

    const handleConsiderationUpdate = (id: string, field: keyof Omit<AmalgamationConsiderationItem, 'id'>, value: string) => {
        onUpdate({ ...data, consideration: data.consideration.map(item => item.id === id ? { ...item, [field]: value } : item) });
    };

    const addConsiderationItem = () => {
        const newItem: AmalgamationConsiderationItem = { id: uuidv4(), particular: '', amount: '0' };
        onUpdate({ ...data, consideration: [...data.consideration, newItem] });
    };
    
    const removeConsiderationItem = (id: string) => {
        onUpdate({ ...data, consideration: data.consideration.filter(item => item.id !== id) });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">AS 14: Accounting for Amalgamations</h3>
            
            <div className="p-4 bg-gray-900/50 rounded-lg space-y-4">
                 <h4 className="font-semibold text-gray-300">General Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-medium text-gray-400">Nature of Amalgamation</label>
                        <select value={data.nature} onChange={e => handleFieldUpdate('nature', e.target.value)} disabled={isFinalized} className="mt-1 block w-full bg-gray-700 p-2 rounded-md text-sm">
                            <option value="merger">In the nature of merger</option>
                            <option value="purchase">In the nature of purchase</option>
                        </select>
                    </div>
                    <InputField label="Name of the other company" value={data.amalgamatedCompany} onChange={v => handleFieldUpdate('amalgamatedCompany', v)} disabled={isFinalized} />
                    <InputField label="Effective date of amalgamation" value={data.effectiveDate} onChange={v => handleFieldUpdate('effectiveDate', v)} disabled={isFinalized} />
                    <InputField label="Method of accounting used" value={data.accountingMethod} onChange={v => handleFieldUpdate('accountingMethod', v)} disabled={isFinalized} />
                </div>
            </div>

            <div className="p-4 bg-gray-900/50 rounded-lg space-y-4">
                 <h4 className="font-semibold text-gray-300">Consideration</h4>
                 <div className="space-y-2">
                    {data.consideration.map(item => (
                        <div key={item.id} className="flex items-center space-x-2">
                            <input type="text" placeholder="Particulars (e.g., Equity shares issued)" value={item.particular} onChange={e => handleConsiderationUpdate(item.id, 'particular', e.target.value)} disabled={isFinalized} className="flex-1 bg-gray-700 p-2 rounded-md text-sm"/>
                            <input type="text" placeholder="Amount" value={item.amount} onChange={e => handleConsiderationUpdate(item.id, 'amount', e.target.value)} disabled={isFinalized} className="w-1/3 bg-gray-700 p-2 rounded-md text-sm text-right"/>
                             {!isFinalized && <button onClick={() => removeConsiderationItem(item.id)} className="p-1 text-gray-500 hover:text-red-400"><TrashIcon className="w-4 h-4"/></button>}
                        </div>
                    ))}
                 </div>
                 {!isFinalized && <button onClick={addConsiderationItem} className="mt-2 flex items-center text-xs text-brand-blue-light hover:text-white"><PlusIcon className="w-3 h-3 mr-1"/> Add Consideration Item</button>}
            </div>

            <div className="p-4 bg-gray-900/50 rounded-lg space-y-4">
                <InputField label="Treatment of any difference between consideration and value of net assets" value={data.treatmentOfReserves} onChange={v => handleFieldUpdate('treatmentOfReserves', v)} disabled={isFinalized} isTextarea />
                <InputField label="Additional Disclosures" value={data.additionalInfo} onChange={v => handleFieldUpdate('additionalInfo', v)} disabled={isFinalized} isTextarea />
            </div>

        </div>
    );
};

const InputField: React.FC<{ label: string; value: string; onChange: (value: string) => void; disabled: boolean; isTextarea?: boolean }> = 
({ label, value, onChange, disabled, isTextarea }) => (
    <div>
        <label className="block text-xs font-medium text-gray-400">{label}</label>
        {isTextarea ? (
             <textarea value={value} onChange={e => onChange(e.target.value)} disabled={disabled} rows={3} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-sm disabled:bg-gray-800"/>
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