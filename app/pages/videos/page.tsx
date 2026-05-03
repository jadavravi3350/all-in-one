"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileUp, 
  Plus, 
  Monitor, 
  CheckCircle2, 
  Circle, 
  Clapperboard, 
  Zap, 
  ShieldCheck, 
  MonitorPlay,
  Check,
  Download,
  Share2,
  Loader2
} from 'lucide-react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import Navbar from '../../componets/Navbar';

type StatusType = 'idle' | 'loading_engine' | 'processing' | 'success' | 'error';
type FormatType = 'MP4' | 'WebM';

export default function VideoCompressorPage() {
  // State Management
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<StatusType>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [format, setFormat] = useState<FormatType>('MP4');
  const [resolution, setResolution] = useState<string>('720p HD');
  
  // File details
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [compressedUrl, setCompressedUrl] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // FIX 1: Initialize with null to prevent Node.js SSR error on Vercel
  const ffmpegRef = useRef<any>(null);

  // Load FFmpeg Engine
  const loadFFmpeg = async () => {
    // FIX 1 (cont): Create the FFmpeg instance only when running in the browser
    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpeg();
    }
    
    const ffmpeg = ffmpegRef.current;
    if (ffmpeg.loaded) return true;
    
    try {
      setStatus('loading_engine');
      await ffmpeg.load();
      return true;
    } catch (error) {
      console.error("FFmpeg load error:", error);
      setStatus('error');
      setErrorMessage("System failed to load compression engine. Check console.");
      return false;
    }
  };

  // Real Compression Function
  const startProcessing = async (selectedFile: File) => {
    setFile(selectedFile);
    const sizeInMB = selectedFile.size / (1024 * 1024);
    setOriginalSize(sizeInMB);
    setProgress(0);

    const isLoaded = await loadFFmpeg();
    if (!isLoaded) return;

    setStatus('processing');
    const ffmpeg = ffmpegRef.current;

    // Track real progress
    ffmpeg.on('progress', ({ progress }: any) => {
      setProgress(Math.round(progress * 100));
    });

    try {
      const inputName = 'input_video';
      const outputName = format === 'MP4' ? 'output.mp4' : 'output.webm';

      // Write file to FFmpeg's virtual file system
      await ffmpeg.writeFile(inputName, await fetchFile(selectedFile));

      // Build FFmpeg command based on settings
      // -preset ultrafast is used so it doesn't hang the browser forever
      // -crf 28 is the quality/compression ratio (higher number = smaller file, lower quality)
      const scale = resolution === '720p HD' ? 'scale=-2:720' : 
                    resolution === '4K Ultra HD' ? 'scale=-2:2160' : 'scale=-2:1080';

      const command = format === 'MP4' 
        ? ['-i', inputName, '-vf', scale, '-vcodec', 'libx264', '-crf', '28', '-preset', 'ultrafast', outputName]
        : ['-i', inputName, '-vf', scale, '-vcodec', 'libvpx-vp9', '-crf', '30', '-b:v', '0', outputName];

      await ffmpeg.exec(command);

      // Read the compressed file
      const data = await ffmpeg.readFile(outputName);
      
      // FIX 2: Cast data to 'any' to bypass TypeScript SharedArrayBuffer strictness
      const compressedBlob = new Blob([data as any], { type: format === 'MP4' ? 'video/mp4' : 'video/webm' });
      
      const compSizeMB = compressedBlob.size / (1024 * 1024);
      setCompressedSize(compSizeMB);
      setCompressedUrl(URL.createObjectURL(compressedBlob));
      
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage("Compression failed. Try a smaller video or different format.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) startProcessing(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) startProcessing(droppedFile);
  };

  const handleCancel = () => {
    if (status === 'processing' && ffmpegRef.current) {
      ffmpegRef.current.terminate();
    }
    setStatus('idle');
    setFile(null);
    setProgress(0);
    setCompressedUrl("");
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = () => {
    if (!compressedUrl || !file) return;
    const a = document.createElement('a');
    a.href = compressedUrl;
    const originalName = file.name.replace(/\.[^/.]+$/, ""); 
    a.download = `${originalName}_compressed.${format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resolutions: string[] = ['4K Ultra HD', '1080p Full HD', '720p HD'];

  return (
    <div className="min-h-screen bg-[#fcfcff] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 pb-12">
      
       <Navbar />

      <main className="container mx-auto px-6 pt-12 max-w-[1200px] space-y-8">
        
        {/* Header Section */}
        <div className="max-w-2xl mb-2">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900">
            Video Compressor
          </h1>
          <p className="text-[17px] text-slate-600 leading-relaxed">
            High-performance video optimization. Reduce file size without compromising visual integrity using our professional-grade WebAssembly engine.
          </p>
        </div>

        {/* Main Workspace Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Dropzone */}
          <div 
            className={`lg:col-span-2 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-center p-16 transition-all duration-300 min-h-[400px] ${
              status === 'idle' || status === 'error'
                ? 'border-slate-300 bg-white hover:border-[#4f38e6] hover:bg-indigo-50/30 cursor-pointer group' 
                : 'border-slate-200 bg-slate-50/50 cursor-default opacity-60 pointer-events-none'
            }`}
            onClick={() => {
              if ((status === 'idle' || status === 'error') && fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="video/mp4,video/x-m4v,video/webm,video/quicktime" 
              className="hidden" 
            />
            
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all duration-300 shadow-sm ${
              status === 'idle' || status === 'error'
                ? 'bg-[#eeebfd] text-[#4f38e6] group-hover:scale-110 group-hover:bg-[#4f38e6] group-hover:text-white' 
                : 'bg-slate-200 text-slate-400'
            }`}>
              {status === 'loading_engine' ? <Loader2 size={28} className="animate-spin" /> : <FileUp size={28} strokeWidth={2} />}
            </div>
            
            <h3 className={`text-2xl font-bold mb-3 transition-colors ${status === 'idle' ? 'text-slate-800 group-hover:text-[#3b28cc]' : 'text-slate-500'}`}>
              {status === 'idle' ? 'Drop your video here' : 
               status === 'loading_engine' ? 'Loading Compression Engine...' : 
               status === 'error' ? 'Error Occurred' : 'Processing File...'}
            </h3>
            
            <p className={`text-[15px] mb-8 ${status === 'error' ? 'text-red-500' : 'text-slate-500'}`}>
              {status === 'idle' ? 'Support for MP4, MOV, WebM up to 2GB.' : 
               status === 'error' ? errorMessage : file?.name}
            </p>
            
            {(status === 'idle' || status === 'error') && (
              <button 
                className="bg-[#3b28cc] text-white font-medium px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-[#2b1b99] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation(); 
                  fileInputRef.current?.click();
                }}
              >
                <Plus size={18} /> Select File
              </button>
            )}
          </div>

          {/* Right Column: Settings */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className={`bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex-1 transition-opacity ${(status === 'processing' || status === 'loading_engine') ? 'opacity-50 pointer-events-none' : ''}`}>
              <h4 className="text-[11px] font-bold text-slate-500 tracking-wider mb-6 uppercase">Compression Settings</h4>
              
              {/* Output Format */}
              <div className="mb-8">
                <label className="block text-[11px] font-bold text-slate-500 tracking-wider mb-3 uppercase">Output Format</label>
                <div className="flex gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button onClick={() => setFormat('MP4')} className={`flex-1 font-semibold py-2.5 rounded-lg text-sm shadow-sm transition-all ${format === 'MP4' ? 'bg-[#eeebfd] border border-[#d2c4f9] text-[#3b28cc]' : 'bg-transparent hover:bg-white text-slate-600 hover:text-slate-900 font-medium'}`}>MP4</button>
                  <button onClick={() => setFormat('WebM')} className={`flex-1 font-semibold py-2.5 rounded-lg text-sm shadow-sm transition-all ${format === 'WebM' ? 'bg-[#eeebfd] border border-[#d2c4f9] text-[#3b28cc]' : 'bg-transparent hover:bg-white text-slate-600 hover:text-slate-900 font-medium'}`}>WebM</button>
                </div>
              </div>

              {/* Resolution Preset */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 tracking-wider mb-3 uppercase">Resolution Preset</label>
                <div className="space-y-3">
                  {resolutions.map((res) => (
                    <div 
                      key={res} onClick={() => setResolution(res)}
                      className={`rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors shadow-sm ${resolution === res ? 'border-2 border-[#a78bfa] bg-[#f5f3ff]' : 'border border-slate-200 hover:border-slate-300'}`}
                    >
                      <span className={`text-sm ${resolution === res ? 'font-bold text-[#4f38e6]' : 'font-medium text-slate-700'}`}>{res}</span>
                      {resolution === res ? <CheckCircle2 size={18} className="text-[#4f38e6]" /> : <Monitor size={16} className="text-slate-400" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* System Status Block */}
            <div className="bg-[#f5f3ff] rounded-3xl p-6 border border-[#eeeaff]">
              <h4 className="text-[11px] font-bold text-slate-500 tracking-wider mb-3 uppercase">System Status</h4>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800 tracking-wide">
                <Circle size={10} className={`fill-[#10b981] text-[#10b981] ${status === 'processing' ? 'animate-pulse' : ''}`} />
                {status === 'processing' ? 'ENGINE COMPRESSING...' : status === 'loading_engine' ? 'LOADING WASM...' : 'ENGINE READY'}
              </div>
            </div>
          </div>
        </div>

        {/* Active Processing Bar */}
        {(status === 'processing' || status === 'loading_engine') && (
          <div className="bg-[#fcfbfe] border border-[#dcd6f7] rounded-[1.5rem] p-4 flex flex-col md:flex-row items-center gap-6 shadow-sm">
            <div className="flex items-center gap-4 min-w-[240px] truncate">
              <div className="w-12 h-12 shrink-0 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-[#4f38e6]">
                <Clapperboard size={20} />
              </div>
              <div className="truncate">
                <div className="font-bold text-sm text-slate-900 mb-0.5 truncate">{file?.name}</div>
                <div className="text-xs font-mono text-slate-400 tracking-tight">
                  {status === 'loading_engine' ? 'Initializing Decoder...' : `Processing: ${progress}%`}
                </div>
              </div>
            </div>

            <div className="flex-1 w-full relative">
              <div className="h-2 w-full bg-[#e5e1f9] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#3b28cc] rounded-full relative transition-all duration-300 ease-out"
                  style={{ width: status === 'loading_engine' ? '10%' : `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={handleCancel} className="text-[#ef4444] hover:bg-red-50 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {status === 'success' && (
          <div className="bg-[#f5f3ff] border border-[#e3dbfa] rounded-[1.5rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-[#3b28cc] rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Check size={24} className="text-white" strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Compression Complete!</h3>
                <p className="text-sm text-slate-600">
                  {originalSize.toFixed(1)} MB → {compressedSize.toFixed(1)} MB 
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button onClick={handleDownload} className="flex-1 md:flex-none bg-[#3b28cc] hover:bg-[#2b1b99] text-white font-semibold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <Download size={18} /> Download Video
              </button>
              <button onClick={handleCancel} className="bg-white border border-slate-200 text-slate-600 hover:text-[#3b28cc] hover:border-[#3b28cc] p-3.5 rounded-xl transition-colors font-semibold">
                Compress Another
              </button>
            </div>
          </div>
        )}
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