// src/components/GenerationConfigModal.tsx
import React, { useState } from 'react';
import { Sliders, X } from 'lucide-react';

export interface GenerationConfig {
  targetFormats: string[];
  audience: string;
  tone: string;
  detailLevel: string;
  objective: string;
  language: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: GenerationConfig) => void;
  isGenerating: boolean;
}

export const GenerationConfigModal: React.FC<Props> = ({ isOpen, onClose, onGenerate, isGenerating }) => {
  const [targetFormats, setTargetFormats] = useState<string[]>(['summary', 'linkedin']);
  const [audience, setAudience] = useState('Executive');
  const [tone, setTone] = useState('Professional');
  const [detailLevel, setDetailLevel] = useState('Standard');
  const [objective, setObjective] = useState('Briefing');
  const [language, setLanguage] = useState('English');

  if (!isOpen) return null;

  const toggleFormat = (format: string) => {
    setTargetFormats(prev => 
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ targetFormats, audience, tone, detailLevel, objective, language });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold">Configure Generation</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Output Formats</label>
            <div className="flex gap-2">
              {['summary', 'video', 'linkedin'].map(fmt => (
                <button
                  type="button"
                  key={fmt}
                  onClick={() => toggleFormat(fmt)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border capitalize ${
                    targetFormats.includes(fmt) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Target Audience</label>
              <select value={audience} onChange={e => setAudience(e.target.value)} className="w-full border rounded-lg p-2 text-sm">
                <option>Executive</option>
                <option>Technical Team</option>
                <option>General Public</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tone</label>
              <select value={tone} onChange={e => setTone(e.target.value)} className="w-full border rounded-lg p-2 text-sm">
                <option>Professional</option>
                <option>Persuasive</option>
                <option>Urgent / Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Detail Level</label>
              <select value={detailLevel} onChange={e => setDetailLevel(e.target.value)} className="w-full border rounded-lg p-2 text-sm">
                <option>Brief</option>
                <option>Standard</option>
                <option>In-Depth</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full border rounded-lg p-2 text-sm">
                <option>English</option>
                <option>Hindi</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Core Objective</label>
            <input 
              type="text"
              value={objective} 
              onChange={e => setObjective(e.target.value)} 
              placeholder="e.g. Risk analysis for hackathon submission"
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating || targetFormats.length === 0}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition mt-4"
          >
            {isGenerating ? 'Firing Pipeline...' : 'Generate Selected Outputs'}
          </button>
        </form>
      </div>
    </div>
  );
};