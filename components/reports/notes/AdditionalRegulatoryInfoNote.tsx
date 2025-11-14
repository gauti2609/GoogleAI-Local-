import React from 'react';
import { AdditionalRegulatoryInfoData, FundUtilisationData, FundUtilisationIntermediary, FundUtilisationGuarantee, FundUtilisationUltimate } from '../../../types.ts';

interface AdditionalRegulatoryInfoNoteProps {
    data: AdditionalRegulatoryInfoData;
}

const Section: React.FC<{title: string; children: React.ReactNode; defaultText?: string}> = ({title, children, defaultText}) => {
    const hasContent = React.Children.count(children) > 0 && 
                       React.Children.toArray(children).some(child => child !== null && typeof child !== 'boolean' && (typeof child !== 'string' || child.trim() !== ''));

    return (
        <div className="mt-4 break-inside-avoid">
            <h4 className="font-semibold text-gray-300 text-sm mb-2">{title}</h4>
            <div className="text-xs space-y-1 text-gray-400">
                {hasContent ? children : <p className="italic text-gray-500">{defaultText || 'No items to report.'}</p>}
            </div>
        </div>
    );
}

const InfoRow: React.FC<{label: string; value: string}> = ({label, value}) => (
    <div className="flex justify-between">
        <span>{label}</span>
        <span className="font-mono text-right">{value || '-'}</span>
    </div>
);

// Other display components like FundUtilisationDisplayTable would go here.

export const AdditionalRegulatoryInfoNote: React.FC<AdditionalRegulatoryInfoNoteProps> = ({ data }) => {
    return (
        <div className="space-y-4">
            <Section title="Title deeds of Immovable Property not held in name of the Company">
                {data.immovableProperty && data.immovableProperty.length > 0 && (
                    <table className="min-w-full text-xs">
                        <thead className="bg-gray-800/50"><tr><th className="p-1 text-left">Description</th><th className="p-1 text-right">Carrying Value</th><th className="p-1 text-left">Holder Name</th></tr></thead>
                        <tbody>{data.immovableProperty.map(p => <tr key={p.id}><td className="p-1">{p.description}</td><td className="p-1 text-right">{p.grossCarrying}</td><td className="p-1">{p.holderName}</td></tr>)}</tbody>
                    </table>
                )}
            </Section>
            
            <Section title="Revaluation of Property, Plant and Equipment">
                <p>{data.ppeRevaluation}</p>
            </Section>
            
            <Section title="Loans or Advances to Promoters, Directors, KMPs, etc.">
                {data.loansToPromoters && data.loansToPromoters.length > 0 && (
                     <table className="min-w-full text-xs">
                        <thead className="bg-gray-800/50"><tr><th className="p-1 text-left">Borrower Type</th><th className="p-1 text-right">Amount</th><th className="p-1 text-right">% of Total</th></tr></thead>
                        <tbody>{data.loansToPromoters.map(l => <tr key={l.id}><td className="p-1">{l.borrowerType}</td><td className="p-1 text-right">{l.amount}</td><td className="p-1 text-right">{l.percentage}</td></tr>)}</tbody>
                    </table>
                )}
            </Section>

            <Section title="Benami Property held">
                 {data.benamiProperty && data.benamiProperty.length > 0 && data.benamiProperty.map(p => (
                    <div key={p.id} className="text-xs space-y-1">
                        <p><strong>Details:</strong> {p.details}</p>
                        <p><strong>Amount:</strong> {p.amount}</p>
                    </div>
                ))}
            </Section>

            <Section title="Borrowings from banks/FIs on security of current assets"><p>{data.currentAssetBorrowings}</p></Section>
            <Section title="Wilful Defaulter Status"><p>{data.wilfulDefaulter}</p></Section>

            <Section title="Transactions with Struck off Companies">
                 {data.struckOffCompanies && data.struckOffCompanies.length > 0 && (
                     <table className="min-w-full text-xs">
                        <thead className="bg-gray-800/50"><tr><th className="p-1 text-left">Company</th><th className="p-1 text-left">Nature of Txn</th><th className="p-1 text-right">Balance</th></tr></thead>
                        <tbody>{data.struckOffCompanies.map(c => <tr key={c.id}><td className="p-1">{c.name}</td><td className="p-1">{c.nature}</td><td className="p-1 text-right">{c.balance}</td></tr>)}</tbody>
                    </table>
                )}
            </Section>

            <Section title="Corporate Social Responsibility (CSR)">
                <InfoRow label="Amount required to be spent" value={data.csr.required} />
                <InfoRow label="Amount of expenditure incurred" value={data.csr.spent} />
                <InfoRow label="Shortfall at the end of the year" value={data.csr.shortfall} />
                {data.csr.shortfall && <p className="mt-1"><strong>Reason for shortfall:</strong> {data.csr.reason}</p>}
            </Section>
            
            <Section title="Details of Crypto Currency or Virtual Currency">
                <InfoRow label="Profit or loss on transactions" value={data.crypto.profitOrLoss} />
                <InfoRow label="Amount of currency held as at reporting date" value={data.crypto.amountHeld} />
                <InfoRow label="Deposits or advances from any person for trading or investing" value={data.crypto.advances} />
            </Section>

            <Section title="Registration of charges with ROC"><p>{data.registrationOfCharges}</p></Section>
            <Section title="Compliance with number of layers"><p>{data.layerCompliance}</p></Section>
            <Section title="Compliance with approved Scheme(s) of Arrangements"><p>{data.schemeOfArrangements}</p></Section>
            <Section title="Undisclosed Income"><p>{data.undisclosedIncome}</p></Section>
        </div>
    );
};