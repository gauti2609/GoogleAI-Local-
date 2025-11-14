// components/reports/notes/DiscontinuingOperationsNote.tsx
import React from 'react';
import { DiscontinuingOperationData } from '../../../types.ts';

interface DiscontinuingOperationsNoteProps {
    data: DiscontinuingOperationData;
}

const format = (val: string) => {
    const num = parseFloat(val) || 0;
    return num === 0 ? '-' : num.toLocaleString('en-IN', {minimumFractionDigits: 2});
};

export const DiscontinuingOperationsNote: React.FC<DiscontinuingOperationsNoteProps> = ({ data }) => {
    
    const parse = (val: string) => parseFloat(val) || 0;

    const preTaxProfit = parse(data.revenue) - parse(data.expenses);
    const netProfit = preTaxProfit - parse(data.incomeTaxExpense);
    
    return (
        <div className="space-y-6 text-sm">
            <div>
                <p className="italic text-gray-400">{data.description}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2">
                    <span className="font-semibold text-gray-300">Initial Disclosure Date:</span><span>{data.initialDisclosureDate || 'N/A'}</span>
                    <span className="font-semibold text-gray-300">Expected Completion:</span><span>{data.expectedCompletionDate || 'N/A'}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-semibold text-gray-300 mb-2">Assets to be Disposed Of</h4>
                     <table className="min-w-full text-xs"><tbody>{data.assets.map(a => <tr key={a.id}><td className="p-1">{a.particular}</td><td className="p-1 text-right font-mono">{format(a.carryingAmount)}</td></tr>)}</tbody></table>
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-300 mb-2">Liabilities to be Settled</h4>
                     <table className="min-w-full text-xs"><tbody>{data.liabilities.map(l => <tr key={l.id}><td className="p-1">{l.particular}</td><td className="p-1 text-right font-mono">{format(l.carryingAmount)}</td></tr>)}</tbody></table>
                </div>
            </div>
            
            <div>
                <h4 className="font-semibold text-gray-300 mb-2">Financial Performance of Discontinuing Operation</h4>
                <table className="min-w-full text-sm max-w-md">
                    <tbody className="divide-y divide-gray-700">
                        <tr><td className="p-1">Revenue</td><td className="p-1 text-right font-mono">{format(data.revenue)}</td></tr>
                        <tr><td className="p-1">Expenses</td><td className="p-1 text-right font-mono">({format(data.expenses)})</td></tr>
                        <tr className="border-t-2 border-gray-500"><td className="p-1 font-semibold">Pre-tax Profit/(Loss)</td><td className="p-1 text-right font-mono font-semibold">{format(preTaxProfit.toString())}</td></tr>
                        <tr><td className="p-1">Income Tax Expense</td><td className="p-1 text-right font-mono">({format(data.incomeTaxExpense)})</td></tr>
                        <tr className="font-bold bg-gray-700/30"><td className="p-1">Net Profit/(Loss)</td><td className="p-1 text-right font-mono">{format(netProfit.toString())}</td></tr>
                    </tbody>
                </table>
            </div>

        </div>
    );
};