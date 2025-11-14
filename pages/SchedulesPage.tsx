

import React, { useState } from 'react';
import { AllData, ScheduleData } from '../types.ts';
import { ShareCapitalSchedule } from '../components/schedules/ShareCapitalSchedule.tsx';
import { ConfirmationModal } from '../components/ConfirmationModal.tsx';
import { FinalizedBanner } from '../components/FinalizedBanner.tsx';
// Import all other schedule components...
import { OtherEquitySchedule } from '../components/schedules/OtherEquitySchedule.tsx';
import { BorrowingsSchedule } from '../components/schedules/BorrowingsSchedule.tsx';
import { TradePayablesSchedule } from '../components/schedules/TradePayablesSchedule.tsx';
import { PPESchedule } from '../components/schedules/PPESchedule.tsx';
import { CWIPSchedule } from '../components/schedules/CWIPSchedule.tsx';
import { IntangibleAssetsSchedule } from '../components/schedules/IntangibleAssetsSchedule.tsx';
import { InvestmentsSchedule } from '../components/schedules/InvestmentsSchedule.tsx';
import { LoansAndAdvancesSchedule } from '../components/schedules/LoansAndAdvancesSchedule.tsx';
import { InventoriesBalanceSchedule } from '../components/schedules/InventoriesBalanceSchedule.tsx';
import { TradeReceivablesSchedule } from '../components/schedules/TradeReceivablesSchedule.tsx';
import { CashAndCashEquivalentsSchedule } from '../components/schedules/CashAndCashEquivalentsSchedule.tsx';
import { RevenueFromOpsSchedule } from '../components/schedules/RevenueFromOpsSchedule.tsx';
import { OtherIncomeSchedule } from '../components/schedules/OtherIncomeSchedule.tsx';
import { CostOfMaterialsConsumedSchedule } from '../components/schedules/CostOfMaterialsConsumedSchedule.tsx';
import { ChangesInInventoriesSchedule } from '../components/schedules/ChangesInInventoriesSchedule.tsx';
import { EmployeeBenefitsSchedule } from '../components/schedules/EmployeeBenefitsSchedule.tsx';
import { FinanceCostsSchedule } from '../components/schedules/FinanceCostsSchedule.tsx';
import { OtherExpensesSchedule } from '../components/schedules/OtherExpensesSchedule.tsx';
import { TaxExpenseSchedule } from '../components/schedules/TaxExpenseSchedule.tsx';
import { EarningsPerShareSchedule } from '../components/schedules/EarningsPerShareSchedule.tsx';
import { RelatedPartySchedule } from '../components/schedules/RelatedPartySchedule.tsx';
import { ContingentLiabilitiesSchedule } from '../components/schedules/ContingentLiabilitiesSchedule.tsx';
import { EntityInfoSchedule } from '../components/schedules/narrative/EntityInfoSchedule.tsx';
import { AccountingPoliciesNote } from '../components/schedules/narrative/AccountingPoliciesNote.tsx';
import { EventsAfterBalanceSheetNote } from '../components/schedules/narrative/EventsAfterBalanceSheetNote.tsx';
import { CommitmentsSchedule } from '../components/schedules/CommitmentsSchedule.tsx';
import { ExceptionalItemsSchedule } from '../components/schedules/ExceptionalItemsSchedule.tsx';
import { AuditorPaymentsSchedule } from '../components/schedules/AuditorPaymentsSchedule.tsx';
import { ForeignExchangeSchedule } from '../components/schedules/ForeignExchangeSchedule.tsx';
import { RatioAnalysisExplanations } from '../components/schedules/RatioAnalysisExplanations.tsx';
import { DeferredTaxSchedule } from '../components/schedules/DeferredTaxSchedule.tsx';
import { CWIPAgeingSchedule } from '../components/schedules/CWIPAgeingSchedule.tsx';
import { IntangibleAssetsUnderDevelopmentMovementSchedule } from '../components/schedules/IntangibleAssetsUnderDevelopmentMovementSchedule.tsx';
import { IntangibleAssetsUnderDevelopmentSchedule } from '../components/schedules/IntangibleAssetsUnderDevelopmentSchedule.tsx';
import { AdditionalRegulatoryInfoNote } from '../components/schedules/narrative/AdditionalRegulatoryInfoNote.tsx';
import { TradePayablesMsmeSchedule } from '../components/schedules/TradePayablesMsmeSchedule.tsx';
import { LongTermReceivablesAgeingSchedule } from '../components/schedules/LongTermReceivablesAgeingSchedule.tsx';
import { GovernmentGrantsSchedule } from '../components/schedules/GovernmentGrantsSchedule.tsx';
import { DiscontinuingOperationsSchedule } from '../components/schedules/DiscontinuingOperationsSchedule.tsx';
import { AmalgamationsSchedule } from '../components/schedules/AmalgamationsSchedule.tsx';

