import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BorrowingsData, ScheduleData, BorrowingItem } from '../../types.ts';
import { PlusIcon, TrashIcon } from '../icons.tsx';

interface BorrowingsScheduleProps {
    data: BorrowingsData;
    onUpdate: React.Dispatch<React.SetStateAction<ScheduleData>>;
    isFinalized: boolean;
}

const BorrowingTable: React.FC<{
    title: string;
    items: BorrowingItem[];
    type: 'longTerm' | 'shortTerm';
    onUpdate: (type: 'longTerm' | 'shortTerm', id: string, field: keyof Omit<BorrowingItem, 'id'>, value: string | boolean) => void;
    onAdd: (type: 'longTerm' | 'shortTerm') => void;
    onRemove: (type: 'longTerm' | 'shortTerm', id: string) => void;
    isFinalized: boolean;
}> = ({ title, items, type, onUpdate, onAdd, onRemove, isFinalized }) => (
    <div>
        <h4 className="text-md font-semibold text-gray-300 mb-2">{title}</h4>
        <div className="space-y-2">
            {items.map(item => (
                <div key={item.id} className="space-y-2 bg-gray-900/50 p-3 rounded-lg">
                    <div className="grid grid-cols-12 gap-2 items-center">
                        <input type="text" placeholder="Nature of Borrowing" value={item.nature} onChange={e => onUpdate(type, item.id, 'nature', e.target.value)} disabled={isFinalized} className="col-span-4 bg-gray-700 p-2 rounded-md"/>
                        <select value={item.classification} onChange={e => onUpdate(type, item.id, 'classification', e.target.value)} disabled={isFinalized} className="col-span-2 bg-gray-700 p-2 rounded-md">
                            <option value="unsecured">Unsecured</option>
                            <option value="secured">Secured</option>
                        </select>
                        <input type="text" placeholder="Amount (CY)" value={item.amountCy} onChange={e => onUpdate(type, item.id, 'amountCy', e.target.value)} disabled={isFinalized} className="col-span-3 bg-gray-700 p-2 rounded-md text-right"/>
                        <input type="text" placeholder="Amount (PY)" value={item.amountPy} onChange={e => onUpdate(type, item.id, 'amountPy', e.target.value)} disabled={isFinalized} className="col-span-2 bg-gray-700 p-2 rounded-md text-right"/>
                        {!isFinalized && <button onClick={() => onRemove(type, item.id)} className="p-2 text-gray-400 hover:text-red-400 col-span-1"><TrashIcon className="w-5 h-5"/></button>}
                    </div>
                    <div className="grid grid-cols-12 gap-2 items-center">
                         <input type="text" placeholder="Repayment Terms" value={item.repaymentTerms} onChange={e => onUpdate(type, item.id, 'repaymentTerms', e.target.value)} disabled={isFinalized} className="col-span-6 bg-gray-700/50 p-2 rounded-md text-sm"/>
                         <input type="text" placeholder="Period of Default" value={item.defaultPeriod} onChange={e => onUpdate(type, item.id, 'defaultPeriod', e.target.value)} disabled={isFinalized} className="col-span-3 bg-gray-700/50 p-2 rounded-md text-sm"/>
                         <input type="text" placeholder="Amount of Default" value={item.defaultAmount} onChange={e => onUpdate(type, item.id, 'defaultAmount', e.target.value)} disabled={isFinalized} className="col-span-3 bg-gray-700/50 p-2 rounded-md text-sm text-right"/>
                    </div>
                </div>
            ))}
        </div>
        {!isFinalized && <button onClick={() => onAdd(type)} className="mt-2 flex items-center text-sm text-brand-blue-light hover:text-white"><PlusIcon className="w-4 h-4 mr-1"/> Add Borrowing</button>}
    </div>
);

export const BorrowingsSchedule: React.FC<BorrowingsScheduleProps> = ({ data, onUpdate, isFinalized }) => {

    const handleUpdate = (type: 'longTerm' | 'shortTerm', id: string, field: keyof Omit<BorrowingItem, 'id'>, value: string | boolean) => {
        onUpdate(prev => ({ ...prev, borrowings: { ...prev.borrowings, [type]: prev.borrowings[type].map(item => item.id === id ? { ...item, [field]: value } : item) }}));
    };

    const handleFieldUpdate = (field: keyof BorrowingsData, value: string) => {
        onUpdate(prev => ({...prev, borrowings: {...prev.borrowings, [field]: value}}))
    };

    const addRow = (type: 'longTerm' | 'shortTerm') => {
        const newRow: BorrowingItem = { id: uuidv4(), nature: '', classification: 'unsecured', amountCy: '', amountPy: '', repaymentTerms: '', defaultPeriod: '', defaultAmount: '' };
        onUpdate(prev => ({ ...prev, borrowings: { ...prev.borrowings, [type]: [...prev.borrowings[type], newRow] }}));
    };

    const removeRow = (type: 'longTerm' | 'shortTerm', id: string) => {
        onUpdate(prev => ({ ...prev, borrowings: { ...prev.borrowings, [type]: prev.borrowings[type].filter(item => item.id !== id) }}));
    };
    
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Borrowings Schedule</h3>
            <BorrowingTable title="Long-Term Borrowings" items={data.longTerm} type="longTerm" onUpdate={handleUpdate} onAdd={addRow} onRemove={removeRow} isFinalized={isFinalized} />
            <BorrowingTable title="Short-Term Borrowings" items={data.shortTerm} type="shortTerm" onUpdate={handleUpdate} onAdd={addRow} onRemove={removeRow} isFinalized={isFinalized} />
            <div>
                <label className="block text-sm font-medium text-gray-400">Details of Guarantees by Directors/Others</label>
                 <input
                    type="text"
                    value={data.directorGuarantees}
                    onChange={(e) => handleFieldUpdate('directorGuarantees', e.target.value)}
                    disabled={isFinalized}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white disabled:bg-gray-800"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Particulars of any redeemed bonds/debentures which the company has power to reissue</label>
                 <input
                    type="text"
                    value={data.reissuableBonds}
                    onChange={(e) => handleFieldUpdate('reissuableBonds', e.target.value)}
                    disabled={isFinalized}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white disabled:bg-gray-800"
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-400">Undrawn Borrowing Facilities (AS 3)</label>
                 <input
                    type="text"
                    value={data.undrawnBorrowingFacilities}
                    onChange={(e) => handleFieldUpdate('undrawnBorrowingFacilities', e.target.value)}
                    disabled={isFinalized}
                    placeholder="Enter amount and any restrictions..."
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white disabled:bg-gray-800"
                />
            </div>
        </div>
    );
};