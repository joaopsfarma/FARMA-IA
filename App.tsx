
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
  Stethoscope
} from 'lucide-react';
import { generateEvolution } from './services/geminiService.ts';
import { EvolutionState } from './types.ts';
import { APP_TITLE, APP_SUBTITLE } from './constants.tsx';

const App: React.FC = () => {
  const [state, setState] = useState<EvolutionState>({
    rawInput: '',
    output: '',
    isLoading: false,
    error: null,
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
      setState(prev => ({ ...prev, error: "Conexão perdida. Verifique sua internet." }));
      return;
    }
    if (!state.rawInput.trim()) {
      setState(prev => ({ ...prev, error: "Por favor, cole os dados brutos (evolução médica, exames, prescrição) antes de gerar." }));
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
    if (confirm('Deseja realmente apagar todos os dados inseridos e o resultado gerado?')) {
      setState({
        rawInput: '',
        output: '',
        isLoading: false,
        error: null,
      });
    }
  };

  const handleCopy = useCallback(() => {
    if (!state.output) return;
    navigator.clipboard.writeText(state.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [state.output]);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-50 overflow-hidden font-sans selection:bg-blue-100">
      {/* Barra de Status Offline */}
      {!isOnline && (
        <div className="bg-red-600 text-white text-center py-1.5 text-[10px] font-black tracking-[0.2em] flex items-center justify-center gap-2 z-50">
          <WifiOff className="w-3 h-3" /> SISTEMA OFFLINE - FUNCIONALIDADES LIMITADAS
        </div>
      )}

      {/* Header Profissional */}
      <header className="bg-white border-b border-slate-200 py-3 px-6 flex justify-between items-center shrink-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight leading-none">{APP_TITLE}</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">{APP_SUBTITLE}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleClear}
            className="flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" /> 
            <span className="hidden sm:inline">Limpar Terminal</span>
          </button>
        </div>
      </header>

      {/* Área Principal - Grid */}
      <main className="flex-1 overflow-hidden p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Coluna de Entrada */}
        <section className="flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group transition-all hover:shadow-md">
          <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ClipboardPaste className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Coleta de Dados Brutos</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">INPUT</span>
          </div>
          
          <div className="flex-1 p-5 flex flex-col gap-5 overflow-hidden">
            <textarea 
              value={state.rawInput}
              onChange={(e) => setState(prev => ({ ...prev, rawInput: e.target.value }))}
              className="flex-1 w-full text-sm p-5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all resize-none font-sans leading-relaxed text-slate-700 placeholder:text-slate-300"
              placeholder="Cole aqui os dados desestruturados: evolução médica, lista de medicamentos, resultados de exames laboratoriais, balanço hídrico, etc..."
            />
            
            <button 
              onClick={handleGenerate}
              disabled={state.isLoading}
              className="w-full bg-slate-900 hover:bg-blue-600 active:scale-[0.99] text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-200 transition-all flex justify-center items-center gap-3 disabled:bg-slate-200 disabled:shadow-none shrink-0 group"
            >
              {state.isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
              )}
              <span className="tracking-[0.1em]">{state.isLoading ? 'PROCESSANDO INTELIGÊNCIA...' : 'GERAR EVOLUÇÃO CLÍNICA'}</span>
            </button>

            {state.error && (
              <div className="bg-red-50 text-red-800 p-4 rounded-2xl border border-red-100 text-[11px] flex items-start gap-3 animate-in fade-in slide-in-from-top-2 shrink-0 overflow-y-auto max-h-40">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                <div className="flex flex-col gap-1">
                  <p className="font-black uppercase tracking-tighter">Erro Identificado:</p>
                  <p className="leading-relaxed whitespace-pre-wrap">{state.error}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Coluna de Saída (Terminal Profissional) */}
        <section className="flex flex-col bg-slate-900 rounded-2xl shadow-2xl shadow-blue-900/10 border border-slate-800 overflow-hidden relative">
          <div className="bg-slate-950/80 px-5 py-3 flex justify-between items-center border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Evolução Estruturada</span>
            </div>
            <button 
              onClick={handleCopy}
              disabled={!state.output}
              className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                copied ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95'
              } disabled:opacity-20`}
            >
              {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          
          <div className="flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800 to-slate-950">
            {state.isLoading && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-30 flex items-center justify-center text-white p-8">
                <div className="text-center animate-pulse">
                  <div className="relative mb-6">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                    <Bot className="w-6 h-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-sm font-black text-blue-400 tracking-[0.2em] mb-2 uppercase">Analisando Farmacoterapia</p>
                  <p className="text-[10px] text-slate-500 font-medium max-w-[200px] mx-auto leading-relaxed">Cruzando dados de ClCr, interações graves e metas terapêuticas...</p>
                </div>
              </div>
            )}

            <textarea 
              readOnly
              value={state.output}
              className="w-full h-full bg-transparent text-emerald-50/90 text-sm p-8 font-mono focus:outline-none leading-8 resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 selection:bg-emerald-500/30"
              placeholder="Aguardando entrada de dados para iniciar análise clínica estruturada..."
            />
          </div>

          <div className="absolute bottom-4 right-4 z-20 pointer-events-none opacity-20">
            <Bot className="w-24 h-24 text-slate-400" />
          </div>
        </section>
      </main>
      
      {/* Footer Minimalista */}
      <footer className="bg-white border-t border-slate-100 px-6 py-2.5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">PharmaAI v1.3.0 // Clinical Engine</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Ambiente de Análise Seguro Habilitado</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
