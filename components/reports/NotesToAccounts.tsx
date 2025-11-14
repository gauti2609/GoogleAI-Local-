import React from 'react';
import { AllData } from '../../types.ts';
import { getNoteNumberMap } from '../../utils/noteUtils.ts';

// Import all note components
import { EntityInfoNote } from './notes/EntityInfoNote.tsx';
import { AccountingPoliciesNote } from '../schedules/narrative/AccountingPoliciesNote.tsx';
import { ShareCapitalNote } from './notes/ShareCapitalNote.tsx';
import { OtherEquityNote } from './notes/OtherEquityNote.tsx';
import { PPENote } from './notes/PPENote.tsx';
import { IntangibleAssetsNote } from './notes/IntangibleAssetsNote.tsx';
import { CWIPNote } from './notes/CWIPNote.tsx';
import { InvestmentsNote } from './notes/InvestmentsNote.tsx';
import { LoansAndAdvancesNote } from './notes/LoansAndAdvancesNote.tsx';
import { InventoriesBalanceNote } from './notes/InventoriesBalanceNote.tsx';
import { BorrowingsNote } from './notes/BorrowingsNote.tsx';
import { TradePayablesAgeingNote } from './notes/TradePayablesAgeingNote.tsx';
import { TradeReceivablesNote } from './notes/TradeReceivablesAgeingNote.tsx';
import { CashAndCashEquivalentsNote } from './notes/CashAndCashEquivalentsNote.tsx';
import { RevenueFromOpsNote } from './notes/RevenueFromOpsNote.tsx';
import { OtherIncomeNote } from './notes/OtherIncomeNote.tsx';
import { CostOfMaterialsConsumedNote } from './notes/CostOfMaterialsConsumedNote.tsx';
import { EmployeeBenefitsNote } from './notes/EmployeeBenefitsNote.tsx';
import { FinanceCostsNote } from './notes/FinanceCostsNote.tsx';
import { OtherExpensesNote } from './notes/OtherExpensesNote.tsx';
import { TaxExpenseNote } from './notes/TaxExpenseNote.tsx';
import { EarningsPerShareNote } from './notes/EarningsPerShareNote.tsx';
import { RelatedPartyNote } from './notes/RelatedPartyNote.tsx';
import { ContingentLiabilitiesNote } from './notes/ContingentLiabilitiesNote.tsx';
import { EventsAfterBalanceSheetNote } from '../schedules/narrative/EventsAfterBalanceSheetNote.tsx';
import { CommitmentsNote } from './notes/CommitmentsNote.tsx';
import { AuditorPaymentsNote } from './notes/AuditorPaymentsNote.tsx';
import { ForeignExchangeNote } from './notes/ForeignExchangeNote.tsx';
import { AdditionalRegulatoryInfoNote } from './notes/AdditionalRegulatoryInfoNote.tsx';
import { TradePayablesMsmeNote } from './notes/TradePayablesMsmeNote.tsx';
import { ConstructionContractsNote } from './notes/ConstructionContractsNote.tsx';
import { GovernmentGrantsNote } from './notes/GovernmentGrantsNote.tsx';
import { SegmentReportingNote } from './notes/SegmentReportingNote.tsx';
import { LeasesNote } from './notes/LeasesNote.tsx';
import { DiscontinuingOperationsNote } from './notes/DiscontinuingOperationsNote.tsx';
import { AmalgamationsNote } from './notes/AmalgamationsNote.tsx';
import { ProvisionsNote } from './notes/ProvisionsNote.tsx';
import { PartnerOwnerFundsNote } from './notes/PartnerOwnerFundsNote.tsx';
import { GenericNote } from './notes/GenericNote.tsx';
import { ExceptionalItemsNote } from './notes/ExceptionalItemsNote.tsx';


interface ReportProps {
  allData: AllData;
}

const NoteWrapper: React.FC<{ title: string; noteNumber: number; children: React.ReactNode }> = ({ title, noteNumber, children }) => (
    <div className="mb-8 p-4 bg-gray-900/50 rounded-lg note-wrapper">
        <h3 className="text-lg font-bold text-white mb-3">
            <span className="text-brand-blue">{noteNumber}.</span> {title}
        </h3>
        <div className="text-sm">
            {children}
        </div>
    </div>
);


