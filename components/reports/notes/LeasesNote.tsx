// components/reports/notes/LeasesNote.tsx
import React from 'react';
import { LeasesData, MlpReconciliation } from '../../../types.ts';

interface LeasesNoteProps {
    data: LeasesData;
}

const format = (val: string) => {
    const num = parseFloat(val) || 0;
    return num === 0 ? '-' : num.toLocaleString('en-IN', {minimumFractionDigits: 2});
};

const MlpTable: React.FC<{title: string, data: MlpReconciliation}> = ({title, data}) => {
    const parse = (val: string) => parseFloat(val) || 0;
    const total = parse(data.notLaterThan1Year) + parse(data.laterThan1YearAndNotLaterThan5Years) + parse(data.laterThan5Years);
    
    return (
        <div className="mt-2">
            <h4 className="font-semibold text-gray-300 text-sm mb-1">{title}</h4>
            <table className="min-w-full text-xs max-w-lg">
                <tbody className="divide-y divide-gray-700">
                    <tr><td className="p-1 pl-4 w-3/4">Not later than one year</td><td className="p-1 text-right font-mono">{format(data.notLaterThan1Year)}</td></tr>
                    <tr><td className="p-1 pl-4">Later than one year and not later than five years</td><td className="p-1 text-right font-mono">{format(data.laterThan1YearAndNotLaterThan5Years)}</td></tr>
                    <tr><td className="p-1 pl-4">Later than five years</td><td className="p-1 text-right font-mono">{format(data.laterThan5Years)}</td></tr>
                    <tr className="font-bold border-t-2 border-gray-600"><td className="p-1">Total</td><td className="p-1 text-right font-mono">{format(total.toString())}</td></tr>
                </tbody>
            </table>
        </div>
    );
}

export const LeasesNote: React.FC<LeasesNoteProps> = ({ data }) => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-bold text-gray-200">Lessee Arrangements</h3>
                <MlpTable title="Future Minimum Lease Payments under non-cancellable Finance Leases" data={data.lesseeFinanceMlp} />
                <MlpTable title="Future Minimum Lease Payments under non-cancellable Operating Leases" data={data.lesseeOperatingMlp} />
                <div className="mt-2 text-xs">
                     <p className="font-semibold text-gray-400">General Description:</p>
                     <p className="italic text-gray-500">{data.lesseeGeneralDescription}</p>
                </div>
            </div>
             <div className="pt-4 border-t border-gray-700">
                <h3 className="font-bold text-gray-200">Lessor Arrangements</h3>
                <MlpTable title="Future Minimum Lease Payments under non-cancellable Finance Leases" data={data.lessorFinanceMlp} />
                <MlpTable title="Future Minimum Lease Payments under non-cancellable Operating Leases" data={data.lessorOperatingMlp} />
                 <div className="mt-2 text-xs">
                     <p className="font-semibold text-gray-400">General Description:</p>
                     <p className="italic text-gray-500">{data.lessorGeneralDescription}</p>
                </div>
            </div>
        </div>
    );
};