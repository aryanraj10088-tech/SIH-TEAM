// src/components/GenerationConfigModal.tsx
import React, { useState } from 'react';
import { Sparkles, X, FileText, Film, Users, MessageSquare, BarChart2, Globe, Target, Loader2, ExternalLink } from 'lucide-react';

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

const FORMAT_OPTIONS = [
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'linkedin', label: 'LinkedIn', icon: ExternalLink },
  { id: 'video', label: 'Video Script', icon: Film },
];

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

  const selectClass = "w-full bg-gray-100 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all";
  const labelClass = "flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 rounded-2xl max-w-lg w-full shadow-2xl shadow-black/20">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4.5 h-4.5 text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Configure Generation</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Set your output preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Output Formats */}
          <div>
            <label className={labelClass}>
              <BarChart2 className="w-3.5 h-3.5" /> Output Formats
            </label>
            <div className="flex gap-2 flex-wrap">
              {FORMAT_OPTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => toggleFormat(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150 ${
                    targetFormats.includes(id)
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-400 dark:hover:border-indigo-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Audience & Tone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <Users className="w-3.5 h-3.5" /> Target Audience
              </label>
              <select value={audience} onChange={e => setAudience(e.target.value)} className={selectClass}>
                <option>Executive</option>
                <option>Technical Team</option>
                <option>General Public</option>
                <option>Policy Makers</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>
                <MessageSquare className="w-3.5 h-3.5" /> Tone
              </label>
              <select value={tone} onChange={e => setTone(e.target.value)} className={selectClass}>
                <option>Professional</option>
                <option>Persuasive</option>
                <option>Urgent / Critical</option>
                <option>Informative</option>
              </select>
            </div>
          </div>

          {/* Detail Level & Language */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <BarChart2 className="w-3.5 h-3.5" /> Detail Level
              </label>
              <select value={detailLevel} onChange={e => setDetailLevel(e.target.value)} className={selectClass}>
                <option>Brief</option>
                <option>Standard</option>
                <option>In-Depth</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>
                <Globe className="w-3.5 h-3.5" /> Language
              </label>
              <select value={language} onChange={e => setLanguage(e.target.value)} className={selectClass}>
                <option>English</option>
                <option>Hindi</option>
                <option>Tamil</option>
                <option>Bengali</option>
              </select>
            </div>
          </div>

          {/* Core Objective */}
          <div>
            <label className={labelClass}>
              <Target className="w-3.5 h-3.5" /> Core Objective
            </label>
            <input
              type="text"
              value={objective}
              onChange={e => setObjective(e.target.value)}
              placeholder="e.g. Risk analysis for board presentation"
              className={selectClass}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isGenerating || targetFormats.length === 0}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 mt-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running AI Pipeline...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate {targetFormats.length > 0 ? `${targetFormats.length} Output${targetFormats.length > 1 ? 's' : ''}` : 'Outputs'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