export const NotesToAccounts: React.FC<ReportProps> = ({ allData }) => {
    const { scheduleData } = allData;

    // A complete map of all note components, keyed by their ID from noteSelections.
    const notesMap: Record<string, { title: string; component: React.ReactNode }> = {
        entityInfo: { title: 'Entity Information', component: <EntityInfoNote data={scheduleData.entityInfo} /> },
        acctPolicies: { title: 'Significant Accounting Policies', component: <AccountingPoliciesNote data={scheduleData.accountingPolicies} /> },
        companyShareCap: { title: 'Share Capital', component: <ShareCapitalNote data={scheduleData.companyShareCapital} /> },
        companyOtherEquity: { title: 'Other Equity', component: <OtherEquityNote data={scheduleData.companyOtherEquity} /> },
        partnersFunds: { title: scheduleData.entityInfo.entityType === 'LLP' ? 'Partners\' Funds' : 'Owners\' Funds', component: <PartnerOwnerFundsNote data={scheduleData.partnersFunds} /> },
        borrowings: { title: 'Borrowings', component: <BorrowingsNote data={scheduleData.borrowings} /> },
        // FIX: Added missing 'title' prop to GenericNote component.
        otherLongTermLiabilities: { title: 'Other Long-Term Liabilities', component: <GenericNote title="Other Long-Term Liabilities" data={scheduleData.otherLongTermLiabilities} /> },
        provisions: { title: 'Provisions', component: <ProvisionsNote data={scheduleData.provisions} /> },
        deferredTax: { title: 'Deferred Tax', component: <div>Not Implemented</div> },
        tradePayables: { title: 'Trade Payables', component: <><TradePayablesAgeingNote data={scheduleData.tradePayables.ageing} /><TradePayablesMsmeNote data={scheduleData.tradePayables.msmeDisclosures} /></> },
        // FIX: Added missing 'title' prop to GenericNote component.
        otherCurrentLiabilities: { title: 'Other Current Liabilities', component: <GenericNote title="Other Current Liabilities" data={scheduleData.otherCurrentLiabilities} /> },
        ppe: { title: 'Property, Plant and Equipment', component: <PPENote data={scheduleData.ppe} /> },
        intangible: { title: 'Intangible Assets', component: <IntangibleAssetsNote data={scheduleData.intangibleAssets} /> },
        cwip: { title: 'Capital Work-in-Progress', component: <CWIPNote data={scheduleData.cwip} /> },
        investments: { title: 'Non-Current Investments', component: <InvestmentsNote data={scheduleData.investments} /> },
        longTermLoans: { title: 'Long-Term Loans & Advances', component: <LoansAndAdvancesNote data={scheduleData.loansAndAdvances} /> },
        // FIX: Added missing 'title' prop to GenericNote component.
        otherNonCurrentAssets: { title: 'Other Non-Current Assets', component: <GenericNote title="Other Non-Current Assets" data={scheduleData.otherNonCurrentAssets} /> },
        currentInvestments: { title: 'Current Investments', component: <InvestmentsNote data={scheduleData.currentInvestments} /> },
        inventories: { title: 'Inventories', component: <InventoriesBalanceNote data={scheduleData.inventories} valuationMode={scheduleData.inventoriesValuationMode} /> },
        tradeReceivables: { title: 'Trade Receivables', component: <TradeReceivablesNote data={scheduleData.tradeReceivables} /> },
        cash: { title: 'Cash and Cash Equivalents', component: <CashAndCashEquivalentsNote data={scheduleData.cashAndCashEquivalents} /> },
        shortTermLoans: { title: 'Short-Term Loans & Advances', component: <LoansAndAdvancesNote data={scheduleData.shortTermLoansAndAdvances} /> },
        // FIX: Added missing 'title' prop to GenericNote component.
        otherCurrentAssets: { title: 'Other Current Assets', component: <GenericNote title="Other Current Assets" data={scheduleData.otherCurrentAssets} /> },
        revenue: { title: 'Revenue from Operations', component: <RevenueFromOpsNote data={scheduleData.revenueFromOps} /> },
        otherIncome: { title: 'Other Income', component: <OtherIncomeNote data={scheduleData.otherIncome} /> },
        cogs: { title: 'Cost of Materials Consumed', component: <CostOfMaterialsConsumedNote data={scheduleData.costOfMaterialsConsumed} /> },
        // FIX: Added missing 'title' prop to GenericNote component.
        purchases: { title: 'Purchases of Stock-in-Trade', component: <GenericNote title="Purchases of Stock-in-Trade" data={scheduleData.purchases} /> },
        changesInInv: { title: 'Changes in Inventories', component: <div>Not Implemented</div> },
        employee: { title: 'Employee Benefit Expense', component: <EmployeeBenefitsNote data={scheduleData.employeeBenefits} allData={allData} /> },
        finance: { title: 'Finance Costs', component: <FinanceCostsNote data={scheduleData.financeCosts} /> },
        otherExpenses: { title: 'Other Expenses', component: <OtherExpensesNote data={scheduleData.otherExpenses} /> },
        exceptionalItems: { title: 'Exceptional and Prior Period Items', component: <ExceptionalItemsNote data={scheduleData.exceptionalItems} /> },
        tax: { title: 'Tax Expense', component: <TaxExpenseNote data={scheduleData.taxExpense} /> },
        eps: { title: 'Earnings Per Share', component: <EarningsPerShareNote data={scheduleData.eps} /> },
        relatedParties: { title: 'Related Party Disclosures', component: <RelatedPartyNote data={scheduleData.relatedParties} /> },
        contingent: { title: 'Contingent Liabilities', component: <ContingentLiabilitiesNote data={scheduleData.contingentLiabilities} /> },
        commitments: { title: 'Commitments', component: <CommitmentsNote data={scheduleData.commitments} /> },
        eventsAfterBS: { title: 'Events after Balance Sheet Date', component: <EventsAfterBalanceSheetNote data={scheduleData.eventsAfterBalanceSheet} /> },
        auditor: { title: 'Auditor Payments', component: <AuditorPaymentsNote data={scheduleData.auditorPayments} /> },
        forex: { title: 'Foreign Exchange', component: <ForeignExchangeNote data={scheduleData.foreignExchange} /> },
        regulatory: { title: 'Additional Regulatory Information', component: <AdditionalRegulatoryInfoNote data={scheduleData.additionalRegulatoryInfo} /> },
        construction: { title: 'Construction Contracts', component: <ConstructionContractsNote data={scheduleData.constructionContracts} /> },
        govtGrants: { title: 'Government Grants', component: <GovernmentGrantsNote data={scheduleData.governmentGrants} /> },
        segmentReporting: { title: 'Segment Reporting', component: <SegmentReportingNote data={scheduleData.segmentReporting} /> },
        leases: { title: 'Leases', component: <LeasesNote data={scheduleData.leases} /> },
        discontinuingOps: { title: 'Discontinuing Operations', component: <DiscontinuingOperationsNote data={scheduleData.discontinuingOperations} /> },
        amalgamations: { title: 'Amalgamations', component: <AmalgamationsNote data={scheduleData.amalgamations} /> },
    };

    const selectedAndSortedNotes = scheduleData.noteSelections
        .filter(n => n.isSelected)
        .sort((a, b) => a.order - b.order);

    const noteNumberMap = getNoteNumberMap(scheduleData.noteSelections);

    return (
        <div className="bg-gray-800 text-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-white">Notes to the Financial Statements</h2>
            {selectedAndSortedNotes.map((noteInfo) => {
                const noteDetails = notesMap[noteInfo.id];
                const noteNumber = noteNumberMap[noteInfo.id];
                if (!noteDetails || !noteNumber) {
                    return null;
                }
                return (
                    <NoteWrapper key={noteInfo.id} title={noteDetails.title} noteNumber={noteNumber}>
                        {noteDetails.component}
                    </NoteWrapper>
                );
            })}
        </div>
    );
};