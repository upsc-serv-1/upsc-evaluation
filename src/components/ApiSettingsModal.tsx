import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Globe, 
  Cpu, 
  CheckCircle2, 
  RotateCcw, 
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Server
} from 'lucide-react';
import { ApiConnectionConfig } from '../types';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiConnectionConfig;
  onSave: (config: ApiConnectionConfig) => void;
}

const GEMINI_MODELS = [
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Default)', desc: 'Fast multimodal OCR extraction & responsive margin commentary' },
  { id: 'gemini-3.8-pro', name: 'Gemini 3.8 Pro', desc: 'Maximum analytical depth & strict UPSC benchmark grading' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Balanced speed & accuracy' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Detailed subject evaluation and multi-agent arbitration' },
];

const OPENAI_COMPATIBLE_MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o (Multimodal Vision)', desc: 'High visual accuracy for reading handwritten Hindi/English scripts' },
  { id: 'gpt-4o-mini', name: 'GPT-4o-mini', desc: 'Fast, lightweight evaluation' },
  { id: 'o3-mini', name: 'o3-mini (Reasoning Model)', desc: 'Deep logical checking of UPSC physical & legal mechanisms' },
  { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet (via OpenRouter/Proxy)', desc: 'Exceptional human teacher nuance & pedagogical feedback' },
  { id: 'deepseek-chat', name: 'DeepSeek-V3 / R1 (via DeepSeek / OpenRouter)', desc: 'Cost-effective high reasoning accuracy' },
  { id: 'custom', name: 'Custom Model ID', desc: 'Specify any model identifier supported by your endpoint' },
];

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [provider, setProvider] = useState<'gemini' | 'openai_compatible'>(config.provider || 'gemini');
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [baseUrl, setBaseUrl] = useState(config.baseUrl || '');
  const [selectedModel, setSelectedModel] = useState(config.model || (config.provider === 'openai_compatible' ? 'gpt-4o' : 'gemini-3.8-flash'));
  const [customModel, setCustomModel] = useState(config.customModel || '');
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleProviderSwitch = (newProvider: 'gemini' | 'openai_compatible') => {
    setProvider(newProvider);
    if (newProvider === 'openai_compatible') {
      if (!baseUrl) {
        setBaseUrl('https://api.openai.com/v1');
      }
      if (selectedModel.startsWith('gemini')) {
        setSelectedModel('gpt-4o');
      }
    } else {
      if (baseUrl === 'https://api.openai.com/v1') {
        setBaseUrl('');
      }
      if (!selectedModel.startsWith('gemini')) {
        setSelectedModel('gemini-3.8-flash');
      }
    }
  };

  const handleSave = () => {
    const finalModel = selectedModel === 'custom' && customModel.trim() ? customModel.trim() : selectedModel;
    onSave({
      provider,
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim(),
      model: finalModel,
      customModel: customModel.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 400);
  };

  const handleClear = () => {
    setProvider('gemini');
    setApiKey('');
    setBaseUrl('');
    setSelectedModel('gemini-3.8-flash');
    setCustomModel('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-900/30 border border-amber-700/50 flex items-center justify-center text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-slate-100">
                API Key & Provider Settings
              </h3>
              <p className="text-xs text-slate-400">
                Support for Google Gemini & OpenAI-compatible endpoints (OpenAI, OpenRouter, Groq, DeepSeek, Local LLMs).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs overflow-y-auto">
          
          {/* PROVIDER SELECTOR TABS */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200">
              Select API Protocol / Provider:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleProviderSwitch('gemini')}
                className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition-all ${
                  provider === 'gemini'
                    ? 'bg-amber-950/40 border-amber-500 text-amber-200 ring-1 ring-amber-500/50'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Sparkles className={`w-4 h-4 mt-0.5 ${provider === 'gemini' ? 'text-amber-400' : 'text-slate-400'}`} />
                <div>
                  <div className="font-bold text-xs">Google Gemini</div>
                  <div className="text-[10px] text-slate-400">Native Google GenAI SDK</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleProviderSwitch('openai_compatible')}
                className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition-all ${
                  provider === 'openai_compatible'
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Server className={`w-4 h-4 mt-0.5 ${provider === 'openai_compatible' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <div>
                  <div className="font-bold text-xs">OpenAI-Compatible</div>
                  <div className="text-[10px] text-slate-400">OpenAI, OpenRouter, Groq, DeepSeek</div>
                </div>
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-start space-x-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-200">
                Persistent in Local Storage & Active Evaluation Session
              </p>
              <p className="text-[11px] text-slate-400">
                {provider === 'openai_compatible'
                  ? 'Your OpenAI-compatible API key and Base URL are remembered in your browser and used to power all 4 evaluation passes (/chat/completions).'
                  : 'Your Gemini API key and Base URL are stored in your browser. If left empty, the server environment key is used.'}
              </p>
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200 flex items-center space-x-1.5">
                <Key className={`w-3.5 h-3.5 ${provider === 'openai_compatible' ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span>{provider === 'openai_compatible' ? 'OpenAI / Custom API Key:' : 'Gemini API Key:'}</span>
              </label>
              <span className="text-[10px] text-slate-400">
                {provider === 'openai_compatible' ? 'sk-... or Bearer key' : 'Optional if set in AI Studio Secrets'}
              </span>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={provider === 'openai_compatible' ? 'sk-proj-... (Paste OpenAI or OpenRouter key)' : 'AIzaSy... (Paste Gemini API Key)'}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 pr-10 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Custom Base URL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200 flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Base URL (API Endpoint):</span>
              </label>
              <span className="text-[10px] text-slate-400">
                {provider === 'openai_compatible' ? 'e.g. https://api.openai.com/v1' : 'Default: Google GenAI Gateway'}
              </span>
            </div>

            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder={provider === 'openai_compatible' ? 'https://api.openai.com/v1 (or https://openrouter.ai/api/v1)' : 'https://generativelanguage.googleapis.com (or proxy)'}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400">Quick fill:</span>
              {provider === 'openai_compatible' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setBaseUrl('https://api.openai.com/v1')}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 text-[10px] font-mono border border-slate-700"
                  >
                    OpenAI
                  </button>
                  <button
                    type="button"
                    onClick={() => setBaseUrl('https://openrouter.ai/api/v1')}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 text-[10px] font-mono border border-slate-700"
                  >
                    OpenRouter
                  </button>
                  <button
                    type="button"
                    onClick={() => setBaseUrl('https://api.groq.com/openai/v1')}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 text-[10px] font-mono border border-slate-700"
                  >
                    Groq
                  </button>
                  <button
                    type="button"
                    onClick={() => setBaseUrl('https://api.deepseek.com/v1')}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 text-[10px] font-mono border border-slate-700"
                  >
                    DeepSeek
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setBaseUrl('')}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 text-[10px] font-mono border border-slate-700"
                >
                  Official Google API
                </button>
              )}
            </div>
          </div>

          {/* Model Selector */}
          <div className="space-y-2">
            <label className="font-bold text-slate-200 flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Select Model:</span>
            </label>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {(provider === 'openai_compatible' ? OPENAI_COMPATIBLE_MODELS : GEMINI_MODELS).map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                    selectedModel === m.id
                      ? 'bg-purple-950/40 border-purple-500/80 text-purple-200'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="modelSelection"
                    checked={selectedModel === m.id}
                    onChange={() => setSelectedModel(m.id)}
                    className="mt-0.5 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-slate-100 flex items-center justify-between">
                      <span>{m.name}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-700 font-mono text-[9px] text-slate-300 ml-2 flex-shrink-0">
                        {m.id}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 mt-0.5">
                      {m.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Model ID input if "custom" selected */}
            {(selectedModel === 'custom' || (!GEMINI_MODELS.some(m => m.id === selectedModel) && !OPENAI_COMPATIBLE_MODELS.some(m => m.id === selectedModel))) && (
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-purple-300 mb-1">
                  Enter Custom Model ID:
                </label>
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="e.g. anthropic/claude-3.7-sonnet or meta-llama/llama-3.3-70b-instruct"
                  className="w-full bg-slate-800 border border-purple-500/60 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-400"
                />
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleClear}
            className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white shadow-md flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{savedSuccess ? 'Saved!' : 'Save Credentials'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
