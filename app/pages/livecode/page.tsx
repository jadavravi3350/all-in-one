"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Editor from '@monaco-editor/react'; // 🔥 असली VS Code इंजन
import mqtt from 'mqtt';
import {
  Code2, Users, History, Settings, Bug, Plus, HelpCircle, LogOut,
  Copy, ChevronDown, Zap, Terminal as TerminalIcon, Check, X, Save, RotateCcw, Play,
  LayoutTemplate
} from 'lucide-react';

// Web Development Templates
const initialFiles: Record<string, string> = {
  'index.html': `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <h1>Hello CodeFlow 🚀</h1>\n  <p>Real-time collaborative web editor.</p>\n  <div id="box">Click Run to see magic!</div>\n  \n  <script src="script.js"></script>\n</body>\n</html>`,
  'styles.css': `body {\n  background-color: #051424;\n  color: white;\n  font-family: sans-serif;\n  text-align: center;\n  padding-top: 50px;\n}\n\nh1 {\n  color: #89ceff;\n}\n\n#box {\n  margin: 20px auto;\n  padding: 20px;\n  border: 2px dashed #0ea5e9;\n  width: fit-content;\n}`,
  'script.js': `// You can write JS here\nconsole.log("App Started!");\n\ndocument.getElementById('box').addEventListener('click', () => {\n  alert('Button Clicked!');\n});`
};

