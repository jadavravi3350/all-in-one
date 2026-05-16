"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Cloud, ChevronDown, Play, Share2, Settings, RotateCw, 
  ExternalLink, TerminalSquare, BarChart2, Network, Check, Copy, X 
} from 'lucide-react';
import Navbar from '../../componets/Navbar'; // Dhyan dein: Apne path ke hisaab se adjust karein
import Editor from '@monaco-editor/react';
import { emmetHTML } from 'emmet-monaco-es';
import Footer from '@/app/componets/Footer';

type TabType = 'html' | 'css' | 'js';
type LogEntry = { type: 'info' | 'log' | 'error'; message: string };

// --- BOILERPLATES ---
const htmlBoilerplate = {
  html: `<div class="container">\n  <h2>Hello, UtilityHub!</h2>\n  <p>Vanilla JS Environment</p>\n  <button id="action">Execute Logic</button>\n</div>`,
  css: `body {\n  font-family: system-ui, sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  margin: 0;\n  background: #f8f9fc;\n}\n\n.container {\n  text-align: center;\n}\n\nbutton {\n  background: #3b28cc;\n  color: white;\n  border: none;\n  padding: 10px 24px;\n  border-radius: 8px;\n  cursor: pointer;\n  font-weight: 500;\n  font-size: 16px;\n  transition: all 0.3s ease;\n}\n\nbutton:hover {\n  background: #2b1b99;\n  transform: translateY(-2px);\n}`,
  js: `const btn = document.querySelector('#action');\n\nbtn.addEventListener('click', () => {\n  console.log('Vanilla JS Executed!');\n  btn.innerText = 'Executed ✅';\n});`
};

const reactBoilerplate = {
  html: `<div id="root"></div>`,
  css: `body {\n  font-family: system-ui, sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  margin: 0;\n  background: #f8f9fc;\n}\n\n.card {\n  background: white;\n  padding: 2rem;\n  border-radius: 12px;\n  box-shadow: 0 4px 10px rgba(0,0,0,0.1);\n  text-align: center;\n}\n\nbutton {\n  background: #0ea5e9;\n  color: white;\n  border: none;\n  padding: 10px 24px;\n  border-radius: 8px;\n  cursor: pointer;\n  font-weight: bold;\n  margin-top: 10px;\n}`,
  js: `const { useState } = React;\n\nfunction App() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div className="card">\n      <h2>React is Live! ⚛️</h2>\n      <p>You clicked {count} times</p>\n      <button onClick={() => {\n        setCount(count + 1);\n        console.log('React State Updated: ', count + 1);\n      }}>\n        Click Me\n      </button>\n    </div>\n  );\n}\n\n// Render React App\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(<App />);`
};

