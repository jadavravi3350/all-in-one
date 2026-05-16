"use client";

import React, { useState } from 'react';
import { 
  Search, 
  Zap, 
  Lock, 
  CheckCircle, 
  ExternalLink, 
  Play,
  Shield,
  CloudLightning,
  Blocks
} from 'lucide-react';
import Link from 'next/link';
import { signIn } from "next-auth/react";
import Navbar from './componets/Navbar';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  // List of all tools for instant client-side search filtering
  const allTools = [
    { id: 1, title: 'Image Optimizer', description: 'Lossless compression for PNG, JPG, and WebP.', link: '/pages/images', category: 'Graphics' },
    { id: 2, title: 'Code Runner', description: 'Supports JS, Python, Rust and Go.', link: '/pages/codedinetor', category: 'Development' },
    { id: 3, title: 'Video Shrink', description: 'Compress MP4/MOV without quality loss.', link: '/pages/videos', category: 'Media' },
    { id: 4, title: 'Universal Translator', description: 'Real-time local processing for 50+ languages.', link: '/pages/traslate', category: 'AI Tools' }
  ];

  // Filter tools based on search input
  const filteredTools = allTools.filter(tool =>
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fcfcff] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Alag kiya hua Navbar component yahan lagaya hai */}
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-16 text-center max-w-4xl">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
          All Your Essential Web Tools.{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 transition-all duration-500 cursor-default">
            One Single Platform.
          </span>
        </h1>
        <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto">
          Compress images, run code, shrink videos, and translate languages— instantly, right in your browser. No sign-up required.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-12 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-16 py-4 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg transition-all duration-300"
            placeholder="Search for tools (e.g. 'Optimize JPG')"
          />
          <div className="absolute inset-y-0 right-4 flex items-center">
            <kbd className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs font-semibold border border-slate-200 group-focus-within:border-indigo-300 group-focus-within:text-indigo-500 transition-colors duration-300">
              ⌘ K
            </kbd>
          </div>
        </div>

        {/* Features Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-600">
          <div className="flex items-center gap-2 hover:text-indigo-600 cursor-default transition-colors duration-200">
            <Zap className="h-4 w-4 text-indigo-500" />
            Lightning Fast Processing
          </div>
          <div className="flex items-center gap-2 hover:text-indigo-600 cursor-default transition-colors duration-200">
            <Lock className="h-4 w-4 text-indigo-500" />
            100% Private & Local
          </div>
          <div className="flex items-center gap-2 hover:text-indigo-600 cursor-default transition-colors duration-200">
            <CheckCircle className="h-4 w-4 text-indigo-500" />
            Free to Use
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          {filteredTools.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500 font-medium text-lg">
              No matching tools found. Try searching for &quot;Video&quot; or &quot;Optimize&quot;.
            </div>
          )}

          {/* Card 1: Image Optimizer */}
          {filteredTools.some(t => t.id === 1) && (
            <Link href="/pages/images" className="col-span-1 md:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full group-hover:bg-blue-100 transition-colors duration-300">Graphics</span>
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold mb-1 group-hover:text-indigo-600 transition-colors duration-300">Image Optimizer</h3>
              <p className="text-slate-500 text-sm mb-6">Lossless compression for PNG, JPG, and WebP.</p>
              <div className="flex-grow bg-slate-900 rounded-xl overflow-hidden relative min-h-[250px]">
                <div className="absolute inset-0 flex items-center justify-center opacity-50 group-hover:opacity-70 transition-opacity duration-500">
                   <img src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1000" alt="Camera preview" className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105" />
                </div>
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur text-white text-xs px-3 py-1.5 rounded-lg">
                  Before: 4.2 MB
                </div>
                <div className="absolute bottom-4 right-4 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg">
                  After: 852 KB
                </div>
              </div>
            </Link>
          )}

          {/* Card 2: Code Runner */}
          {filteredTools.some(t => t.id === 2) && (
            <Link href='/pages/codedinetor' className="col-span-1 bg-[#1e1e2e] text-white rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1.5 transition-all duration-300 flex flex-col relative overflow-hidden group cursor-pointer">
              <div className="flex items-center gap-2 mb-6">
                <span className="bg-white/10 text-xs font-semibold px-2 py-1 rounded group-hover:bg-white/20 transition-colors duration-300">Live Code Runner</span>
              </div>
              <h3 className="text-xl font-bold mb-6 group-hover:text-indigo-300 transition-colors duration-300">Execute Instant Snippets</h3>
              
              <div className="bg-[#181825] rounded-xl p-4 font-mono text-sm mb-6 flex-grow border border-white/10 group-hover:border-indigo-500/30 transition-colors duration-300">
                <span className="text-purple-400">async function</span> <span className="text-blue-400">fetchData</span>() {'{\n'}
                {'  '}<span className="text-purple-400">const</span> res = <span className="text-purple-400">await</span> <span className="text-blue-400">fetch</span>(<span className="text-green-400">'/api'</span>);{'\n'}
                {'  '}<span className="text-purple-400">const</span> data = <span className="text-purple-400">await</span> res.<span className="text-blue-400">json</span>();{'\n'}
                {'  '}console.<span className="text-blue-400">log</span>(data);{'\n'}
                {'}'}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-300">Supports JS, Python, Rust and Go.</span>
                <button className="bg-indigo-500 hover:bg-indigo-400 hover:scale-110 hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] text-white p-3 rounded-xl transition-all duration-300">
                  <Play className="h-4 w-4 fill-current" />
                </button>
              </div>
            </Link>
          )}

          {/* Card 3: Video Shrink */}
          {filteredTools.some(t => t.id === 3) && (
            <Link href="/pages/videos" className="col-span-1 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group cursor-pointer">
              <h3 className="text-xl font-bold mb-1 group-hover:text-indigo-600 transition-colors duration-300">Video Shrink</h3>
              <p className="text-slate-500 text-sm mb-8">Compress MP4/MOV without quality loss.</p>
              
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                  <svg className="w-full h-full transform -rotate-90 group-hover:scale-105 transition-transform duration-500" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-indigo-600 drop-shadow-md"
                      strokeWidth="3"
                      strokeDasharray="80, 100"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="block text-2xl font-bold text-indigo-600">80%</span>
                    <span className="text-[10px] font-semibold text-indigo-600 tracking-wider">REDUCED</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 w-full justify-center text-sm">
                  <div className="text-center group-hover:-translate-x-1 transition-transform duration-300">
                    <div className="text-slate-400 text-xs mb-1">Original</div>
                    <div className="font-semibold">124 MB</div>
                  </div>
                  <div className="text-slate-300 group-hover:text-indigo-400 transition-colors duration-300">→</div>
                  <div className="text-center group-hover:translate-x-1 transition-transform duration-300">
                    <div className="text-indigo-600 text-xs mb-1 font-medium">Target</div>
                    <div className="font-semibold text-indigo-600">24.8 MB</div>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Card 4: Universal Translator */}
          {filteredTools.some(t => t.id === 4) && (
            <Link href='/pages/traslate' className="col-span-1 md:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold mb-1 group-hover:text-indigo-600 transition-colors duration-300">Universal Translator</h3>
                  <p className="text-slate-500 text-sm">Real-time local processing for 50+ languages.</p>
                </div>
                <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-medium">
                  <button className="px-3 py-1.5 bg-white rounded shadow-sm text-slate-800 hover:text-indigo-600 transition-colors duration-200">Auto</button>
                  <button className="px-3 py-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded transition-all duration-200">Manual</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 group-hover:border-indigo-100 transition-colors duration-300">
                  <div className="text-indigo-600 text-sm font-semibold mb-4 flex items-center gap-1 cursor-pointer hover:text-indigo-700">
                    English <span className="text-xs">▼</span>
                  </div>
                  <p className="text-slate-700">Experience the future of browser-based utility tools with local processing.</p>
                </div>
                
                {/* Translate Icon absolute center */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-slate-100 p-2 rounded-full shadow-sm z-10 group-hover:rotate-180 group-hover:shadow-md transition-all duration-500">
                   <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors duration-300 group-hover:-rotate-180">文A</div>
                </div>

                <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-inner group-hover:bg-indigo-700 transition-colors duration-300">
                  <div className="text-white text-sm font-semibold mb-4 flex items-center gap-1 cursor-pointer hover:text-indigo-200">
                    Japanese <span className="text-xs opacity-70">▼</span>
                  </div>
                  <p className="opacity-90 leading-relaxed">ローカル処理によるブラウザベースのユーティリティツールの未来を体験してください。</p>
                </div>
              </div>
            </Link>
          )}

        </div>
      </section>

      {/* Features Text Section */}
      <section className="container mx-auto px-6 py-24 max-w-5xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Why developers choose UtilityHub</h2>
        <p className="text-slate-500 mb-16 max-w-2xl mx-auto">
          Modern engineering principles applied to the tools you use every single day.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center group cursor-default">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-300">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-3 group-hover:text-indigo-600 transition-colors duration-300">Privacy First</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              All processing happens on your device. Your data never touches our servers.
            </p>
          </div>
          <div className="flex flex-col items-center group cursor-default">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-300">
              <CloudLightning className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-3 group-hover:text-indigo-600 transition-colors duration-300">Native Performance</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Leveraging WebAssembly to provide near-native speed directly in Chrome, Firefox, or Safari.
            </p>
          </div>
          <div className="flex flex-col items-center group cursor-default">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-300">
              <Blocks className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-3 group-hover:text-indigo-600 transition-colors duration-300">Modular API</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Integrate our core tools into your own workflows with our open-source JavaScript SDK.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-12">
        <div className="bg-indigo-700 rounded-[2.5rem] p-12 md:p-20 text-center text-white max-w-6xl mx-auto shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to speed up your workflow?</h2>
            <p className="text-indigo-200 mb-10 max-w-2xl mx-auto text-lg">
              Join 50,000+ developers using UtilityHub to handle their daily micro-tasks without leaving the browser.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => signIn("google")}
                className="bg-white text-indigo-700 font-semibold px-8 py-4 rounded-xl hover:bg-slate-50 hover:scale-105 hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              >
                Start Using For Free
              </button>
              <button className="border border-indigo-400 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-600 hover:border-indigo-300 hover:scale-105 hover:shadow-lg transition-all duration-300 w-full sm:w-auto">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between border-t border-slate-100 mt-12">
        <div className="mb-4 md:mb-0">
          <div className="text-xl font-bold mb-2 cursor-pointer hover:text-indigo-600 transition-colors duration-300">UtilityHub</div>
          <div className="text-xs font-medium text-slate-400">© 2024 UTILITYHUB INC. ALL RIGHTS RESERVED.</div>
        </div>
        <div className="flex items-center gap-6 text-xs font-semibold text-slate-400 tracking-wider">
          <a href="#" className="hover:text-indigo-600 transition-colors duration-200">PRIVACY</a>
          <a href="#" className="hover:text-indigo-600 transition-colors duration-200">TERMS</a>
          <a href="#" className="hover:text-indigo-600 transition-colors duration-200">STATUS</a>
          <a href="#" className="hover:text-indigo-600 transition-colors duration-200">CONTACT</a>
        </div>
      </footer>
    </div>
  );
}