// NEW IMPORTS
import { OtherLongTermLiabilitiesSchedule } from '../components/schedules/OtherLongTermLiabilitiesSchedule.tsx';
import { ProvisionsSchedule } from '../components/schedules/ProvisionsSchedule.tsx';
import { OtherCurrentLiabilitiesSchedule } from '../components/schedules/OtherCurrentLiabilitiesSchedule.tsx';
import { CurrentInvestmentsSchedule } from '../components/schedules/CurrentInvestmentsSchedule.tsx';
import { ShortTermLoansAndAdvancesSchedule } from '../components/schedules/ShortTermLoansAndAdvancesSchedule.tsx';
import { PurchasesSchedule } from '../components/schedules/PurchasesSchedule.tsx';
import { OtherNonCurrentAssetsSchedule } from '../components/schedules/OtherNonCurrentAssetsSchedule.tsx';
import { OtherCurrentAssetsSchedule } from '../components/schedules/OtherCurrentAssetsSchedule.tsx';
import { ConstructionContractsSchedule } from '../components/schedules/ConstructionContractsSchedule.tsx';
import { SegmentReportingSchedule } from '../components/schedules/SegmentReportingSchedule.tsx';
import { LeasesSchedule } from '../components/schedules/LeasesSchedule.tsx';
import { PartnerOwnerFundsSchedule } from '../components/schedules/PartnerOwnerFundsSchedule.tsx';
import { getEntityLevel, getApplicableNotes } from '../utils/applicabilityUtils.ts';


type ScheduleView = 'entityInfo' | 'accountingPolicies' | 'shareCapital' | 'otherEquity' | 'partnersFunds' | 'ownersFunds' |'borrowings' | 'otherLongTermLiabilities' | 'provisions' | 'tradePayables' | 'otherCurrentLiabilities' | 'msme' | 'ppe' | 'cwip' | 'intangible' | 'intangibleDev' | 'investments' | 'longTermLoans' | 'longTermReceivables' | 'otherNonCurrentAssets' | 'currentInvestments' | 'inventories' | 'tradeReceivables' | 'cash' | 'shortTermLoans' | 'otherCurrentAssets' | 'revenue' | 'otherIncome' | 'cogs' | 'purchases' | 'changesInInv' | 'employee' | 'finance' | 'otherExpenses' | 'tax' | 'exceptional' | 'eps' | 'relatedParties' | 'contingent' | 'commitments' | 'eventsAfterBS' | 'forex' | 'auditor' | 'regulatory' | 'deferredTax' | 'ratioExplanations' | 'construction' | 'govtGrants' | 'segmentReporting' | 'leases' | 'discontinuingOps' | 'amalgamations';

