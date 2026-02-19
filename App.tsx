
import React, { useState, useCallback, useEffect } from 'react';
import { 
  Bot, 
  Trash2, 
  ClipboardPaste, 
  Sparkles, 
  AlertTriangle, 
  FileCheck2, 
  Copy, 
  CheckCheck,
  Loader2,
  WifiOff,
  Stethoscope,
  Settings
} from 'lucide-react';
import { generateEvolution } from './services/geminiService.ts';
import { APP_TITLE, APP_SUBTITLE } from './constants.tsx';

const App: React.FC = () => {
  const [state, setState] = useState({
    rawInput: '',
    output: '',
    isLoading: false,
    error: null as string | null,
  });
  const [copied, setCopied] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleGenerate = async () => {
    if (!isOnline) {
      setState(prev => ({ ...prev, error: "Sem conexão com a internet." }));
      return;
    }
    if (!state.rawInput.trim()) {
      setState(prev => ({ ...prev, error: "Insira os dados clínicos para análise." }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await generateEvolution(state.rawInput);
      setState(prev => ({ ...prev, output: result, isLoading: false }));
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, isLoading: false }));
    }
  };

  const handleClear = () => {
    if (confirm('Limpar todos os dados?')) {
      setState({
        rawInput: '',
        output: '',
        isLoading: false,
        error: null,
      });
    }
  };

  const changeKey = () => {
    const newKey = prompt("Insira a nova API KEY:");
    if (newKey) {
      localStorage.setItem('PHARMA_AI_KEY', newKey);
      window.location.reload();
    }
  };

  const handleCopy = useCallback(() => {
    if (!state.output) return;
    navigator.clipboard.writeText(state.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [state.output]);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-50 overflow-hidden font-sans">
      {!isOnline && (
        <div className="bg-red-600 text-white text-center py-1 text-[10px] font-bold tracking-widest z-50">
          VOCÊ ESTÁ OFFLINE
        </div>
      )}

      <header className="bg-white border-b border-slate-200 py-3 px-6 flex justify-between items-center shadow-sm z-40">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">{APP_TITLE}</h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{APP_SUBTITLE}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={changeKey} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Configurar Chave">
            <Settings className="w-4 h-4" />
          </button>
          <button onClick={handleClear} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Limpar">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ClipboardPaste className="w-3 h-3" /> Entrada de Dados
            </span>
          </div>
          <div className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
            <textarea 
              value={state.rawInput}
              onChange={(e) => setState(prev => ({ ...prev, rawInput: e.target.value }))}
              className="flex-1 w-full text-sm p-4 bg-slate-50/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none leading-relaxed"
              placeholder="Cole os dados brutos aqui (Exames, Prescrição, Evolução Médica)..."
            />
            <button 
              onClick={handleGenerate}
              disabled={state.isLoading}
              className="w-full bg-slate-900 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition-all flex justify-center items-center gap-2 disabled:bg-slate-200"
            >
              {state.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{state.isLoading ? 'ANALISANDO...' : 'GERAR EVOLUÇÃO'}</span>
            </button>
            {state.error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-100 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col bg-slate-900 rounded-xl shadow-xl border border-slate-800 overflow-hidden relative">
          <div className="bg-slate-950 px-4 py-2 flex justify-between items-center border-b border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <FileCheck2 className="w-3 h-3 text-emerald-400" /> Resultado Estruturado
            </span>
            <button 
              onClick={handleCopy}
              disabled={!state.output}
              className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-md transition-all flex items-center gap-2 ${
                copied ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              } disabled:opacity-20`}
            >
              {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <div className="flex-1 bg-slate-900">
            <textarea 
              readOnly
              value={state.output}
              className="w-full h-full bg-transparent text-emerald-50/90 text-[13px] p-6 font-mono focus:outline-none leading-relaxed resize-none overflow-y-auto scrollbar-thin"
              placeholder="Aguardando análise..."
            />
          </div>
        </section>
      </main>
      
      <footer className="bg-white border-t border-slate-200 px-6 py-2 flex justify-between items-center shrink-0">
        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">PharmaAI v1.4.0</span>
        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Uso Clínico Restrito</span>
      </footer>
    </div>
  );
};

export default App;
