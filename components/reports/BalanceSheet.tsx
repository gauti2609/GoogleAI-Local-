import React from 'react';
// FIX: Add file extension to fix module resolution error.
import { AllData, EntityType } from '../../types.ts';
// FIX: Add file extension to fix module resolution error.
import { formatNumber } from '../../utils/formatNumber.ts';
import { getNoteNumberMap } from '../../utils/noteUtils.ts';

interface ReportProps {
  allData: AllData;
}

const ReportRow: React.FC<{ label: string; note?: string; valueCy?: number; valuePy?: number; isBold?: boolean; isSub?: boolean; isHeader?: boolean; formatFn: (num: number) => string; }> = 
({ label, note, valueCy, valuePy, isBold, isSub, isHeader, formatFn }) => {
    if (isHeader) {
        return (
            <tr className="font-bold bg-gray-700/30">
                <td className="p-3 text-white">{label}</td>
                <td className="p-3 text-center"></td>
                <td className="p-3 text-right"></td>
                <td className="p-3 text-right"></td>
            </tr>
        );
    }
    return (
        <tr className={`${isBold ? 'font-bold text-white' : ''}`}>
            <td className={`p-2 ${isSub ? 'pl-8' : ''}`}>{label}</td>
            <td className="p-2 text-center text-gray-400">{note}</td>
            <td className="p-2 text-right font-mono">{valueCy !== undefined ? formatFn(valueCy) : ''}</td>
            <td className="p-2 text-right font-mono">{valuePy !== undefined ? formatFn(valuePy) : ''}</td>
        </tr>
    );
};

