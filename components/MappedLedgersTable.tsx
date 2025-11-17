
import React, { useState } from 'react';
// FIX: Add file extension to fix module resolution error.
import { TrialBalanceItem, Masters } from '../types.ts';

interface MappedLedgersTableProps {
  ledgers: TrialBalanceItem[];
  masters: Masters;
  onSelectLedger: (id: string) => void;
  selectedLedgerIds?: Set<string>;
  onToggleSelection?: (id: string) => void;
  onSelectAll?: (checked: boolean) => void;
}

const formatCurrency = (num: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(num);
};

export const MappedLedgersTable: React.FC<MappedLedgersTableProps> = ({ 
    ledgers, 
    masters, 
    onSelectLedger,
    selectedLedgerIds,
    onToggleSelection,
    onSelectAll
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    
    // Filter ledgers based on search query
    const filteredLedgers = ledgers.filter(ledger => 
        ledger.ledger.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getMappingPath = (item: TrialBalanceItem) => {
        if (!item.isMapped) return 'N/A';
        const grouping = masters.groupings.find(g => g.code === item.groupingCode);
        const lineItem = item.lineItemCode ? masters.lineItems.find(li => li.code === item.lineItemCode) : null;
        
        if (lineItem) {
            return `${grouping?.name || 'Invalid'} > ${lineItem.name}`;
        }
        return grouping ? grouping.name : 'Invalid Mapping';
    };
    
    const allSelected = selectedLedgerIds && onSelectAll && filteredLedgers.length > 0 && 
        filteredLedgers.every(l => selectedLedgerIds.has(l.id));

    return (
        <div className="flex-1 flex flex-col bg-gray-800 p-4 rounded-lg border border-gray-700 overflow-hidden">
            <h2 className="text-lg font-semibold text-white mb-2">Mapped ({ledgers.length})</h2>
            {/* Search input */}
            <div className="mb-2">
                <input
                    type="text"
                    placeholder="Search mapped ledgers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
            </div>
            <div className="flex-1 overflow-y-auto">
                <table className="min-w-full text-sm">
                    <thead className="sticky top-0 bg-gray-800">
                        <tr>
                            {selectedLedgerIds && onToggleSelection && onSelectAll && (
                                <th className="p-2 text-left font-medium text-gray-400 w-10">
                                    <input
                                        type="checkbox"
                                        checked={allSelected || false}
                                        onChange={(e) => onSelectAll(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-brand-blue focus:ring-brand-blue"
                                    />
                                </th>
                            )}
                            <th className="p-2 text-left font-medium text-gray-400">Ledger Name</th>
                            <th className="p-2 text-left font-medium text-gray-400">Mapping</th>
                            <th className="p-2 text-right font-medium text-gray-400">Closing (CY)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredLedgers.length > 0 ? filteredLedgers.map(item => (
                            <tr 
                                key={item.id} 
                                className="hover:bg-gray-700/30 cursor-pointer"
                            >
                                {selectedLedgerIds && onToggleSelection && (
                                    <td className="p-2" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selectedLedgerIds.has(item.id)}
                                            onChange={() => onToggleSelection(item.id)}
                                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-brand-blue focus:ring-brand-blue"
                                        />
                                    </td>
                                )}
                                <td className="p-2" onClick={() => onSelectLedger(item.id)}>{item.ledger}</td>
                                <td className="p-2 text-gray-400 text-xs" onClick={() => onSelectLedger(item.id)}>{getMappingPath(item)}</td>
                                <td className="p-2 text-right font-mono" onClick={() => onSelectLedger(item.id)}>{formatCurrency(item.closingCy)}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={selectedLedgerIds ? 4 : 3} className="p-4 text-center text-gray-500">
                                    {searchQuery ? 'No mapped ledgers match your search.' : 'No ledgers have been mapped yet.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};