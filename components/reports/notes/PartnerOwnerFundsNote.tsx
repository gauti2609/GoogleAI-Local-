// components/reports/notes/PartnerOwnerFundsNote.tsx
import React from 'react';
import { PartnersFundsData, PartnerAccountRow } from '../../../types.ts';

interface PartnerOwnerFundsNoteProps {
    data: PartnersFundsData;
}

const format = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val;
    if (isNaN(num)) return '-';
    const formatted = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Math.abs(num));
    return num < 0 ? `(${formatted})` : formatted;
};

const AccountTable: React.FC<{
    title: string;
    items: PartnerAccountRow[];
}> = ({ title, items }) => {
    
    const parse = (val: string) => parseFloat(val.replace(/,/g, '')) || 0;

    return (
        <div>
            <h4 className="text-md font-semibold text-gray-300 mb-2">{title}</h4>
            <div className="overflow-x-auto border border-gray-600 rounded-lg">
                <table className="min-w-full text-xs">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th className="p-2 text-left">Partner/Owner Name</th>
                            {items.some(i => i.agreedContribution) && <th className="p-2 text-right">Agreed Contribution</th>}
                            {items.some(i => i.profitSharePercentage) && <th className="p-2 text-right">Profit Share %</th>}
                            <th className="p-2 text-right">Opening</th>
                            <th className="p-2 text-right">Introduced</th>
                            <th className="p-2 text-right">Remuneration</th>
                            <th className="p-2 text-right">Interest</th>
                            <th className="p-2 text-right">Withdrawals</th>
                            <th className="p-2 text-right">Profit/(Loss)</th>
                            <th className="p-2 text-right">Closing</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                        {items.map(item => {
                            const closing = parse(item.opening) + parse(item.introduced) + parse(item.remuneration) + parse(item.interest) - parse(item.withdrawals) + parse(item.profitShare);
                            return (
                            <tr key={item.id}>
                                <td className="p-2">{item.partnerName}</td>
                                {items.some(i => i.agreedContribution) && <td className="p-2 text-right font-mono">{format(item.agreedContribution || '0')}</td>}
                                {items.some(i => i.profitSharePercentage) && <td className="p-2 text-right font-mono">{item.profitSharePercentage || '-'}%</td>}
                                <td className="p-2 text-right font-mono">{format(item.opening)}</td>
                                <td className="p-2 text-right font-mono">{format(item.introduced)}</td>
                                <td className="p-2 text-right font-mono">{format(item.remuneration)}</td>
                                <td className="p-2 text-right font-mono">{format(item.interest)}</td>
                                <td className="p-2 text-right font-mono">{format(item.withdrawals)}</td>
                                <td className="p-2 text-right font-mono">{format(item.profitShare)}</td>
                                <td className="p-2 text-right font-mono">{format(closing)}</td>
                            </tr>
                        )})}
                        {items.length === 0 && (
                            <tr><td colSpan={10} className="p-4 text-center text-gray-500 italic">No movements to report.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
};


export const PartnerOwnerFundsNote: React.FC<PartnerOwnerFundsNoteProps> = ({ data }) => {
    return (
        <div className="space-y-8">
            <AccountTable 
                title="Capital Account Reconciliation"
                items={data.capitalAccount}
            />
             <AccountTable 
                title="Current Account Reconciliation"
                items={data.currentAccount}
            />
        </div>
    );
};