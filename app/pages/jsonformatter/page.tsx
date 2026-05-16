"use client";

import { useState } from "react";

export default function JsonFormatterPage() {
  const [input, setInput] = useState(`{
  "id": "dev_001",
  "status": "active",
  "config": {
    "theme": "teal-glass",
    "version": 1.0,
    "features": ["json", "xml", "yaml"]
  }
}`);

  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("Valid JSON");

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setStatus("Valid JSON");
    } catch (error) {
      setOutput(
        error instanceof Error ? error.message : "Invalid JSON"
      );
      setStatus("Invalid JSON");
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setStatus("Minified JSON");
    } catch (error) {
      setOutput(
        error instanceof Error ? error.message : "Invalid JSON"
      );
      setStatus("Invalid JSON");
    }
  };

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output);
  };

  return (
    <div className="bg-[#0f1512] text-[#dee4df] min-h-screen overflow-hidden font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#1b211e]/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <h1 className="text-3xl font-bold text-[#61dbb4] tracking-tight">
              DevUtility Suite
            </h1>

            <div className="hidden md:flex items-center gap-5 text-sm">
              <button className="text-[#61dbb4] border-b-2 border-[#61dbb4] pb-1">
                Formatter
              </button>
              <button
                onClick={() => alert("Validator Tool Coming Soon")}
                className="text-gray-400 hover:text-white transition-all"
              >
                Validator
              </button>
              <button
                onClick={() => alert("Diff Viewer Tool Coming Soon")}
                className="text-gray-400 hover:text-white transition-all"
              >
                Diff Viewer
              </button>
              <button
                onClick={() => alert("JSON Generator Tool Coming Soon")}
                className="text-gray-400 hover:text-white transition-all"
              >
                Generator
              </button>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 bg-[#252b28] px-4 py-2 rounded-full w-[280px] border border-white/5">
            <input
              type="text"
              placeholder="Search tools..."
              className="bg-transparent outline-none text-sm w-full placeholder:text-gray-500"
            />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="pt-24 h-screen flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#1b211e]/50 backdrop-blur-xl border-r border-white/5 hidden lg:flex flex-col">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-gray-400">
              Recent History
            </span>
            <span>🕘</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <div className="p-3 rounded-xl bg-[#61dbb4]/10 border border-[#61dbb4]/20 cursor-pointer">
              <p className="text-sm font-semibold text-[#61dbb4]">
                auth_config.json
              </p>
              <p className="text-xs text-gray-400 mt-1">2 mins ago</p>
            </div>

            <div className="p-3 rounded-xl hover:bg-[#252b28] cursor-pointer transition-all">
              <p className="text-sm">api_response.json</p>
              <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
            </div>

            <div className="p-3 rounded-xl hover:bg-[#252b28] cursor-pointer transition-all">
              <p className="text-sm">settings_export.json</p>
              <p className="text-xs text-gray-500 mt-1">Yesterday</p>
            </div>
          </div>
        </aside>

        {/* Workspace */}
        <section className="flex-1 flex flex-col overflow-hidden px-4 pb-4">
          {/* Toolbar */}
          <div className="bg-[#1b211e]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-3 flex flex-wrap items-center justify-between mt-2 mb-3 gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={formatJson}
                className="px-5 py-3 rounded-xl bg-[#61dbb4] text-black font-semibold hover:scale-105 transition-all"
              >
                Format
              </button>

              <button
                onClick={minifyJson}
                className="px-5 py-3 rounded-xl border border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10 transition-all"
              >
                Minify
              </button>

              <button
                onClick={() => {
                  setInput("");
                  setOutput("");
                }}
                className="px-5 py-3 rounded-xl border border-red-400/20 text-red-300 hover:bg-red-400/10 transition-all"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <button
                onClick={formatJson}
                className="px-4 py-2 rounded-xl border border-[#61dbb4]/20 text-[#61dbb4] hover:bg-[#61dbb4]/10"
              >
                Validate
              </button>
            </div>
          </div>

          {/* Editors */}
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4 overflow-hidden">
            {/* Input */}
            <div className="bg-[#1b211e]/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden flex flex-col">
              <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                <span className="text-sm uppercase tracking-widest text-gray-400">
                  Input JSON
                </span>

                <span className="text-xs text-gray-500">UTF-8</span>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                spellCheck={false}
                className="flex-1 bg-[#0f1512] text-[#dee4df] font-mono text-sm p-5 outline-none resize-none"
              />
            </div>

            {/* Output */}
            <div className="bg-[#1b211e]/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden flex flex-col">
              <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                <span className="text-sm uppercase tracking-widest text-[#61dbb4]">
                  Formatted Output
                </span>

                <button
                  onClick={copyOutput}
                  className="text-sm text-gray-400 hover:text-white transition-all"
                >
                  Copy
                </button>
              </div>

              <pre className="flex-1 overflow-auto bg-[#0f1512] p-5 text-sm font-mono text-[#dee4df] whitespace-pre-wrap">
                {output || "Formatted JSON will appear here..."}
              </pre>
            </div>
          </div>

          {/* Status Bar */}
          <div className="h-12 mt-4 bg-[#1b211e]/60 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center justify-between px-5 text-sm text-gray-400">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    status === "Invalid JSON"
                      ? "bg-red-400"
                      : "bg-[#61dbb4]"
                  }`}
                />
                <span>{status}</span>
              </div>

              <span>Lines: {input.split("\n").length}</span>
              <span>Chars: {input.length}</span>
            </div>

            <span>Next.js + TypeScript</span>
          </div>
        </section>
      </main>
    </div>
  );
}