export const SchedulesPage: React.FC<{ allData: AllData; setScheduleData: React.Dispatch<React.SetStateAction<ScheduleData>> }> = ({ allData, setScheduleData }) => {
    const [activeView, setActiveView] = useState<ScheduleView | null>(null);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    
    const { scheduleData } = allData;
    const { entityInfo } = scheduleData;
    const isFinalized = scheduleData.isFinalized;

    const handleFinalize = () => {
        setScheduleData(prev => ({...prev, isFinalized: true}));
        setConfirmModalOpen(false);
    };

    const handleEdit = () => {
        setScheduleData(prev => ({...prev, isFinalized: false}));
    }

    const renderSchedule = () => {
        if (!activeView) {
            return <div>Select a schedule from the left panel to begin.</div>;
        }
        switch (activeView) {
            // General
            case 'entityInfo':
                return <EntityInfoSchedule data={scheduleData.entityInfo} onUpdate={setScheduleData} isFinalized={isFinalized} />;
            case 'accountingPolicies':
                return <AccountingPoliciesNote data={scheduleData.accountingPolicies} onUpdate={setScheduleData} isFinalized={isFinalized} />;
            
            // Equity & Liabilities
            case 'shareCapital':
                return <ShareCapitalSchedule data={scheduleData.companyShareCapital} onUpdate={setScheduleData} isFinalized={isFinalized} />;
            case 'otherEquity':
                return <OtherEquitySchedule data={scheduleData.companyOtherEquity} onUpdate={(d) => setScheduleData(p => ({...p, companyOtherEquity: d}))} isFinalized={isFinalized} />;
            case 'partnersFunds':
                return <PartnerOwnerFundsSchedule title="Partners' Funds" data={scheduleData.partnersFunds} onUpdate={(d) => setScheduleData(p => ({ ...p, partnersFunds: d }))} isFinalized={isFinalized} />;
             case 'ownersFunds':
                return <PartnerOwnerFundsSchedule title="Owners' Funds" data={scheduleData.partnersFunds} onUpdate={(d) => setScheduleData(p => ({ ...p, partnersFunds: d }))} isFinalized={isFinalized} />;
            case 'borrowings':
                return <BorrowingsSchedule data={scheduleData.borrowings} onUpdate={setScheduleData} isFinalized={isFinalized} />;
            case 'otherLongTermLiabilities':
                return <OtherLongTermLiabilitiesSchedule data={scheduleData.otherLongTermLiabilities} onUpdate={(d) => setScheduleData(p => ({...p, otherLongTermLiabilities: d}))} isFinalized={isFinalized} />;
            case 'provisions':
                 return <ProvisionsSchedule data={scheduleData.provisions} onUpdate={(d) => setScheduleData(p => ({...p, provisions: d}))} isFinalized={isFinalized} />;
            case 'otherCurrentLiabilities':
                return <OtherCurrentLiabilitiesSchedule data={scheduleData.otherCurrentLiabilities} onUpdate={(d) => setScheduleData(p => ({...p, otherCurrentLiabilities: d}))} isFinalized={isFinalized} />;
            case 'tradePayables':
                return <TradePayablesSchedule data={scheduleData.tradePayables} onUpdate={(d) => setScheduleData(p => ({...p, tradePayables: d}))} isFinalized={isFinalized} />;
            case 'msme':
                return <TradePayablesMsmeSchedule data={scheduleData.tradePayables.msmeDisclosures} onUpdate={(d) => setScheduleData(p => ({...p, tradePayables: {...p.tradePayables, msmeDisclosures: d}}))} isFinalized={isFinalized} />;
            case 'deferredTax':
                return <DeferredTaxSchedule data={scheduleData.deferredTax} onUpdate={(d) => setScheduleData(p => ({...p, deferredTax: d}))} isFinalized={isFinalized} />;

            // Assets
            case 'ppe':
                 return <PPESchedule data={scheduleData.ppe} onUpdate={(d) => setScheduleData(p => ({...p, ppe: d}))} isFinalized={isFinalized} />;
            case 'cwip':
                return (
                    <div className="space-y-8">
                        <CWIPSchedule data={scheduleData.cwip} onUpdate={setScheduleData} isFinalized={isFinalized} />
                        <CWIPAgeingSchedule data={scheduleData.cwipAgeing} onUpdate={(d) => setScheduleData(p => ({...p, cwipAgeing: d}))} isFinalized={isFinalized} />
                    </div>
                );
            case 'intangible':
                 return <IntangibleAssetsSchedule data={scheduleData.intangibleAssets} onUpdate={(d) => setScheduleData(p => ({...p, intangibleAssets: d}))} isFinalized={isFinalized} />;
            case 'intangibleDev':
                 return (
                    <div className="space-y-8">
                        <IntangibleAssetsUnderDevelopmentMovementSchedule data={scheduleData.intangibleAssetsUnderDevelopmentMovement} onUpdate={(d) => setScheduleData(p => ({...p, intangibleAssetsUnderDevelopmentMovement: d}))} isFinalized={isFinalized} />
                        <IntangibleAssetsUnderDevelopmentSchedule data={scheduleData.intangibleAssetsUnderDevelopmentAgeing} onUpdate={(d) => setScheduleData(p => ({...p, intangibleAssetsUnderDevelopmentAgeing: d}))} isFinalized={isFinalized} />
                    </div>
                );
            case 'investments':
                return <InvestmentsSchedule data={scheduleData.investments} onUpdate={(d) => setScheduleData(p => ({...p, investments: d}))} isFinalized={isFinalized} />;
             case 'currentInvestments':
                return <CurrentInvestmentsSchedule data={scheduleData.currentInvestments} onUpdate={(d) => setScheduleData(p => ({...p, currentInvestments: d}))} isFinalized={isFinalized} />;
            case 'longTermLoans':
                return <LoansAndAdvancesSchedule data={scheduleData.loansAndAdvances} onUpdate={(d) => setScheduleData(p => ({...p, loansAndAdvances: d}))} isFinalized={isFinalized} />;
            case 'shortTermLoans':
                return <ShortTermLoansAndAdvancesSchedule data={scheduleData.shortTermLoansAndAdvances} onUpdate={(d) => setScheduleData(p => ({...p, shortTermLoansAndAdvances: d}))} isFinalized={isFinalized} />;
            case 'longTermReceivables':
                return <LongTermReceivablesAgeingSchedule data={scheduleData.longTermTradeReceivables.ageing} onUpdate={(d) => setScheduleData(p => ({...p, longTermTradeReceivables: {...p.longTermTradeReceivables, ageing: d}}))} isFinalized={isFinalized} />;
            case 'otherNonCurrentAssets':
                return <OtherNonCurrentAssetsSchedule data={scheduleData.otherNonCurrentAssets} onUpdate={(d) => setScheduleData(p => ({...p, otherNonCurrentAssets: d}))} isFinalized={isFinalized} />;
            case 'inventories':
                return <InventoriesBalanceSchedule data={scheduleData.inventories} valuationMode={scheduleData.inventoriesValuationMode} onUpdate={setScheduleData} isFinalized={isFinalized} />;
            case 'tradeReceivables':
                return <TradeReceivablesSchedule title="Short-Term Trade Receivables" data={scheduleData.tradeReceivables} onUpdate={(d) => setScheduleData(p => ({...p, tradeReceivables: d}))} isFinalized={isFinalized} />;
            case 'cash':
                return <CashAndCashEquivalentsSchedule data={scheduleData.cashAndCashEquivalents} onUpdate={setScheduleData} isFinalized={isFinalized} />;
            case 'otherCurrentAssets':
                return <OtherCurrentAssetsSchedule data={scheduleData.otherCurrentAssets} onUpdate={(d) => setScheduleData(p => ({...p, otherCurrentAssets: d}))} isFinalized={isFinalized} />;
            
            // P&L
            case 'revenue':
                return <RevenueFromOpsSchedule data={scheduleData.revenueFromOps} onUpdate={(d) => setScheduleData(p => ({...p, revenueFromOps: d}))} isFinalized={isFinalized} />;
            case 'otherIncome':
                return <OtherIncomeSchedule data={scheduleData.otherIncome} onUpdate={(d) => setScheduleData(p => ({...p, otherIncome: d}))} isFinalized={isFinalized} />;
            case 'cogs':
                return <CostOfMaterialsConsumedSchedule data={scheduleData.costOfMaterialsConsumed} onUpdate={setScheduleData} isFinalized={isFinalized} />;
            case 'purchases':
                return <PurchasesSchedule data={scheduleData.purchases} onUpdate={(d) => setScheduleData(p => ({...p, purchases: d}))} isFinalized={isFinalized} />;
            case 'changesInInv':
                return <ChangesInInventoriesSchedule data={scheduleData.changesInInventories} onUpdate={setScheduleData} isFinalized={isFinalized} />;
            case 'employee':
                return <EmployeeBenefitsSchedule data={scheduleData.employeeBenefits} onUpdate={setScheduleData} isFinalized={isFinalized} />;
            case 'finance':
                return <FinanceCostsSchedule data={scheduleData.financeCosts} onUpdate={(d) => setScheduleData(p => ({...p, financeCosts: d}))} isFinalized={isFinalized} />;
            case 'otherExpenses':
                return <OtherExpensesSchedule data={scheduleData.otherExpenses} onUpdate={(d) => setScheduleData(p => ({...p, otherExpenses: d}))} isFinalized={isFinalized} />;
            case 'tax':
                return <TaxExpenseSchedule data={scheduleData.taxExpense} onUpdate={setScheduleData} isFinalized={isFinalized} />;
            case 'exceptional':
                return <ExceptionalItemsSchedule data={scheduleData.exceptionalItems} onUpdate={(d) => setScheduleData(p => ({...p, exceptionalItems: d}))} isFinalized={isFinalized} />;

            // Other Disclosures
            case 'eps':
                return <EarningsPerShareSchedule data={scheduleData.eps} onUpdate={setScheduleData} isFinalized={isFinalized} />;
            case 'relatedParties':
                return <RelatedPartySchedule data={scheduleData.relatedParties} onUpdate={setScheduleData} isFinalized={isFinalized} />;
            case 'contingent':
                return <ContingentLiabilitiesSchedule data={scheduleData.contingentLiabilities} onUpdate={setScheduleData} isFinalized={isFinalized} />;
            case 'commitments':
                return <CommitmentsSchedule data={scheduleData.commitments} onUpdate={(d) => setScheduleData(p => ({...p, commitments: d}))} isFinalized={isFinalized} />;
            case 'eventsAfterBS':
                return <EventsAfterBalanceSheetNote data={scheduleData.eventsAfterBalanceSheet} onUpdate={setScheduleData} isFinalized={isFinalized} />;
            case 'forex':
                return <ForeignExchangeSchedule data={scheduleData.foreignExchange} onUpdate={setScheduleData} isFinalized={isFinalized} />;
            case 'auditor':
                 return <AuditorPaymentsSchedule data={scheduleData.auditorPayments} onUpdate={(d) => setScheduleData(p => ({...p, auditorPayments: d}))} isFinalized={isFinalized} />;
            case 'regulatory':
                 return <AdditionalRegulatoryInfoNote data={scheduleData.additionalRegulatoryInfo} onUpdate={setScheduleData} isFinalized={isFinalized} />;
             case 'ratioExplanations':
                return <RatioAnalysisExplanations allData={allData} onUpdate={setScheduleData} isFinalized={isFinalized} />;
            case 'construction':
                return <ConstructionContractsSchedule data={scheduleData.constructionContracts} onUpdate={(d) => setScheduleData(p => ({...p, constructionContracts: d}))} isFinalized={isFinalized} />;
            case 'govtGrants':
                return <GovernmentGrantsSchedule data={scheduleData.governmentGrants} onUpdate={(d) => setScheduleData(p => ({...p, governmentGrants: d}))} isFinalized={isFinalized} />;
            case 'segmentReporting':
                return <SegmentReportingSchedule data={scheduleData.segmentReporting} onUpdate={(d) => setScheduleData(p => ({...p, segmentReporting: d}))} isFinalized={isFinalized} />;
            case 'leases':
                return <LeasesSchedule data={scheduleData.leases} onUpdate={(d) => setScheduleData(p => ({...p, leases: d}))} isFinalized={isFinalized} />;
            case 'discontinuingOps':
                return <DiscontinuingOperationsSchedule data={scheduleData.discontinuingOperations} onUpdate={(d) => setScheduleData(p => ({...p, discontinuingOperations: d}))} isFinalized={isFinalized} />;
            case 'amalgamations':
                return <AmalgamationsSchedule data={scheduleData.amalgamations} onUpdate={(d) => setScheduleData(p => ({...p, amalgamations: d}))} isFinalized={isFinalized} />;

            default:
                return <div>Select a schedule from the left panel to begin.</div>
        }
    };

    const allScheduleNav = [
        { type: 'link', id: 'entityInfo', name: 'Entity Info' },
        { type: 'link', id: 'accountingPolicies', name: 'Accounting Policies' },
        
        { type: 'header', name: 'Equity & Liabilities' },
        { type: 'link', id: 'shareCapital', name: 'Share Capital', noteId: 'companyShareCap' },
        { type: 'link', id: 'otherEquity', name: 'Other Equity', noteId: 'companyOtherEquity' },
        { type: 'link', id: 'partnersFunds', name: 'Partners\'/Owners\' Funds', noteId: 'partnersFunds' },
        { type: 'link', id: 'borrowings', name: 'Borrowings', noteId: 'borrowings' },
        { type: 'link', id: 'otherLongTermLiabilities', name: 'Other Long-Term Liabilities', noteId: 'otherLongTermLiabilities' },
        { type: 'link', id: 'provisions', name: 'Provisions (AS 29)', noteId: 'provisions' },
        { type: 'link', id: 'tradePayables', name: 'Trade Payables', noteId: 'tradePayables' },
        { type: 'link', id: 'otherCurrentLiabilities', name: 'Other Current Liabilities', noteId: 'otherCurrentLiabilities' },
        { type: 'link', id: 'msme', name: 'MSME Disclosures' },
        { type: 'link', id: 'deferredTax', name: 'Deferred Tax', noteId: 'deferredTax' },

        { type: 'header', name: 'Assets' },
        { type: 'link', id: 'ppe', name: 'Property, Plant & Equipment', noteId: 'ppe' },
        { type: 'link', id: 'cwip', name: 'Capital WIP', noteId: 'cwip' },
        { type: 'link', id: 'intangible', name: 'Intangible Assets', noteId: 'intangible' },
        { type: 'link', id: 'intangibleDev', name: 'Intangible Assets - Dev.' },
        { type: 'link', id: 'investments', name: 'Non-Current Investments', noteId: 'investments' },
        { type: 'link', id: 'longTermLoans', name: 'Long-Term Loans & Advances', noteId: 'longTermLoans' },
        { type: 'link', id: 'longTermReceivables', name: 'Long-Term Trade Receivables' },
        { type: 'link', id: 'otherNonCurrentAssets', name: 'Other Non-Current Assets', noteId: 'otherNonCurrentAssets' },
        { type: 'link', id: 'currentInvestments', name: 'Current Investments', noteId: 'currentInvestments' },
        { type: 'link', id: 'inventories', name: 'Inventories', noteId: 'inventories' },
        { type: 'link', id: 'tradeReceivables', name: 'Trade Receivables', noteId: 'tradeReceivables' },
        { type: 'link', id: 'shortTermLoans', name: 'Short-Term Loans & Advances', noteId: 'shortTermLoans' },
        { type: 'link', id: 'cash', name: 'Cash & Cash Equivalents', noteId: 'cash' },
        { type: 'link', id: 'otherCurrentAssets', name: 'Other Current Assets', noteId: 'otherCurrentAssets' },


        { type: 'header', name: 'Profit & Loss Statement' },
        { type: 'link', id: 'revenue', name: 'Revenue from Operations', noteId: 'revenue' },
        { type: 'link', id: 'otherIncome', name: 'Other Income', noteId: 'otherIncome' },
        { type: 'link', id: 'cogs', name: 'Cost of Materials', noteId: 'cogs' },
        { type: 'link', id: 'purchases', name: 'Purchases of Stock-in-Trade', noteId: 'purchases' },
        { type: 'link', id: 'changesInInv', name: 'Changes in Inventories', noteId: 'changesInInv' },
        { type: 'link', id: 'employee', name: 'Employee Benefits', noteId: 'employee' },
        { type: 'link', id: 'finance', name: 'Finance Costs', noteId: 'finance' },
        { type: 'link', id: 'otherExpenses', name: 'Other Expenses', noteId: 'otherExpenses' },
        { type: 'link', id: 'exceptional', name: 'Exceptional & Prior Items', noteId: 'exceptionalItems' },
        { type: 'link', id: 'tax', name: 'Tax Expense', noteId: 'tax' },

        { type: 'header', name: 'Other Disclosures' },
        { type: 'link', id: 'eps', name: 'Earnings Per Share', noteId: 'eps' },
        { type: 'link', id: 'relatedParties', name: 'Related Parties', noteId: 'relatedParties' },
        { type: 'link', id: 'contingent', name: 'Contingent Liabilities', noteId: 'contingent' },
        { type: 'link', id: 'commitments', name: 'Commitments', noteId: 'commitments' },
        { type: 'link', id: 'auditor', name: 'Auditor Payments', noteId: 'auditor' },
        { type: 'link', id: 'forex', name: 'Foreign Exchange', noteId: 'forex' },
        { type: 'link', id: 'regulatory', name: 'Additional Reg. Info', noteId: 'regulatory' },
        { type: 'link', id: 'ratioExplanations', name: 'Ratio Explanations' },
        { type: 'link', id: 'construction', name: 'Construction Contracts (AS 7)', noteId: 'construction' },
        { type: 'link', id: 'govtGrants', name: 'Government Grants (AS 12)', noteId: 'govtGrants' },
        { type: 'link', id: 'amalgamations', name: 'Amalgamations (AS 14)', noteId: 'amalgamations' },
        { type: 'link', id: 'segmentReporting', name: 'Segment Reporting (AS 17)', noteId: 'segmentReporting' },
        { type: 'link', id: 'leases', name: 'Leases (AS 19)', noteId: 'leases' },
        { type: 'link', id: 'discontinuingOps', name: 'Discontinuing Operations (AS 24)', noteId: 'discontinuingOps' },
        { type: 'link', id: 'eventsAfterBS', name: 'Events After B/S Date', noteId: 'eventsAfterBS' },
    ];
    
    const entityLevel = getEntityLevel(entityInfo.entityType, entityInfo);
    const applicableNotes = getApplicableNotes(scheduleData.noteSelections, entityInfo.entityType, entityLevel);
    const applicableNoteIds = new Set(applicableNotes.map(n => n.id));

    const scheduleNav = allScheduleNav.filter(item => {
        if (item.type === 'header') return true;
        
        // Special handling for Partners/Owners funds which combines two views
        if (item.id === 'partnersFunds') {
            return entityInfo.entityType === 'LLP' || entityInfo.entityType === 'Non-Corporate';
        }
        if (item.id === 'shareCapital' || item.id === 'otherEquity') {
            return entityInfo.entityType === 'Company';
        }

        // FIX: A schedule should be shown if it's not tied to a selectable note, OR if it is tied to one that is applicable.
        const noteId = (item as {noteId?: string}).noteId;
        if (noteId) {
            const note = scheduleData.noteSelections.find(n => n.id === noteId);
            return note ? note.isSelected : true;
        }
        return true;
    });

    return (
        <div className="p-6 h-full flex flex-col space-y-4">
             <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Schedules Entry</h1>
                    <p className="text-sm text-gray-400">Enter detailed data for notes and schedules.</p>
                </div>
                 {isFinalized ? (
                    <button onClick={handleEdit} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-md">Edit Schedules</button>
                 ) : (
                    <button onClick={() => setConfirmModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md">Finalize Schedules</button>
                 )}
            </header>
            
            {isFinalized && <FinalizedBanner />}

            <div className="flex-1 flex space-x-4 overflow-hidden">
                <aside className="w-64 bg-gray-800 p-2 rounded-lg border border-gray-700 overflow-y-auto">
                    <nav className="space-y-1">
                        {scheduleNav.map(item => {
                            if (item.type === 'header') {
                                return <h4 key={item.name} className="font-bold text-xs uppercase text-gray-500 mt-4 mb-1 px-3">{item.name}</h4>;
                            }
                            // Logic to select correct view for partners/owners funds
                            let viewId = item.id;
                            if (item.id === 'partnersFunds' && entityInfo.entityType === 'Non-Corporate') {
                                viewId = 'ownersFunds';
                            }
                            return <button key={item.id} onClick={() => setActiveView(viewId as ScheduleView)} className={`w-full text-left px-3 py-2 text-sm rounded-md ${activeView === viewId ? 'bg-brand-blue text-white' : 'hover:bg-gray-700'}`}>{item.name}</button>
                        })}
                    </nav>
                </aside>
                <main className="flex-1 bg-gray-800 p-6 rounded-lg border border-gray-700 overflow-y-auto">
                    {renderSchedule()}
                </main>
            </div>
             <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleFinalize}
                title="Finalize Schedules?"
                message="Finalizing will lock the data entry for all schedules. You can still edit them later, but this marks a point of completion."
                confirmButtonText="Yes, Finalize"
                confirmButtonClass="bg-green-600 hover:bg-green-700"
            />
        </div>
    );
};