
import React from 'react';
// FIX: Add file extension to fix module resolution error.
import { TrialBalanceItem, Masters } from '../types.ts';

interface MappedLedgersTableProps {
  ledgers: TrialBalanceItem[];
  masters: Masters;
}

const formatCurrency = (num: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(num);
};

export const MappedLedgersTable: React.FC<MappedLedgersTableProps> = ({ ledgers, masters }) => {

    const getMappingPath = (item: TrialBalanceItem) => {
        if (!item.isMapped) return 'N/A';
        const grouping = masters.groupings.find(g => g.code === item.groupingCode);
        return grouping ? grouping.name : 'Invalid Mapping';
    };

    return (
        <div className="flex-1 flex flex-col bg-gray-800 p-4 rounded-lg border border-gray-700 overflow-hidden">
            <h2 className="text-lg font-semibold text-white mb-2">Mapped ({ledgers.length})</h2>
            <div className="flex-1 overflow-y-auto">
                <table className="min-w-full text-sm">
                    <thead className="sticky top-0 bg-gray-800">
                        <tr>
                            <th className="p-2 text-left font-medium text-gray-400">Ledger Name</th>
                            <th className="p-2 text-left font-medium text-gray-400">Mapping</th>
                            <th className="p-2 text-right font-medium text-gray-400">Closing (CY)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {ledgers.length > 0 ? ledgers.map(item => (
                            <tr key={item.id} className="hover:bg-gray-700/30">
                                <td className="p-2">{item.ledger}</td>
                                <td className="p-2 text-gray-400">{getMappingPath(item)}</td>
                                <td className="p-2 text-right font-mono">{formatCurrency(item.closingCy)}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={3} className="p-4 text-center text-gray-500">
                                    No ledgers have been mapped yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};