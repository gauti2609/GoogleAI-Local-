import React, { useState, useEffect } from 'react';
import { TrialBalanceItem, Masters, MappingSuggestion } from '../types.ts';
import * as apiService from '../services/apiService.ts';
import { WandIcon, CheckCircleIcon } from './icons.tsx';

interface MappingPanelProps {
  ledger: TrialBalanceItem | undefined;
  masters: Masters;
  onMapLedger: (ledgerId: string, mapping: { majorHeadCode: string; minorHeadCode: string; groupingCode: string }) => void;
  token: string;
}

export const MappingPanel: React.FC<MappingPanelProps> = ({ ledger, masters, onMapLedger, token }) => {
  const [majorHead, setMajorHead] = useState('');
  const [minorHead, setMinorHead] = useState('');
  const [grouping, setGrouping] = useState('');
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [suggestion, setSuggestion] = useState<MappingSuggestion | null>(null);

  useEffect(() => {
    // Reset form when ledger changes
    setMajorHead('');
    setMinorHead('');
    setGrouping('');
    setSuggestion(null);
  }, [ledger]);
  
  const handleGenerateSuggestion = async () => {
    if (!ledger) return;
    setIsLoadingSuggestion(true);
    setSuggestion(null);
    const result = await apiService.getMappingSuggestion(token, ledger.ledger, masters);
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
        } else {
             setGrouping('');
        }
      } else {
        setMinorHead('');
        setGrouping('');
      }
    }
  };
  
  const handleMap = () => {
    if (ledger && majorHead && minorHead && grouping) {
      onMapLedger(ledger.id, {
        majorHeadCode: majorHead,
        minorHeadCode: minorHead,
        groupingCode: grouping,
      });
    }
  };

  if (!ledger) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <h3 className="text-lg font-semibold text-gray-300">No Ledger Selected</h3>
        <p className="text-sm text-gray-500 mt-1">Select a ledger from the "To Be Mapped" list to begin.</p>
      </div>
    );
  }
  
  const availableMinorHeads = masters.minorHeads.filter(mh => mh.majorHeadCode === majorHead);
  const availableGroupings = masters.groupings.filter(g => g.minorHeadCode === minorHead);

  return (
    <div className="p-4 flex flex-col h-full">
      <h2 className="text-xl font-bold text-white mb-1">Map Ledger</h2>
      <p className="text-lg text-brand-blue-light font-semibold mb-4 truncate" title={ledger.ledger}>{ledger.ledger}</p>

      {/* AI Suggestion Section */}
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
            </div>
            <button onClick={handleApplySuggestion} className="text-sm text-brand-blue-light hover:underline mt-2">Apply Suggestion</button>
          </div>
        )}
      </div>

      {/* Manual Mapping Section */}
      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-sm font-medium text-gray-400">Major Head</label>
          <select value={majorHead} onChange={e => { setMajorHead(e.target.value); setMinorHead(''); setGrouping(''); }} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white disabled:bg-gray-800 disabled:cursor-not-allowed">
            <option value="">Select Major Head</option>
            {masters.majorHeads.map(mh => <option key={mh.code} value={mh.code}>{mh.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">Minor Head</label>
          <select value={minorHead} onChange={e => { setMinorHead(e.target.value); setGrouping(''); }} disabled={!majorHead} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white disabled:bg-gray-800 disabled:cursor-not-allowed">
            <option value="">Select Minor Head</option>
            {availableMinorHeads.map(mh => <option key={mh.code} value={mh.code}>{mh.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">Grouping</label>
          <select value={grouping} onChange={e => setGrouping(e.target.value)} disabled={!minorHead} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white disabled:bg-gray-800 disabled:cursor-not-allowed">
            <option value="">Select Grouping</option>
            {availableGroupings.map(g => <option key={g.code} value={g.code}>{g.name}</option>)}
          </select>
        </div>
      </div>
      
      {/* Action Button */}
      <div className="mt-auto pt-4">
        <button
          onClick={handleMap}
          disabled={!majorHead || !minorHead || !grouping}
          className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2.5 px-4 rounded-md transition-colors"
        >
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          Confirm Mapping
        </button>
      </div>
    </div>
  );
};