export default function CodeRunnerPage() {
  const [selectedEnv, setSelectedEnv] = useState<'HTML / CSS / JS' | 'React'>('HTML / CSS / JS');
  const [activeTab, setActiveTab] = useState<TabType>('html');
  const [code, setCode] = useState(htmlBoilerplate);

  const [compiledCode, setCompiledCode] = useState('');
  const [iframeKey, setIframeKey] = useState(0); 
  const [logs, setLogs] = useState<LogEntry[]>([
    { type: 'info', message: 'Environment initialized...' }
  ]);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [logsCopied, setLogsCopied] = useState(false);

  const terminalRef = useRef<HTMLDivElement>(null);

  // Editor Load hone par Emmet Activate Karein
  const handleEditorDidMount = (editor: any, monaco: any) => {
    emmetHTML(monaco);
  };

  const handleEnvChange = (env: 'HTML / CSS / JS' | 'React') => {
    setSelectedEnv(env);
    setIsDropdownOpen(false);
    if (env === 'React') {
      setCode(reactBoilerplate);
      setActiveTab('js'); 
      setLogs([{ type: 'info', message: 'Switched to React 18 Environment (Babel Compiling enabled)' }]);
    } else {
      setCode(htmlBoilerplate);
      setActiveTab('html');
      setLogs([{ type: 'info', message: 'Switched to Vanilla HTML/JS Environment' }]);
    }
  };

  const compileCode = () => {
    let source = '';

    const consoleCaptureScript = `
      <script>
        const originalLog = console.log;
        const originalError = console.error;
        console.log = function(...args) {
          window.parent.postMessage({ type: 'log', message: args.join(' ') }, '*');
          originalLog.apply(console, args);
        };
        console.error = function(...args) {
          window.parent.postMessage({ type: 'error', message: args.join(' ') }, '*');
          originalError.apply(console, args);
        };
        window.onerror = function(msg) {
          window.parent.postMessage({ type: 'error', message: msg }, '*');
        };
      </script>
    `;

    if (selectedEnv === 'React') {
      source = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>${code.css}</style>
            <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            ${consoleCaptureScript}
          </head>
          <body>
            ${code.html}
            <script type="text/babel" data-type="module">
              try {
                ${code.js}
              } catch (err) {
                console.error(err.message);
              }
            </script>
          </body>
        </html>
      `;
    } else {
      source = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>${code.css}</style>
            ${consoleCaptureScript}
          </head>
          <body>
            ${code.html}
            <script>
              try {
                ${code.js}
              } catch (err) {
                console.error(err.message);
              }
            </script>
          </body>
        </html>
      `;
    }
    setCompiledCode(source);
  };

  const handleReload = () => {
    setLogs([{ type: 'info', message: 'Reloading frame...' }]);
    setIframeKey(prev => prev + 1); 
    compileCode();
  };

  const openExternalPreview = () => {
    const blob = new Blob([compiledCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleShareCode = async () => {
    const fullCode = `\n${code.html}\n\n/* CSS */\n${code.css}\n\n// JS\n${code.js}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'UtilityHub Code Snippet', text: fullCode });
      } catch (err) {
        copyToClipboard(fullCode);
      }
    } else {
      copyToClipboard(fullCode);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2000);
  };

  const handleCopyLogs = () => {
    const logText = logs.map(l => `[${l.type}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(logText);
    setLogsCopied(true);
    setTimeout(() => setLogsCopied(false), 2000);
  };

  useEffect(() => {
    if (autoSync) {
      const timer = setTimeout(() => { compileCode(); }, 1200); 
      return () => clearTimeout(timer);
    }
  }, [code, autoSync, selectedEnv]);

  useEffect(() => {
    compileCode();
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && ['log', 'info', 'error'].includes(event.data.type)) {
        setLogs(prev => [...prev, { type: event.data.type, message: event.data.message }]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const clearTerminal = () => setLogs([]);

  const getLanguage = () => {
    if (activeTab === 'html') return 'html';
    if (activeTab === 'css') return 'css';
    return 'javascript'; 
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 pb-12 relative">
      
      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <Settings size={22} className="text-[#3b28cc]" />
                Editor Settings
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-800">Auto-sync Preview</div>
                  <div className="text-xs text-slate-500 mt-1">Automatically compile code as you type</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={autoSync} onChange={() => setAutoSync(!autoSync)} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3b28cc]"></div>
                </label>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-bold text-slate-800">Editor Font Size</div>
                  <div className="text-xs font-bold text-[#3b28cc] bg-indigo-50 px-2 py-1 rounded">{fontSize}px</div>
                </div>
                <input 
                  type="range" 
                  min="12" max="24" 
                  value={fontSize} 
                  onChange={(e) => setFontSize(Number(e.target.value))} 
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#3b28cc]" 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <Navbar />

      <main className="container mx-auto px-6 pt-12 max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900">Code Runner</h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
              Professional execution environment. Supports Vanilla JS and React JSX with live transpilation.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm relative">
            {isDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>}
            <div className="relative z-50">
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-800 text-sm font-medium px-4 py-2.5 rounded-lg flex items-center gap-4 transition-colors border border-slate-100 cursor-pointer select-none"
              >
                {selectedEnv}
                <ChevronDown size={16} className={`text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden py-1">
                  <div onClick={() => handleEnvChange('HTML / CSS / JS')} className="px-4 py-2 text-sm text-slate-800 hover:bg-indigo-50 hover:text-[#3b28cc] cursor-pointer font-medium flex justify-between">
                    HTML / CSS / JS {selectedEnv === 'HTML / CSS / JS' && <Check size={14} />}
                  </div>
                  <div onClick={() => handleEnvChange('React')} className="px-4 py-2 text-sm text-slate-800 hover:bg-sky-50 hover:text-sky-600 cursor-pointer font-medium flex justify-between">
                    React 18 {selectedEnv === 'React' && <Check size={14} />}
                  </div>
                </div>
              )}
            </div>
            
            <button onClick={() => { compileCode(); setLogs(prev => [...prev, { type: 'info', message: 'Manual compile triggered...' }]); }} className="bg-[#3b28cc] hover:bg-indigo-800 text-white text-sm font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all">
              <Play size={16} className="fill-white" /> Run Code
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <button onClick={handleShareCode} className={`p-2 rounded-lg transition-colors ${isShared ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`} title="Share / Copy">
              {isShared ? <Check size={18} /> : <Share2 size={18} />}
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg">
              <Settings size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start mb-10">
          
          <div className="col-span-1 xl:col-span-7 bg-[#1e1e2e] rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-800 h-[600px]">
            <div className="bg-[#181825] flex items-center justify-between px-4 pt-3 border-b border-white/5">
              <div className="flex gap-2">
                <div onClick={() => setActiveTab('html')} className={`text-sm font-medium px-4 py-2 rounded-t-lg flex items-center gap-2 border-t-2 cursor-pointer ${activeTab === 'html' ? 'bg-[#1e1e2e] text-slate-200 border-[#e34c26]' : 'text-slate-500 border-transparent'}`}>
                  <span className="text-[#e34c26] text-xs font-bold">H</span> index.html
                </div>
                <div onClick={() => setActiveTab('css')} className={`text-sm font-medium px-4 py-2 rounded-t-lg flex items-center gap-2 border-t-2 cursor-pointer ${activeTab === 'css' ? 'bg-[#1e1e2e] text-slate-200 border-[#264de4]' : 'text-slate-500 border-transparent'}`}>
                  <span className="text-[#264de4] text-xs font-bold">C</span> styles.css
                </div>
                <div onClick={() => setActiveTab('js')} className={`text-sm font-medium px-4 py-2 rounded-t-lg flex items-center gap-2 border-t-2 cursor-pointer ${activeTab === 'js' ? 'bg-[#1e1e2e] text-slate-200 border-[#f7df1e]' : 'text-slate-500 border-transparent'}`}>
                  <span className="text-[#f7df1e] text-xs font-bold">J</span> {selectedEnv === 'React' ? 'App.jsx' : 'script.js'}
                </div>
              </div>
            </div>

            <div className="flex-1 w-full pt-4 relative">
              <Editor
                height="100%"
                language={getLanguage()}
                theme="vs-dark"
                value={code[activeTab]}
                onChange={(value) => setCode({ ...code, [activeTab]: value || '' })}
                onMount={handleEditorDidMount} 
                options={{
                  fontSize: fontSize,
                  minimap: { enabled: false },
                  wordWrap: 'on',
                  autoIndent: 'full',
                  formatOnPaste: true,
                  autoClosingBrackets: 'always'
                }}
              />
            </div>
          </div>

          {/* PREVIEW & TERMINAL */}
          <div className="col-span-1 xl:col-span-5 flex flex-col gap-6 h-[600px]">
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between z-10">
                <span className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Live Preview {selectedEnv === 'React' && '(React 18)'}
                </span>
                <div className="flex gap-2">
                  <button onClick={handleReload} className="p-1 text-slate-400 hover:text-slate-700"><RotateCw size={14} /></button>
                  <button onClick={openExternalPreview} className="p-1 text-slate-400 hover:text-slate-700"><ExternalLink size={14} /></button>
                </div>
              </div>
              <div className="flex-1 w-full relative bg-white">
                <iframe 
                  key={iframeKey} 
                  title="result" 
                  srcDoc={compiledCode} 
                  sandbox="allow-scripts allow-modals"
                  className="w-full h-full border-none absolute inset-0 z-10"
                />
              </div>
            </div>

            <div className="h-[200px] bg-[#1e1e2e] rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
              <div className="bg-[#181825] px-4 py-2 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider">
                  <TerminalSquare size={14} /> TERMINAL
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={clearTerminal} className="text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase">Clear</button>
                  <button onClick={handleCopyLogs} className={`transition-colors ${logsCopied ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-300'}`} title="Copy Logs">
                    {logsCopied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div ref={terminalRef} className="flex-1 p-4 font-mono text-[13px] leading-relaxed overflow-auto scroll-smooth">
                {logs.length === 0 && <div className="text-slate-600 italic">No logs yet...</div>}
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log.type === 'info' && <><span className="text-[#26a69a]">[info]</span> <span className="text-slate-300">{log.message}</span></>}
                    {log.type === 'log' && <><span className="text-[#61afef]">[log]</span> <span className="text-slate-300">{log.message}</span></>}
                    {log.type === 'error' && <><span className="text-[#e06c75]">[error]</span> <span className="text-[#e06c75]">{log.message}</span></>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Features Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-default">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-5 group-hover:bg-[#3b28cc] transition-colors duration-300">
              <BarChart2 size={20} className="text-[#3b28cc] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Performance Profiler</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Analyze frame rates, memory leaks, and execution cycles in real-time as you type.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-orange-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-default">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-5 group-hover:bg-[#ea580c] transition-colors duration-300">
              <Network size={20} className="text-[#ea580c] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Package Manager</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Import any NPM module directly via CDN with auto-completion for over 2 million libraries.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-default relative overflow-hidden">
            <div className="absolute top-4 left-4 text-4xl font-bold text-emerald-500/20 select-none pointer-events-none tracking-tighter group-hover:scale-110 group-hover:text-emerald-500/30 transition-all duration-500">
              COLAB
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 bg-transparent rounded-lg flex items-center justify-start mb-5">
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Live Pair Coding</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Generate a secure link to invite colleagues for instantaneous collaborative debugging sessions.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <Footer/>
     
    </div>
  );
}