export default function CodeEditorPage() {
  const { data: session, status } = useSession();

  // --- APP STATE ---
  const [activeView, setActiveView] = useState<'editor' | 'collaborators' | 'history' | 'settings' | 'preview'>('editor');
  
  // --- REAL-TIME & ROOM STATE ---
  const myUserId = useRef(Math.random().toString(36).substring(2, 10)); 
  const [roomId, setRoomId] = useState<string>('');
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, { id: string, name: string, image: string }>>({});
  
  // --- EDITOR STATE ---
  const [codeFiles, setCodeFiles] = useState<Record<string, string>>(initialFiles);
  const [activeTab, setActiveTab] = useState('index.html');
  const [previewSrc, setPreviewSrc] = useState('');
  
  // --- UI STATE ---
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [savedVersions, setSavedVersions] = useState<Array<{ id: number, time: string, file: string, content: string }>>([]);
  const [terminalLogs, setTerminalLogs] = useState([{ type: 'info', text: '[CodeFlow] Connected to Public Real-Time Network.' }]);
  const [terminalInput, setTerminalInput] = useState('');
  const endOfTerminalRef = useRef<HTMLDivElement>(null);

  // 1️⃣ --- ROOM GENERATION & URL SHARING ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      let room = urlParams.get('room');
      if (!room) {
        room = Math.random().toString(36).substring(2, 12);
        window.history.replaceState(null, '', `?room=${room}`);
      }
      setRoomId(room);
    }
  }, []);

  // 2️⃣ --- REAL-TIME CONNECTION (MQTT) ---
  useEffect(() => {
    if (status !== "authenticated" || !roomId) return;

    const mqttClient = mqtt.connect('wss://test.mosquitto.org:8081/mqtt');

    mqttClient.on('connect', () => {
      mqttClient.subscribe(roomId);
      setClient(mqttClient);
      setTerminalLogs(prev => [...prev, { type: 'info', text: `[Network] Joined Room: ${roomId}` }]);
      
      // Tell everyone you joined
      mqttClient.publish(roomId, JSON.stringify({
        type: 'USER_JOINED',
        user: { id: myUserId.current, name: session?.user?.name || "Anonymous", image: session?.user?.image || "" }
      }));
    });

    mqttClient.on('message', (topic, message) => {
      if (topic === roomId) {
        const data = JSON.parse(message.toString());
        
        if (data.senderId !== myUserId.current && data.type === 'CODE_UPDATE') {
          setCodeFiles(data.files);
        }
        
        if (data.type === 'USER_JOINED' && data.user.id !== myUserId.current) {
          setOnlineUsers(prev => ({ ...prev, [data.user.id]: data.user }));
          setTerminalLogs(prev => [...prev, { type: 'info', text: `➔ ${data.user.name} joined the room.` }]);
          // Send current code to the new user
          mqttClient.publish(roomId, JSON.stringify({ type: 'CODE_UPDATE', senderId: myUserId.current, files: codeFiles }));
        }
      }
    });

    return () => mqttClient.end();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, roomId]);

  // Auto-scroll Terminal
  useEffect(() => {
    endOfTerminalRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  // 3️⃣ --- ACTIONS & COMPILING ---

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || "";
    setCodeFiles(prev => {
      const updatedFiles = { ...prev, [activeTab]: newCode };
      if (client) {
        client.publish(roomId, JSON.stringify({ type: 'CODE_UPDATE', senderId: myUserId.current, files: updatedFiles }));
      }
      return updatedFiles;
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 🔥 RUN HTML/CSS/JS CODE IN IFRAME
  const runCode = () => {
    const html = codeFiles['index.html'] || '';
    const css = codeFiles['styles.css'] || '';
    const js = codeFiles['script.js'] || '';

    const sourceDoc = `
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
      </html>
    `;
    setPreviewSrc(sourceDoc);
    setActiveView('preview');
    setTerminalLogs(prev => [...prev, { type: 'info', text: '✓ Code compiled and running in Preview.' }]);
  };

  const createNewSnippet = () => {
    const newFileName = `page-${Date.now().toString().slice(-4)}.html`;
    setCodeFiles(prev => ({ ...prev, [newFileName]: '<!-- Type your HTML here -->' }));
    setActiveTab(newFileName);
    setActiveView('editor');
  };

  const saveCurrentFile = () => {
    if (!activeTab) return;
    const newSave = { id: Date.now(), time: new Date().toLocaleTimeString(), file: activeTab, content: codeFiles[activeTab] };
    setSavedVersions(prev => [newSave, ...prev]);
    setTerminalLogs(prev => [...prev, { type: 'info', text: `Saved version of ${activeTab} to History.` }]);
  };

  // ------------------------------------------------------------
  // UI RENDERING
  // ------------------------------------------------------------
  if (status === "loading") {
    return <div className="h-screen w-full bg-[#051424] flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#89ceff] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="h-screen w-full bg-[#010f1f] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#0ea5e9]/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#89ceff]/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="bg-[#051424] border border-[#3e4850]/40 p-10 rounded-[2rem] shadow-2xl flex flex-col items-center max-w-md w-full mx-4 z-10">
          <div className="w-16 h-16 bg-[#0ea5e9]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#89ceff]/30 shadow-[0_0_15px_rgba(137,206,255,0.2)]">
            <Code2 size={32} className="text-[#89ceff]" />
          </div>
          <h1 className="text-3xl font-black text-[#89ceff] tracking-tighter mb-2">CodeFlow</h1>
          <p className="text-[#bec8d2]/80 text-center text-sm mb-8">Sign in to access your real-time collaborative workspace.</p>

          <button onClick={() => signIn('google')} className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-bold py-3 px-4 rounded-xl hover:bg-slate-100 transition-colors active:scale-95">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  // Gets the correct language for Monaco Editor syntax highlighting
  const getLanguage = (fileName: string) => {
    if (fileName.endsWith('.js')) return 'javascript';
    if (fileName.endsWith('.css')) return 'css';
    if (fileName.endsWith('.html')) return 'html';
    return 'plaintext';
  };

  return (
    <div className="bg-[#051424] text-[#d4e4fa] font-sans overflow-hidden flex h-screen">
      
      {/* --- SIDEBAR --- */}
      <aside className="hidden md:flex flex-col h-full w-[260px] bg-[#010f1f] border-r border-[#3e4850]/40 py-4 z-30 shrink-0">
        <div className="px-6 mb-8 mt-2">
          <h2 className="text-2xl font-bold text-[#89ceff]">Project Alpha</h2>
          <p className="text-xs font-semibold text-[#bec8d2]/60 uppercase tracking-widest mt-1">Room: {roomId}</p>
        </div>
        
        <nav className="flex-1 px-3 space-y-1">
          <button onClick={() => setActiveView('editor')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-all group ${activeView === 'editor' ? 'text-[#89ceff] bg-[#0ea5e9]/10 border-r-2 border-[#89ceff]' : 'text-[#bec8d2] hover:bg-[#1c2b3c]/50'}`}>
            <Code2 size={20} className="mr-3" /> <span className="text-xs font-semibold tracking-wider">Code Editor</span>
          </button>
          <button onClick={() => setActiveView('preview')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-all group ${activeView === 'preview' ? 'text-[#89ceff] bg-[#0ea5e9]/10 border-r-2 border-[#89ceff]' : 'text-[#bec8d2] hover:bg-[#1c2b3c]/50'}`}>
            <LayoutTemplate size={20} className="mr-3" /> <span className="text-xs font-semibold tracking-wider">Live Preview</span>
          </button>
          <button onClick={() => setActiveView('collaborators')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-all group ${activeView === 'collaborators' ? 'text-[#89ceff] bg-[#0ea5e9]/10 border-r-2 border-[#89ceff]' : 'text-[#bec8d2] hover:bg-[#1c2b3c]/50'}`}>
            <Users size={20} className="mr-3" /> <span className="text-xs font-semibold tracking-wider">Collaborators ({Object.keys(onlineUsers).length + 1})</span>
          </button>
          <button onClick={() => setActiveView('history')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-all group ${activeView === 'history' ? 'text-[#89ceff] bg-[#0ea5e9]/10 border-r-2 border-[#89ceff]' : 'text-[#bec8d2] hover:bg-[#1c2b3c]/50'}`}>
            <History size={20} className="mr-3" /> <span className="text-xs font-semibold tracking-wider">History</span>
          </button>
          <button onClick={() => setActiveView('settings')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-all group ${activeView === 'settings' ? 'text-[#89ceff] bg-[#0ea5e9]/10 border-r-2 border-[#89ceff]' : 'text-[#bec8d2] hover:bg-[#1c2b3c]/50'}`}>
            <Settings size={20} className="mr-3" /> <span className="text-xs font-semibold tracking-wider">Settings</span>
          </button>
        </nav>

        <div className="mt-auto px-3 space-y-4">
          <button onClick={createNewSnippet} className="w-full py-3 px-4 bg-[#89ceff] text-[#003751] font-bold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all">
            <Plus size={18} /> <span className="text-xs font-bold uppercase tracking-wider">New File</span>
          </button>
          <div className="h-px bg-[#3e4850]/20 mx-4"></div>
          <button onClick={() => signOut()} className="w-full flex items-center px-4 py-3 rounded-lg text-[#ffb4ab] hover:bg-[#690005]/20 transition-all">
            <LogOut size={20} className="mr-3" /> <span className="text-xs font-semibold tracking-wider">Sign Out</span>
          </button>
          
          <div className="flex items-center gap-3 px-4 pt-4 border-t border-[#3e4850]/20">
            <img alt="Profile" className="w-8 h-8 rounded-full object-cover border border-[#89ceff]/40" src={session?.user?.image || "https://ui-avatars.com/api/?name=User"} />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold leading-none truncate">{session?.user?.name}</p>
              <p className="text-[10px] text-[#bec8d2]/60 mt-1 truncate">{session?.user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN AREA --- */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* HEADER */}
        <header className="flex justify-between items-center w-full px-6 h-16 bg-[#051424]/80 backdrop-blur-xl border-b border-[#3e4850]/40 sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black text-[#89ceff] tracking-tighter">CodeFlow</h1>
            <div className="h-6 w-px bg-[#3e4850]/40 mx-2"></div>
            <div className="flex items-center bg-[#1c2b3c]/50 rounded-full px-3 py-1.5 border border-[#3e4850]/20 gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)] animate-pulse"></span>
              <span className="text-xs font-semibold text-[#bec8d2]">Connected Live</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeView === 'editor' && activeTab && (
               <button onClick={saveCurrentFile} className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg border border-[#3e4850] text-[#bec8d2] hover:bg-[#1c2b3c] transition-colors">
                 <Save size={16} /> <span className="text-xs font-bold">Save</span>
               </button>
            )}
            <button onClick={handleCopyLink} className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors active:scale-95 duration-100 ${copied ? 'border-green-400 text-green-400 bg-green-400/10' : 'border-[#89ceff] text-[#89ceff] hover:bg-[#89ceff]/10'}`}>
              {copied ? <Check size={18} /> : <Copy size={18} />} <span className="text-xs font-bold">{copied ? 'Copied URL!' : 'Invite / Copy Link'}</span>
            </button>
            <button onClick={runCode} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#89ceff] text-[#003751] font-bold hover:opacity-90 transition-colors active:scale-95 duration-100 shadow-lg shadow-[#89ceff]/10 ml-2">
              <Play size={16} fill="currentColor"/> <span className="text-xs uppercase tracking-wider">Run Code</span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* EDITOR VIEW (WITH MONACO EDITOR) */}
          {activeView === 'editor' && (
            <>
              {/* TABS */}
              <div className="flex items-center justify-between px-6 h-10 bg-[#122131] border-b border-[#3e4850]/20 overflow-x-auto shrink-0">
                <div className="flex items-center gap-2 h-full pt-2">
                  {Object.keys(codeFiles).map((file) => (
                    <div key={file} onClick={() => setActiveTab(file)} className={`flex items-center gap-2 h-full px-4 rounded-t-lg cursor-pointer transition-all ${activeTab === file ? 'bg-[#010f1f] text-[#89ceff] border-t-2 border-[#89ceff]' : 'bg-transparent text-[#bec8d2]/70 hover:text-[#bec8d2] hover:bg-[#1c2b3c]/50'}`}>
                      <span className="text-xs font-semibold tracking-wider pb-1">{file}</span>
                      <X size={14} className="mb-1 opacity-50 hover:opacity-100 hover:text-red-400" onClick={(e) => { e.stopPropagation(); const nf = {...codeFiles}; delete nf[file]; setCodeFiles(nf); if(activeTab===file) setActiveTab(Object.keys(nf)[0] || ''); }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* MONACO EDITOR AREA */}
              {activeTab && codeFiles[activeTab] !== undefined ? (
                <div className="flex-1 relative overflow-hidden bg-[#010f1f] pt-2">
                  <Editor
                    height="100%"
                    theme="vs-dark"
                    language={getLanguage(activeTab)}
                    value={codeFiles[activeTab]}
                    onChange={handleCodeChange}
                    options={{
                      fontSize: fontSize,
                      minimap: { enabled: false },
                      wordWrap: "on",
                      autoClosingTags: true,
                      formatOnPaste: true,
                      suggestOnTriggerCharacters: true
                    }}
                  />
                </div>
              ) : (
                 <div className="flex-1 bg-[#010f1f] flex items-center justify-center text-[#3e4850]">
                   <p>No file open. Click 'New File'.</p>
                 </div>
              )}
            </>
          )}

          {/* LIVE PREVIEW VIEW */}
          {activeView === 'preview' && (
             <div className="flex-1 bg-white relative">
               <div className="absolute top-0 w-full bg-[#122131] h-8 flex items-center px-4 text-xs font-bold text-[#89ceff] border-b border-[#3e4850]/30 z-10">
                 Output / Result
               </div>
               <iframe 
                 srcDoc={previewSrc}
                 title="Live Preview"
                 sandbox="allow-scripts allow-same-origin"
                 className="w-full h-full pt-8 border-none"
               />
             </div>
          )}

          {/* COLLABORATORS VIEW */}
          {activeView === 'collaborators' && (
            <div className="flex-1 bg-[#010f1f] p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-6 border-b border-[#3e4850]/30 pb-4">
                <h2 className="text-2xl font-bold text-[#89ceff]">Online Users</h2>
                <button onClick={handleCopyLink} className="flex items-center gap-2 text-sm bg-[#89ceff]/10 px-4 py-2 rounded-lg text-[#89ceff] hover:bg-[#89ceff]/20">
                  <Plus size={16}/> Invite Link
                </button>
              </div>
              <div className="space-y-4">
                {/* You */}
                <div className="bg-[#051424] border border-[#89ceff]/30 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={session?.user?.image || "https://ui-avatars.com/api/?name=User"} alt="You" className="w-10 h-10 rounded-full border-2 border-[#89ceff]" />
                    <div>
                      <p className="text-sm font-bold text-[#d4e4fa]">{session?.user?.name || "You"} <span className="text-xs bg-[#89ceff]/20 text-[#89ceff] px-2 py-0.5 rounded-full ml-2">You</span></p>
                      <p className="text-xs text-green-400 mt-1 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span> Online</p>
                    </div>
                  </div>
                </div>
                {/* Other Real Users */}
                {Object.values(onlineUsers).map((user) => (
                  <div key={user.id} className="bg-[#051424] border border-[#3e4850]/40 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={user.image || `https://ui-avatars.com/api/?name=${user.name}`} alt={user.name} className="w-10 h-10 rounded-full border border-slate-600" />
                      <div>
                        <p className="text-sm font-bold text-[#d4e4fa]">{user.name}</p>
                        <p className="text-xs text-green-400 mt-1 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span> Online (Real-Time Active)</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HISTORY VIEW */}
          {activeView === 'history' && (
            <div className="flex-1 bg-[#010f1f] p-8 overflow-y-auto">
              <h2 className="text-2xl font-bold text-[#89ceff] mb-6 border-b border-[#3e4850]/30 pb-4">Saved Versions</h2>
              {savedVersions.map((save) => (
                 <div key={save.id} className="bg-[#051424] border border-[#3e4850]/40 rounded-xl p-4 flex items-center justify-between mb-4">
                   <div>
                     <p className="text-sm font-bold text-[#d4e4fa]">{save.file}</p>
                     <p className="text-xs text-[#bec8d2]/60 mt-1">Saved at {save.time}</p>
                   </div>
                   <button onClick={() => { setCodeFiles(p => ({...p, [save.file]: save.content})); setActiveTab(save.file); setActiveView('editor'); }} className="flex items-center gap-2 px-4 py-2 bg-[#1c2b3c] text-[#89ceff] text-xs font-bold rounded-lg hover:bg-[#89ceff]/10 transition-colors">
                     <RotateCcw size={16} /> Restore
                   </button>
                 </div>
              ))}
            </div>
          )}

          {/* SETTINGS VIEW */}
          {activeView === 'settings' && (
            <div className="flex-1 bg-[#010f1f] p-8 overflow-y-auto">
              <h2 className="text-2xl font-bold text-[#89ceff] mb-6 border-b border-[#3e4850]/30 pb-4">Editor Settings</h2>
              <div className="max-w-xl space-y-8">
                <div>
                  <label className="block text-sm font-bold text-[#d4e4fa] mb-2">Font Size ({fontSize}px)</label>
                  <input type="range" min="10" max="28" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full accent-[#89ceff]"/>
                </div>
              </div>
            </div>
          )}

          {/* --- TERMINAL AREA --- */}
          <div className="h-48 bg-[#051424] border-t border-[#3e4850]/40 flex flex-col shrink-0">
            <div className="flex items-center px-6 h-9 bg-[#1c2b3c] border-b border-[#3e4850]/20 shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#bec8d2]">Console</span>
            </div>
            
            <div className="flex-1 p-4 font-mono text-[13px] text-[#bec8d2]/80 overflow-y-auto">
              {terminalLogs.map((log, index) => (
                <div key={index} className="mt-1">
                  {log.type === 'cmd' && <span className="text-[#89ceff] mr-2">$ {log.text}</span>}
                  {log.type === 'info' && <span className="text-green-400 mr-2">➔ <span className="text-[#d4e4fa]">{log.text}</span></span>}
                  {log.type === 'error' && <span className="text-[#ffb4ab] mr-2">✖ {log.text}</span>}
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}