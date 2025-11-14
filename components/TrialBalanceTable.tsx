
import React from 'react';
// FIX: Add file extension to fix module resolution error.
import { TrialBalanceItem, Masters } from '../types.ts';

interface TrialBalanceTableProps {
  ledgers: TrialBalanceItem[];
  selectedLedgerId: string | null;
  onSelectLedger: (id: string) => void;
  masters: Masters;
}

const formatCurrency = (num: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(num);
};

export const TrialBalanceTable: React.FC<TrialBalanceTableProps> = ({ ledgers, selectedLedgerId, onSelectLedger }) => {
    return (
        <div className="flex-1 flex flex-col bg-gray-800 p-4 rounded-lg border border-gray-700 overflow-hidden">
            <h2 className="text-lg font-semibold text-white mb-2">To Be Mapped ({ledgers.length})</h2>
            <div className="flex-1 overflow-y-auto">
                 <table className="min-w-full text-sm">
                    <thead className="sticky top-0 bg-gray-800">
                        <tr>
                            <th className="p-2 text-left font-medium text-gray-400">Ledger Name</th>
                            <th className="p-2 text-right font-medium text-gray-400">Closing (CY)</th>
                            <th className="p-2 text-right font-medium text-gray-400">Closing (PY)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {ledgers.length > 0 ? ledgers.map(item => (
                            <tr
                                key={item.id}
                                onClick={() => onSelectLedger(item.id)}
                                className={`cursor-pointer transition-colors ${
                                    selectedLedgerId === item.id 
                                    ? 'bg-brand-blue/20' 
                                    : 'hover:bg-gray-700/50'
                                }`}
                            >
                                <td className="p-2 font-medium">{item.ledger}</td>
                                <td className="p-2 text-right font-mono">{formatCurrency(item.closingCy)}</td>
                                <td className="p-2 text-right font-mono">{formatCurrency(item.closingPy)}</td>
                            </tr>
                        )) : (
                             <tr>
                                <td colSpan={3} className="p-4 text-center text-gray-500">
                                    No unmapped ledgers. All items have been mapped.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};