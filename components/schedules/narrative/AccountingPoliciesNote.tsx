
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
// FIX: Add file extension to fix module resolution error.
import { AccountingPoliciesData, ScheduleData } from '../../../types.ts';
import { PlusIcon, TrashIcon } from '../../icons.tsx';

interface AccountingPoliciesNoteProps {
    data: AccountingPoliciesData;
    onUpdate?: React.Dispatch<React.SetStateAction<ScheduleData>>;
    isFinalized?: boolean;
}

export const AccountingPoliciesNote: React.FC<AccountingPoliciesNoteProps> = ({ data, onUpdate, isFinalized = false }) => {

    const handleBasisUpdate = (value: string) => {
        if (onUpdate) onUpdate(prev => ({ ...prev, accountingPolicies: { ...prev.accountingPolicies, basisOfPreparation: value } }));
    };

    const handlePolicyUpdate = (id: string, field: 'title' | 'policy', value: string) => {
        if (onUpdate) onUpdate(prev => ({ ...prev, accountingPolicies: { ...prev.accountingPolicies, policies: prev.accountingPolicies.policies.map(p => p.id === id ? { ...p, [field]: value } : p) } }));
    };

    const addPolicy = () => {
        if (onUpdate) onUpdate(prev => ({ ...prev, accountingPolicies: { ...prev.accountingPolicies, policies: [...prev.accountingPolicies.policies, { id: uuidv4(), title: '', policy: '' }] } }));
    };

    const removePolicy = (id: string) => {
        if (onUpdate) onUpdate(prev => ({ ...prev, accountingPolicies: { ...prev.accountingPolicies, policies: prev.accountingPolicies.policies.filter(p => p.id !== id) } }));
    };
    
    // For the display version in the Notes To Accounts
    if (!onUpdate) {
         return (
            <div className="space-y-4 text-sm">
                <div>
                    <h4 className="font-semibold text-gray-300">a. Basis of Preparation</h4>
                    <p className="mt-1">{data.basisOfPreparation}</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-300">b. Significant Accounting Policies</h4>
                    <div className="mt-2 space-y-3">
                        {data.policies.map(p => (
                            <div key={p.id}>
                                <h5 className="font-semibold text-gray-400">{p.title}</h5>
                                <p className="mt-1 text-sm">{p.policy}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Significant Accounting Policies</h3>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Basis of Preparation</label>
                <textarea
                    value={data.basisOfPreparation}
                    onChange={e => handleBasisUpdate(e.target.value)}
                    disabled={isFinalized}
                    rows={3}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white disabled:bg-gray-800 disabled:cursor-not-allowed"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Policies</label>
                <div className="space-y-4">
                    {data.policies.map(p => (
                        <div key={p.id} className="flex items-start space-x-2 bg-gray-900/50 p-3 rounded-lg">
                            <div className="flex-1 space-y-2">
                                <input
                                    type="text"
                                    placeholder="Policy Title (e.g., a) Revenue Recognition)"
                                    value={p.title}
                                    onChange={e => handlePolicyUpdate(p.id, 'title', e.target.value)}
                                    disabled={isFinalized}
                                    className="block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white font-semibold disabled:bg-gray-800 disabled:cursor-not-allowed"
                                />
                                <textarea
                                    placeholder="Policy content..."
                                    value={p.policy}
                                    onChange={e => handlePolicyUpdate(p.id, 'policy', e.target.value)}
                                    disabled={isFinalized}
                                    rows={3}
                                    className="block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white disabled:bg-gray-800 disabled:cursor-not-allowed"
                                />
                            </div>
                             {!isFinalized && (
                                <button onClick={() => removePolicy(p.id)} className="p-2 text-gray-400 hover:text-red-400 rounded-md hover:bg-red-500/10 transition-colors mt-1">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                 {!isFinalized && (
                    <button onClick={addPolicy} className="mt-4 flex items-center text-sm text-brand-blue-light hover:text-white transition-colors font-medium">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Policy
                    </button>
                )}
            </div>
        </div>
    );
};