export const BalanceSheet: React.FC<ReportProps> = ({ allData }) => {
    const { trialBalanceData, scheduleData } = allData;
    const { roundingUnit, entityType } = scheduleData.entityInfo;
    const format = (num: number) => formatNumber(num, roundingUnit);
    const parse = (val: string) => parseFloat(String(val).replace(/,/g, '')) || 0;

    const noteNumberMap = getNoteNumberMap(scheduleData.noteSelections);

    const getTBTotal = (groupingCode: string, year: 'cy' | 'py') => {
        const key = year === 'cy' ? 'closingCy' : 'closingPy';
        return trialBalanceData
            .filter(i => i.isMapped && i.groupingCode === groupingCode)
            .reduce((sum, item) => sum + item[key], 0);
    };

    // ASSETS
    // Non-current assets
    const ppeCy = getTBTotal('A.10.01', 'cy');
    const ppePy = getTBTotal('A.10.01', 'py');
    const intangiblesCy = getTBTotal('A.10.02', 'cy');
    const intangiblesPy = getTBTotal('A.10.02', 'py');
    const cwipCy = getTBTotal('A.10.03', 'cy');
    const cwipPy = getTBTotal('A.10.03', 'py');
    const intangibleDevCy = getTBTotal('A.10.04', 'cy');
    const intangibleDevPy = getTBTotal('A.10.04', 'py');
    const nonCurrentInvestmentsCy = getTBTotal('A.10.05', 'cy');
    const nonCurrentInvestmentsPy = getTBTotal('A.10.05', 'py');
    const dtaCy = getTBTotal('A.10.06', 'cy'); // Or calculate from schedule
    const dtaPy = getTBTotal('A.10.06', 'py');
    const longTermLoansCy = getTBTotal('A.10.07', 'cy');
    const longTermLoansPy = getTBTotal('A.10.07', 'py');
    const otherNonCurrentAssetsCy = getTBTotal('A.10.08', 'cy');
    const otherNonCurrentAssetsPy = getTBTotal('A.10.08', 'py');

    const totalNonCurrentAssetsCy = ppeCy + intangiblesCy + cwipCy + intangibleDevCy + nonCurrentInvestmentsCy + dtaCy + longTermLoansCy + otherNonCurrentAssetsCy;
    const totalNonCurrentAssetsPy = ppePy + intangiblesPy + cwipPy + intangibleDevPy + nonCurrentInvestmentsPy + dtaPy + longTermLoansPy + otherNonCurrentAssetsPy;

    // Current assets
    const currentInvestmentsCy = getTBTotal('A.20.01', 'cy');
    const currentInvestmentsPy = getTBTotal('A.20.01', 'py');
    const inventoriesCy = getTBTotal('A.20.02', 'cy');
    const inventoriesPy = getTBTotal('A.20.02', 'py');
    const receivablesCy = getTBTotal('A.20.03', 'cy');
    const receivablesPy = getTBTotal('A.20.03', 'py');
    const cashCy = getTBTotal('A.20.04', 'cy');
    const cashPy = getTBTotal('A.20.04', 'py');
    const shortTermLoansCy = getTBTotal('A.20.05', 'cy');
    const shortTermLoansPy = getTBTotal('A.20.05', 'py');
    const otherCurrentAssetsCy = getTBTotal('A.20.06', 'cy');
    const otherCurrentAssetsPy = getTBTotal('A.20.06', 'py');

    const totalCurrentAssetsCy = currentInvestmentsCy + inventoriesCy + receivablesCy + cashCy + shortTermLoansCy + otherCurrentAssetsCy;
    const totalCurrentAssetsPy = currentInvestmentsPy + inventoriesPy + receivablesPy + cashPy + shortTermLoansPy + otherCurrentAssetsPy;

    const totalAssetsCy = totalNonCurrentAssetsCy + totalCurrentAssetsCy;
    const totalAssetsPy = totalNonCurrentAssetsPy + totalCurrentAssetsPy;

    // EQUITY AND LIABILITIES
    // Equity
    const shareCapitalCy = Math.abs(getTBTotal('B.10.01', 'cy'));
    const shareCapitalPy = Math.abs(getTBTotal('B.10.01', 'py'));
    const otherEquityCy = Math.abs(getTBTotal('B.10.02', 'cy'));
    const otherEquityPy = Math.abs(getTBTotal('B.10.02', 'py'));
    const shareWarrantsCy = Math.abs(getTBTotal('B.10.03', 'cy'));
    const shareWarrantsPy = Math.abs(getTBTotal('B.10.03', 'py'));
    
    const partnersFundsCy = Math.abs(getTBTotal('B.10.04', 'cy'));
    const partnersFundsPy = Math.abs(getTBTotal('B.10.04', 'py'));

    const totalEquityCy = entityType === 'Company' 
        ? shareCapitalCy + otherEquityCy + shareWarrantsCy
        : partnersFundsCy;
    const totalEquityPy = entityType === 'Company'
        ? shareCapitalPy + otherEquityPy + shareWarrantsPy
        : partnersFundsPy;

    // Liabilities
    // Non-current liabilities
    const longTermBorrowingsCy = Math.abs(getTBTotal('B.20.01', 'cy'));
    const longTermBorrowingsPy = Math.abs(getTBTotal('B.20.01', 'py'));
    const dtlCy = Math.abs(getTBTotal('B.20.02', 'cy')); // or from schedule
    const dtlPy = Math.abs(getTBTotal('B.20.02', 'py'));
    const otherLongTermLiabilitiesCy = Math.abs(getTBTotal('B.20.03', 'cy'));
    const otherLongTermLiabilitiesPy = Math.abs(getTBTotal('B.20.03', 'py'));
    const longTermProvisionsCy = Math.abs(getTBTotal('B.20.04', 'cy'));
    const longTermProvisionsPy = Math.abs(getTBTotal('B.20.04', 'py'));
    const totalNonCurrentLiabilitiesCy = longTermBorrowingsCy + dtlCy + otherLongTermLiabilitiesCy + longTermProvisionsCy;
    const totalNonCurrentLiabilitiesPy = longTermBorrowingsPy + dtlPy + otherLongTermLiabilitiesPy + longTermProvisionsPy;
    
    // Current liabilities
    const shortTermBorrowingsCy = Math.abs(getTBTotal('B.30.01', 'cy'));
    const shortTermBorrowingsPy = Math.abs(getTBTotal('B.30.01', 'py'));
    const tradePayablesCy = Math.abs(getTBTotal('B.30.02', 'cy'));
    const tradePayablesPy = Math.abs(getTBTotal('B.30.02', 'py'));
    const otherCurrentLiabilitiesCy = Math.abs(getTBTotal('B.30.03', 'cy'));
    const otherCurrentLiabilitiesPy = Math.abs(getTBTotal('B.30.03', 'py'));
    const shortTermProvisionsCy = Math.abs(getTBTotal('B.30.04', 'cy'));
    const shortTermProvisionsPy = Math.abs(getTBTotal('B.30.04', 'py'));
    const shareAppMoneyCy = Math.abs(getTBTotal('B.30.05', 'cy'));
    const shareAppMoneyPy = Math.abs(getTBTotal('B.30.05', 'py'));

    const totalCurrentLiabilitiesCy = shortTermBorrowingsCy + tradePayablesCy + otherCurrentLiabilitiesCy + shortTermProvisionsCy + shareAppMoneyCy;
    const totalCurrentLiabilitiesPy = shortTermBorrowingsPy + tradePayablesPy + otherCurrentLiabilitiesPy + shortTermProvisionsPy + shareAppMoneyPy;

    const totalLiabilitiesCy = totalNonCurrentLiabilitiesCy + totalCurrentLiabilitiesCy;
    const totalLiabilitiesPy = totalNonCurrentLiabilitiesPy + totalCurrentLiabilitiesPy;
    
    const totalEquityAndLiabilitiesCy = totalEquityCy + totalLiabilitiesCy;
    const totalEquityAndLiabilitiesPy = totalEquityPy + totalLiabilitiesPy;
    
    const renderCompanyEquity = () => (
        <>
            <ReportRow label="Equity" isBold formatFn={format} />
            <ReportRow label="Share Capital" note={noteNumberMap['companyShareCap']?.toString()} valueCy={shareCapitalCy} valuePy={shareCapitalPy} isSub formatFn={format} />
            <ReportRow label="Other Equity" note={noteNumberMap['companyOtherEquity']?.toString()} valueCy={otherEquityCy} valuePy={otherEquityPy} isSub formatFn={format} />
            <ReportRow label="Money received against share warrants" valueCy={shareWarrantsCy} valuePy={shareWarrantsPy} isSub formatFn={format} />
            <ReportRow label="Total Equity" valueCy={totalEquityCy} valuePy={totalEquityPy} isBold formatFn={format} />
        </>
    );
    
    const renderPartnerFunds = () => (
        <>
            <ReportRow label={entityType === 'LLP' ? "PARTNERS' FUNDS" : "OWNERS' FUNDS"} isHeader formatFn={format} />
            <ReportRow label="Partners' Funds" note={noteNumberMap['partnersFunds']?.toString()} valueCy={partnersFundsCy} valuePy={partnersFundsPy} formatFn={format} />
            <ReportRow label="Total Partners' Funds" valueCy={totalEquityCy} valuePy={totalEquityPy} isBold formatFn={format} />
        </>
    );

    return (
        <div className="bg-gray-800 text-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-white">Balance Sheet</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th className="p-3 text-left font-medium w-1/2">Particulars</th>
                            <th className="p-3 text-center font-medium">Note No.</th>
                            <th className="p-3 text-right font-medium">Current Year ({scheduleData.entityInfo.currencySymbol})</th>
                            <th className="p-3 text-right font-medium">Previous Year ({scheduleData.entityInfo.currencySymbol})</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        <ReportRow label="ASSETS" isHeader formatFn={format} />
                        <ReportRow label="Non-current assets" isBold formatFn={format} />
                        <ReportRow label="Property, Plant and Equipment" note={noteNumberMap['ppe']?.toString()} valueCy={ppeCy} valuePy={ppePy} isSub formatFn={format} />
                        <ReportRow label="Intangible assets" note={noteNumberMap['intangible']?.toString()} valueCy={intangiblesCy} valuePy={intangiblesPy} isSub formatFn={format} />
                        <ReportRow label="Capital work-in-progress" note={noteNumberMap['cwip']?.toString()} valueCy={cwipCy} valuePy={cwipPy} isSub formatFn={format} />
                        <ReportRow label="Intangible assets under development" valueCy={intangibleDevCy} valuePy={intangibleDevPy} isSub formatFn={format} />
                        <ReportRow label="Non-current investments" note={noteNumberMap['investments']?.toString()} valueCy={nonCurrentInvestmentsCy} valuePy={nonCurrentInvestmentsPy} isSub formatFn={format} />
                        <ReportRow label="Deferred tax assets (net)" valueCy={dtaCy} valuePy={dtaPy} isSub formatFn={format} />
                        <ReportRow label="Long-term loans and advances" note={noteNumberMap['loans']?.toString()} valueCy={longTermLoansCy} valuePy={longTermLoansPy} isSub formatFn={format} />
                        <ReportRow label="Other non-current assets" valueCy={otherNonCurrentAssetsCy} valuePy={otherNonCurrentAssetsPy} isSub formatFn={format} />
                        <ReportRow label="Total non-current assets" valueCy={totalNonCurrentAssetsCy} valuePy={totalNonCurrentAssetsPy} isBold formatFn={format} />

                        <ReportRow label="Current assets" isBold formatFn={format} />
                        <ReportRow label="Current investments" valueCy={currentInvestmentsCy} valuePy={currentInvestmentsPy} isSub formatFn={format} />
                        <ReportRow label="Inventories" note={noteNumberMap['inventories']?.toString()} valueCy={inventoriesCy} valuePy={inventoriesPy} isSub formatFn={format} />
                        <ReportRow label="Trade receivables" note={noteNumberMap['tradeReceivables']?.toString()} valueCy={receivablesCy} valuePy={receivablesPy} isSub formatFn={format} />
                        <ReportRow label="Cash and cash equivalents" note={noteNumberMap['cash']?.toString()} valueCy={cashCy} valuePy={cashPy} isSub formatFn={format} />
                        <ReportRow label="Short-term loans and advances" valueCy={shortTermLoansCy} valuePy={shortTermLoansPy} isSub formatFn={format} />
                        <ReportRow label="Other current assets" valueCy={otherCurrentAssetsCy} valuePy={otherCurrentAssetsPy} isSub formatFn={format} />
                        <ReportRow label="Total current assets" valueCy={totalCurrentAssetsCy} valuePy={totalCurrentAssetsPy} isBold formatFn={format} />
                        <ReportRow label="TOTAL ASSETS" valueCy={totalAssetsCy} valuePy={totalAssetsPy} isBold formatFn={format} />

                        {entityType === 'Company' ? renderCompanyEquity() : renderPartnerFunds()}
                        
                        <ReportRow label="LIABILITIES" isHeader formatFn={format} />
                        <ReportRow label="Non-current liabilities" isBold formatFn={format} />
                        <ReportRow label="Long-term borrowings" note={noteNumberMap['borrowings']?.toString()} valueCy={longTermBorrowingsCy} valuePy={longTermBorrowingsPy} isSub formatFn={format} />
                        <ReportRow label="Deferred tax liabilities (net)" valueCy={dtlCy} valuePy={dtlPy} isSub formatFn={format} />
                        <ReportRow label="Other long-term liabilities" valueCy={otherLongTermLiabilitiesCy} valuePy={otherLongTermLiabilitiesPy} isSub formatFn={format} />
                        <ReportRow label="Long-term provisions" valueCy={longTermProvisionsCy} valuePy={longTermProvisionsPy} isSub formatFn={format} />
                        <ReportRow label="Total non-current liabilities" valueCy={totalNonCurrentLiabilitiesCy} valuePy={totalNonCurrentLiabilitiesPy} isBold formatFn={format} />
                        
                        <ReportRow label="Current liabilities" isBold formatFn={format} />
                        <ReportRow label="Short-term borrowings" note={noteNumberMap['borrowings']?.toString()} valueCy={shortTermBorrowingsCy} valuePy={shortTermBorrowingsPy} isSub formatFn={format} />
                        <ReportRow label="Trade payables" note={noteNumberMap['tradePayables']?.toString()} valueCy={tradePayablesCy} valuePy={tradePayablesPy} isSub formatFn={format} />
                        <ReportRow label="Other current liabilities" valueCy={otherCurrentLiabilitiesCy} valuePy={otherCurrentLiabilitiesPy} isSub formatFn={format} />
                        <ReportRow label="Short-term provisions" valueCy={shortTermProvisionsCy} valuePy={shortTermProvisionsPy} isSub formatFn={format} />
                        <ReportRow label="Share application money pending allotment" valueCy={shareAppMoneyCy} valuePy={shareAppMoneyPy} isSub formatFn={format} />
                        <ReportRow label="Total current liabilities" valueCy={totalCurrentLiabilitiesCy} valuePy={totalCurrentLiabilitiesPy} isBold formatFn={format} />
                        <ReportRow label="Total Liabilities" valueCy={totalLiabilitiesCy} valuePy={totalLiabilitiesPy} isBold formatFn={format} />

                        <ReportRow label="TOTAL EQUITY AND LIABILITIES" valueCy={totalEquityAndLiabilitiesCy} valuePy={totalEquityAndLiabilitiesPy} isBold formatFn={format} />
                    </tbody>
                </table>
            </div>
        </div>
    );
};