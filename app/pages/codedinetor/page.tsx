"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Cloud, 
  ChevronDown, 
  Play, 
  Share2, 
  Settings, 
  RotateCw, 
  ExternalLink, 
  TerminalSquare, 
  BarChart2, 
  Network, 
  Users,
  Copy,
  Check,
  X
} from 'lucide-react';
import Navbar from '../../componets/Navbar';

type TabType = 'html' | 'css' | 'js';
type LogEntry = { type: 'info' | 'log' | 'error'; message: string };

export default function CodeRunnerPage() {
  // State for code editor
  const [activeTab, setActiveTab] = useState<TabType>('html');
  const [code, setCode] = useState({
    html: `<div class="container">\n  <div class="icon-box">\n    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m8 8-4 4 4 4"/><path d="m16 8 4 4-4 4"/><path d="m15 4-6 16"/></svg>\n  </div>\n  <h2>Hello, UtilityHub!</h2>\n  <p>Precision coding interface.</p>\n  <button id="action">\n    Execute Logic\n  </button>\n</div>`,
    css: `body {\n  font-family: system-ui, sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  margin: 0;\n  background-color: transparent;\n}\n\n.container {\n  text-align: center;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n}\n\n.icon-box {\n  width: 80px;\n  height: 80px;\n  background: #3b28cc;\n  border-radius: 16px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  margin-bottom: 24px;\n  color: white;\n  box-shadow: 0 10px 15px -3px rgb(99 102 241 / 0.2);\n}\n\nh2 {\n  color: #0f172a;\n  font-size: 30px;\n  margin: 0 0 12px 0;\n}\n\np {\n  color: #475569;\n  margin: 0 0 32px 0;\n}\n\nbutton {\n  background: #3b28cc;\n  color: white;\n  border: none;\n  padding: 10px 24px;\n  border-radius: 8px;\n  cursor: pointer;\n  font-weight: 500;\n  font-size: 16px;\n  transition: all 0.3s ease;\n}\n\nbutton:hover {\n  background: #2b1b99;\n  transform: translateY(-2px);\n  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);\n}`,
    js: `// Initialize application logic\nconst btn = document.querySelector('#action');\n\nbtn.addEventListener('click', () => {\n  console.log('Logic executed successfully!');\n  btn.innerText = 'Executed ✅';\n  btn.style.background = '#10b981';\n});`
  });

  const [compiledCode, setCompiledCode] = useState('');
  const [iframeKey, setIframeKey] = useState(0); 
  const [logs, setLogs] = useState<LogEntry[]>([
    { type: 'info', message: 'Server listening on port 3000...' },
    { type: 'info', message: 'Build optimized in 1.4s' }
  ]);
  
  // New States for added functionalities
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState('HTML / CSS / JS');
  const [isShared, setIsShared] = useState(false);
  const [logsCopied, setLogsCopied] = useState(false);

  const terminalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Compile Code for Iframe
  const compileCode = () => {
    const source = `
      <html>
        <head>
          <style>${code.css}</style>
        </head>
        <body>
          ${code.html}
          <script>
            // Capture console messages to send to parent window
            const originalLog = console.log;
            const originalInfo = console.info;
            const originalError = console.error;
            
            console.log = function(...args) {
              window.parent.postMessage({ type: 'log', message: args.join(' ') }, '*');
              originalLog.apply(console, args);
            };
            console.info = function(...args) {
              window.parent.postMessage({ type: 'info', message: args.join(' ') }, '*');
              originalInfo.apply(console, args);
            };
            console.error = function(...args) {
              window.parent.postMessage({ type: 'error', message: args.join(' ') }, '*');
              originalError.apply(console, args);
            };
            
            window.onerror = function(message) {
              console.error(message);
            };

            try {
              ${code.js}
            } catch (err) {
              console.error(err.message);
            }
          </script>
        </body>
      </html>
    `;
    setCompiledCode(source);
  };

  // Hard reload functionality
  const handleReload = () => {
    setLogs([{ type: 'info', message: 'Reloading frame...' }]);
    setIframeKey(prev => prev + 1); 
    compileCode();
  };

  // Open preview in new external tab
  const openExternalPreview = () => {
    const blob = new Blob([compiledCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Modern Share/Copy Logic
  const handleShareCode = async () => {
    const fullCode = `\n${code.html}\n\n/* CSS */\n${code.css}\n\n// JS\n${code.js}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'UtilityHub Code Snippet',
          text: fullCode,
        });
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

  // Copy terminal logs
  const handleCopyLogs = () => {
    const logText = logs.map(l => `[${l.type}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(logText);
    setLogsCopied(true);
    setTimeout(() => setLogsCopied(false), 2000);
  };

  // Support Tab Key in Textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      
      const newCode = code[activeTab].substring(0, start) + "  " + code[activeTab].substring(end);
      setCode({ ...code, [activeTab]: newCode });
      
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      });
    }
  };

  // Auto-sync functionality (Respects Settings)
  useEffect(() => {
    if (autoSync) {
      const timer = setTimeout(() => {
        compileCode();
      }, 1000); 
      return () => clearTimeout(timer);
    }
  }, [code, autoSync]);

  // Initial compilation on mount
  useEffect(() => {
    compileCode();
  }, []);

  // Listen to iframe console messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && ['log', 'info', 'error'].includes(event.data.type)) {
        setLogs(prev => [...prev, { type: event.data.type, message: event.data.message }]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const clearTerminal = () => setLogs([]);

  const lineCount = code[activeTab].split('\n').length;
  const lines = Array.from({ length: Math.max(15, lineCount) }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 pb-12 relative">
      
      {/* --- Settings Modal --- */}
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
              {/* Auto Sync Toggle */}
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

              {/* Font Size Slider */}
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
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                  <span>Small (12px)</span>
                  <span>Large (24px)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ---------------------- */}

           <Navbar />
     

      <main className="container mx-auto px-6 pt-12 max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-[#3b28cc] text-xs font-bold tracking-wide shadow-sm cursor-default hover:bg-indigo-200 transition-colors">
                LIVE EDITOR
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Cloud size={14} className={autoSync ? "text-emerald-500" : "text-slate-400"} />
                {autoSync ? "Auto-sync enabled" : "Auto-sync disabled"}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900">
              Code Runner
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
              Professional multi-language execution environment with low-latency live preview and performance profiling.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm relative">
            
            {/* Custom Dropdown */}
            {isDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>}
            <div className="relative z-50">
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-800 text-sm font-medium px-4 py-2.5 rounded-lg flex items-center gap-4 transition-colors border border-slate-100 cursor-pointer select-none"
              >
                {selectedEnv}
                <ChevronDown size={16} className={`text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {/* Dropdown Options */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden py-1">
                  <div 
                    onClick={() => { setSelectedEnv('HTML / CSS / JS'); setIsDropdownOpen(false); }}
                    className="px-4 py-2 text-sm text-slate-800 hover:bg-indigo-50 hover:text-[#3b28cc] cursor-pointer font-medium transition-colors flex items-center justify-between"
                  >
                    HTML / CSS / JS
                    {selectedEnv === 'HTML / CSS / JS' && <Check size={14} />}
                  </div>
                  <div className="px-4 py-2 text-sm text-slate-400 cursor-not-allowed flex items-center justify-between">
                    React Environment
                    <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-bold">SOON</span>
                  </div>
                  <div className="px-4 py-2 text-sm text-slate-400 cursor-not-allowed flex items-center justify-between">
                    Vue Environment
                    <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-bold">SOON</span>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => { compileCode(); setLogs([{ type: 'info', message: 'Manual run triggered...' }]); }}
              className="bg-[#3b28cc] hover:bg-indigo-800 text-white text-sm font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <Play size={16} className="fill-white group-hover:scale-110 transition-transform" />
              Run Code
            </button>

            <div className="h-8 w-px bg-slate-200 mx-1"></div>

            <button 
              onClick={handleShareCode} 
              className={`p-2 rounded-lg transition-colors ${isShared ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`} 
              title="Share / Copy All Code"
            >
              {isShared ? <Check size={18} /> : <Share2 size={18} />}
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)} 
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors" 
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start mb-10">
          
          {/* Left Column: Code Editor (Spans 7 cols) */}
          <div className="col-span-1 xl:col-span-7 bg-[#1e1e2e] rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-800 h-[600px] group hover:shadow-indigo-500/10 transition-all duration-500">
            
            {/* Editor Tabs */}
            <div className="bg-[#181825] flex items-center justify-between px-4 pt-3 border-b border-white/5">
              <div className="flex gap-2">
                <div 
                  onClick={() => setActiveTab('html')}
                  className={`text-sm font-medium px-4 py-2 rounded-t-lg flex items-center gap-2 border-t-2 cursor-pointer transition-colors ${activeTab === 'html' ? 'bg-[#1e1e2e] text-slate-200 border-[#e34c26]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border-transparent'}`}
                >
                  <span className="text-[#e34c26] text-xs font-bold">H</span> index.html
                </div>
                <div 
                  onClick={() => setActiveTab('css')}
                  className={`text-sm font-medium px-4 py-2 rounded-t-lg flex items-center gap-2 border-t-2 cursor-pointer transition-colors ${activeTab === 'css' ? 'bg-[#1e1e2e] text-slate-200 border-[#264de4]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border-transparent'}`}
                >
                  <span className="text-[#264de4] text-xs font-bold">C</span> styles.css
                </div>
                <div 
                  onClick={() => setActiveTab('js')}
                  className={`text-sm font-medium px-4 py-2 rounded-t-lg flex items-center gap-2 border-t-2 cursor-pointer transition-colors ${activeTab === 'js' ? 'bg-[#1e1e2e] text-slate-200 border-[#f7df1e]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border-transparent'}`}
                >
                  <span className="text-[#f7df1e] text-xs font-bold">J</span> script.js
                </div>
              </div>
              <div className="text-[10px] text-slate-500 font-mono hidden sm:block">
                UTF-8  {autoSync ? 'Auto-Saved' : 'Manual Run'}
              </div>
            </div>

            {/* Code Area */}
            <div className="flex-1 overflow-hidden flex py-4 font-mono leading-relaxed relative" style={{ fontSize: `${fontSize}px` }}>
              {/* Line Numbers */}
              <div className="w-12 flex-shrink-0 text-slate-600 text-right pr-4 select-none flex flex-col gap-[2px] pt-[2px]">
                {lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
              
              {/* Editable Textarea with Tab Support */}
              <textarea 
                ref={textareaRef}
                value={code[activeTab]}
                onChange={(e) => setCode({ ...code, [activeTab]: e.target.value })}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                className="flex-1 w-full h-full bg-transparent text-slate-300 outline-none resize-none leading-relaxed whitespace-pre pr-4"
                style={{ lineHeight: '1.6' }}
              />
            </div>

            {/* Status Bar */}
            <div className="bg-[#181825] px-4 py-2 flex justify-between items-center text-[10px] font-bold text-slate-500 tracking-wider border-t border-white/5">
              <div className="flex gap-4">
                <span className="text-emerald-500">PRETTIER: ENABLED</span>
                <span>ESLINT: PASSING</span>
              </div>
              <div className="flex gap-4">
                <span>MEM: 142MB</span>
                <span>CPU: 0.4%</span>
              </div>
            </div>
          </div>

          {/* Right Column: Preview & Terminal (Spans 5 cols) */}
          <div className="col-span-1 xl:col-span-5 flex flex-col gap-6 h-[600px]">
            
            {/* Live Preview Panel */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:shadow-md transition-shadow duration-300 relative">
              {/* Preview Header */}
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
                  <span className="ml-3 text-[11px] font-medium text-slate-500">Live Preview</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleReload} className="p-1 text-slate-400 hover:text-slate-700 transition-colors" title="Reload Frame">
                    <RotateCw size={14} />
                  </button>
                  <button onClick={openExternalPreview} className="p-1 text-slate-400 hover:text-slate-700 transition-colors" title="Open in New Tab">
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
              
              {/* Iframe Real Preview */}
              <div className="flex-1 w-full bg-white relative">
                {/* Decorative background glow for empty states */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                
                <iframe 
                  key={iframeKey} 
                  title="result" 
                  srcDoc={compiledCode} 
                  sandbox="allow-scripts allow-modals"
                  className="w-full h-full border-none absolute inset-0 z-10 bg-transparent"
                />
              </div>
            </div>

            {/* Terminal Panel */}
            <div className="h-[200px] bg-[#1e1e2e] rounded-2xl shadow-md border border-slate-800 flex flex-col overflow-hidden group">
              <div className="bg-[#181825] px-4 py-2 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider">
                  <TerminalSquare size={14} />
                  TERMINAL / LOGS
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={clearTerminal} className="text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors">Clear</button>
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
                <div className="flex items-center text-slate-500 mt-2">
                  &gt; <span className="ml-2 w-2 h-4 bg-slate-400 animate-pulse"></span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Features Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-default">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-5 group-hover:bg-[#3b28cc] transition-colors duration-300">
              <BarChart2 size={20} className="text-[#3b28cc] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Performance Profiler</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Analyze frame rates, memory leaks, and execution cycles in real-time as you type.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-orange-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-default">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-5 group-hover:bg-[#ea580c] transition-colors duration-300">
              <Network size={20} className="text-[#ea580c] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Package Manager</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Import any NPM module directly via CDN with auto-completion for over 2 million libraries.
            </p>
          </div>

          {/* Card 3 with COLAB subtle watermark */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-default relative overflow-hidden">
            {/* Quirky Colab watermark matching design */}
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
      <footer className="mt-16 border-t border-slate-200 pt-8 pb-4">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="text-[11px] font-semibold text-slate-400 tracking-wide mb-4 md:mb-0 uppercase">
            © 2024 UtilityHub Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-[11px] font-bold text-slate-400 tracking-widest">
            <a href="#" className="hover:text-[#3b28cc] transition-colors duration-200">PRIVACY</a>
            <a href="#" className="hover:text-[#3b28cc] transition-colors duration-200">TERMS</a>
            <a href="#" className="hover:text-[#3b28cc] transition-colors duration-200">STATUS</a>
            <a href="#" className="hover:text-[#3b28cc] transition-colors duration-200">CONTACT</a>
          </div>
        </div>
      </footer>
    </div>
  );
}