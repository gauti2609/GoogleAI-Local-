import React, { useState, useEffect } from 'react';
import { TrialBalanceItem, Masters, MappingSuggestion } from '../types.ts';
import * as apiService from '../services/apiService.ts';
import { WandIcon, CheckCircleIcon, TrashIcon } from './icons.tsx';

interface MappingPanelProps {
  ledgers: TrialBalanceItem[];
  masters: Masters;
  onMapLedger: (ledgerIds: string[], mapping: { majorHeadCode: string; minorHeadCode: string; groupingCode: string; lineItemCode: string }) => void;
  onUnmapLedger: (ledgerIds: string[]) => void;
  token: string;
}

export const MappingPanel: React.FC<MappingPanelProps> = ({ ledgers, masters, onMapLedger, onUnmapLedger, token }) => {
  const [majorHead, setMajorHead] = useState('');
  const [minorHead, setMinorHead] = useState('');
  const [grouping, setGrouping] = useState('');
  const [lineItem, setLineItem] = useState('');
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [suggestion, setSuggestion] = useState<MappingSuggestion | null>(null);

  const ledger = ledgers.length === 1 ? ledgers[0] : null;
  const isMultiSelect = ledgers.length > 1;

  useEffect(() => {
    // Load existing mapping if single ledger is already mapped, otherwise reset form
    if (ledger?.isMapped && ledger.majorHeadCode && ledger.minorHeadCode && ledger.groupingCode) {
      setMajorHead(ledger.majorHeadCode);
      setMinorHead(ledger.minorHeadCode);
      setGrouping(ledger.groupingCode);
      setLineItem(ledger.lineItemCode || '');
      setSuggestion(null);
    } else {
      setMajorHead('');
      setMinorHead('');
      setGrouping('');
      setLineItem('');
      setSuggestion(null);
    }
  }, [ledger]);
  
  const handleGenerateSuggestion = async () => {
    if (!ledger) return;
    setIsLoadingSuggestion(true);
    setSuggestion(null);
    const result = await apiService.getMappingSuggestion(token, ledger.ledger, ledger.closingCy, masters);
    if (result) {
        setSuggestion(result);
    }
    setIsLoadingSuggestion(false);
  };
  
  const handleApplySuggestion = () => {
    if (suggestion) {
      setMajorHead(suggestion.majorHeadCode);
      const suggestedMinorHead = masters.minorHeads.find(mh => mh.code === suggestion.minorHeadCode);
      if (suggestedMinorHead?.majorHeadCode === suggestion.majorHeadCode) {
        setMinorHead(suggestion.minorHeadCode);
        const suggestedGrouping = masters.groupings.find(g => g.code === suggestion.groupingCode);
        if (suggestedGrouping?.minorHeadCode === suggestion.minorHeadCode) {
            setGrouping(suggestion.groupingCode);
            // Set line item if suggested
            if (suggestion.lineItemCode) {
              const suggestedLineItem = masters.lineItems.find(li => li.code === suggestion.lineItemCode);
              if (suggestedLineItem?.groupingCode === suggestion.groupingCode) {
                setLineItem(suggestion.lineItemCode);
              } else {
                setLineItem('');
              }
            } else {
              setLineItem('');
            }
        } else {
             setGrouping('');
             setLineItem('');
        }
      } else {
        setMinorHead('');
        setGrouping('');
        setLineItem('');
      }
    }
  };
  
  const handleMap = () => {
    if (ledgers.length > 0 && majorHead && minorHead && grouping) {
      onMapLedger(ledgers.map(l => l.id), {
        majorHeadCode: majorHead,
        minorHeadCode: minorHead,
        groupingCode: grouping,
        lineItemCode: lineItem || '',
      });
    }
  };
  
  const handleUnmap = () => {
    if (ledgers.length > 0 && ledgers.some(l => l.isMapped)) {
      onUnmapLedger(ledgers.map(l => l.id));
    }
  };

  if (ledgers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <h3 className="text-lg font-semibold text-gray-300">No Ledger Selected</h3>
        <p className="text-sm text-gray-500 mt-1">Select a ledger from either table to begin mapping or editing.</p>
      </div>
    );
  }
  
  const availableMinorHeads = masters.minorHeads.filter(mh => mh.majorHeadCode === majorHead);
  const availableGroupings = masters.groupings.filter(g => g.minorHeadCode === minorHead);
  const availableLineItems = masters.lineItems.filter(li => li.groupingCode === grouping);
  
  // Title and display for multi-select or single ledger
  const title = isMultiSelect ? `Map Multiple Ledgers (${ledgers.length})` : (ledger?.isMapped ? 'Edit Mapping' : 'Map Ledger');
  const anyMapped = ledgers.some(l => l.isMapped);

  return (
    <div className="p-4 flex flex-col h-full">
      <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
      {!isMultiSelect && ledger && (
        <>
          <p className="text-lg text-brand-blue-light font-semibold mb-1 truncate" title={ledger.ledger}>{ledger.ledger}</p>
          <p className={`text-xs ${ledger.closingCy >= 0 ? 'text-green-400' : 'text-red-400'} mb-4`}>
            Balance: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Math.abs(ledger.closingCy))} ({ledger.closingCy >= 0 ? 'Dr' : 'Cr'})
          </p>
        </>
      )}
      {isMultiSelect && (
        <div className="mb-4">
          <p className="text-sm text-gray-400">Selected ledgers:</p>
          <div className="mt-1 max-h-20 overflow-y-auto bg-gray-700/50 rounded p-2">
            {ledgers.map(l => (
              <p key={l.id} className="text-xs text-gray-300 truncate" title={l.ledger}>{l.ledger}</p>
            ))}
          </div>
        </div>
      )}

      {/* AI Suggestion Section - only for single ledger */}
      {!isMultiSelect && ledger && (
        <div className="mb-6">
          <button
            onClick={handleGenerateSuggestion}
            disabled={isLoadingSuggestion}
            className="w-full flex items-center justify-center bg-brand-blue hover:bg-brand-blue-dark disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            <WandIcon className="w-5 h-5 mr-2" />
            {isLoadingSuggestion ? 'Generating...' : 'Get AI Suggestion'}
          </button>
          {suggestion && (
            <div className="mt-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
              <h4 className="font-semibold text-gray-200 text-sm">AI Suggestion (Confidence: { (suggestion.confidence * 100).toFixed(0) }%)</h4>
              <p className="text-xs text-gray-400 mt-1 italic">"{suggestion.reasoning}"</p>
              <div className="text-sm mt-2 text-gray-300">
                  {masters.majorHeads.find(m=>m.code === suggestion.majorHeadCode)?.name} &gt; {masters.minorHeads.find(m=>m.code === suggestion.minorHeadCode)?.name} &gt; {masters.groupings.find(m=>m.code === suggestion.groupingCode)?.name}
                  {suggestion.lineItemCode && ` > ${masters.lineItems.find(li=>li.code === suggestion.lineItemCode)?.name}`}
              </div>
              <button onClick={handleApplySuggestion} className="text-sm text-brand-blue-light hover:underline mt-2">Apply Suggestion</button>
            </div>
          )}
        </div>
      )}

      {/* Manual Mapping Section */}
      <div className="space-y-4 flex-1 overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-gray-400">Major Head</label>
          <select value={majorHead} onChange={e => { setMajorHead(e.target.value); setMinorHead(''); setGrouping(''); setLineItem(''); }} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white disabled:bg-gray-800 disabled:cursor-not-allowed">
            <option value="">Select Major Head</option>
            {masters.majorHeads.map(mh => <option key={mh.code} value={mh.code}>{mh.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">Minor Head</label>
          <select value={minorHead} onChange={e => { setMinorHead(e.target.value); setGrouping(''); setLineItem(''); }} disabled={!majorHead} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white disabled:bg-gray-800 disabled:cursor-not-allowed">
            <option value="">Select Minor Head</option>
            {availableMinorHeads.map(mh => <option key={mh.code} value={mh.code}>{mh.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">Grouping</label>
          <select value={grouping} onChange={e => { setGrouping(e.target.value); setLineItem(''); }} disabled={!minorHead} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white disabled:bg-gray-800 disabled:cursor-not-allowed">
            <option value="">Select Grouping</option>
            {availableGroupings.map(g => <option key={g.code} value={g.code}>{g.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">Line Item (Optional)</label>
          <select value={lineItem} onChange={e => setLineItem(e.target.value)} disabled={!grouping} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white disabled:bg-gray-800 disabled:cursor-not-allowed">
            <option value="">No Line Item (Direct Mapping)</option>
            {availableLineItems.map(li => <option key={li.code} value={li.code}>{li.name}</option>)}
          </select>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="mt-auto pt-4 space-y-2">
        <button
          onClick={handleMap}
          disabled={!majorHead || !minorHead || !grouping}
          className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2.5 px-4 rounded-md transition-colors"
        >
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          {anyMapped ? `Update Mapping${isMultiSelect ? 's' : ''}` : `Confirm Mapping${isMultiSelect ? 's' : ''}`}
        </button>
        {anyMapped && (
          <button
            onClick={handleUnmap}
            className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            <TrashIcon className="w-5 h-5 mr-2" />
            Remove Mapping{isMultiSelect ? 's' : ''}
          </button>
        )}
      </div>
    </div>
  );
};