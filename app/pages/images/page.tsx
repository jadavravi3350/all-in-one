"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  UploadCloud, 
  CheckSquare, 
  Square, 
  ChevronDown, 
  Download, 
  Gauge, 
  ShieldCheck, 
  Blocks,
  MoveHorizontal
} from 'lucide-react';
import Navbar from '@/app/componets/Navbar';

type ModeType = 'Lossless' | 'Balanced' | 'Maximum';

export default function ImageOptimizerPage() {
  // State Management
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [mode, setMode] = useState<ModeType>('Balanced');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  
  // Settings State (Mock for UI)
  const [stripMeta, setStripMeta] = useState<boolean>(true);
  const [autoResize, setAutoResize] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-compress when mode changes
  useEffect(() => {
    if (file) {
      processImage(file, mode);
    }
  }, [mode]);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      processImage(droppedFile, mode);
    }
  };

  // Handle Input Select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processImage(selectedFile, mode);
    }
  };

  // Real Image Compression using HTML5 Canvas
  const processImage = async (selectedFile: File, selectedMode: ModeType) => {
    setIsProcessing(true);
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    
    // Clear old URLs to avoid memory leaks
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);

    const objUrl = URL.createObjectURL(selectedFile);
    setOriginalUrl(objUrl);

    const img = new window.Image();
    img.src = objUrl;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Compression logic based on selected mode
      let quality = 0.75;
      if (selectedMode === 'Lossless') quality = 1.0;
      if (selectedMode === 'Balanced') quality = 0.6;
      if (selectedMode === 'Maximum') quality = 0.2;

      // Force WebP or JPEG for compression
      const mimeType = (selectedFile.type === 'image/png' && selectedMode === 'Lossless') 
        ? 'image/png' 
        : 'image/jpeg';

      canvas.toBlob((blob) => {
        if (blob) {
          setCompressedSize(blob.size);
          setCompressedUrl(URL.createObjectURL(blob));
        }
        setIsProcessing(false);
      }, mimeType, quality);
    };
  };

  // Handle Download
  const handleDownload = () => {
    if (!compressedUrl || !file) return;

    const a = document.createElement('a');
    a.href = compressedUrl;
    const originalName = file.name.replace(/\.[^/.]+$/, "");
    a.download = `${originalName}_optimized.jpg`; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Utility to format sizes (Bytes to MB/KB)
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0.00 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 0.1) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(2)} MB`;
  };

  const getSavingsPercent = () => {
    if (!originalSize || !compressedSize) return 0;
    return Math.round(((originalSize - compressedSize) / originalSize) * 100);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
          
      
      <main className="container mx-auto px-6 py-12 max-w-7xl">
          <Navbar />
        {/* Header Section */}
        <div className="mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#5b45f4] text-white text-xs font-semibold tracking-wide mb-4 shadow-sm cursor-default hover:bg-[#4731d1] transition-colors">
            <Sparkles size={14} className="fill-white/20" />
            AI-POWERED OPTIMIZATION
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900">
            Image Optimizer
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Compress and optimize your images for the web without sacrificing visual quality. Professional-grade algorithms for faster load times.
          </p>
        </div>

        {/* Main Grid Tool Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Controls (Spans 7 cols) */}
          <div className="col-span-1 lg:col-span-7 space-y-6">
            
            {/* Dropzone Container */}
            <div 
              className="border-2 border-dashed border-slate-300 rounded-2xl bg-white p-12 flex flex-col items-center justify-center text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-300 cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/webp, image/avif"
                onChange={handleFileChange}
              />
              <div className="w-16 h-16 bg-indigo-100 text-[#5b45f4] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#5b45f4] group-hover:text-white transition-all duration-300 shadow-sm">
                <UploadCloud size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-indigo-700 transition-colors">
                {isProcessing ? 'Optimizing...' : file ? 'Upload Another Image' : 'Drop image here'}
              </h3>
              <p className="text-slate-500 text-sm mb-8 max-w-xs">
                {file ? file.name : <>Support for PNG, JPG, WebP and AVIF. <br />Max file size 25MB.</>}
              </p>
              <button className="bg-[#3b28cc] text-white font-medium px-8 py-3 rounded-xl hover:bg-indigo-800 hover:shadow-md transition-all duration-200">
                Browse Files
              </button>
            </div>

            {/* Optimization Settings Panel */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
              <h4 className="text-xs font-bold text-slate-500 tracking-wider mb-6">OPTIMIZATION SETTINGS</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {/* Setting Card: Lossless */}
                <div 
                  onClick={() => setMode('Lossless')}
                  className={`border rounded-xl p-5 cursor-pointer transition-all duration-200 ${mode === 'Lossless' ? 'border-2 border-[#5b45f4] bg-[#f8f7ff] shadow-[0_0_15px_rgba(91,69,244,0.1)] transform scale-[1.02]' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
                >
                  <div className={`text-[10px] font-bold tracking-widest mb-1 ${mode === 'Lossless' ? 'text-[#5b45f4]' : 'text-slate-500'}`}>MODE</div>
                  <div className="text-lg font-bold mb-2">Lossless</div>
                  <div className={`text-xs leading-relaxed ${mode === 'Lossless' ? 'text-slate-600' : 'text-slate-500'}`}>Zero quality loss, minimal size reduction.</div>
                </div>

                {/* Setting Card: Balanced */}
                <div 
                  onClick={() => setMode('Balanced')}
                  className={`border rounded-xl p-5 cursor-pointer transition-all duration-200 ${mode === 'Balanced' ? 'border-2 border-[#5b45f4] bg-[#f8f7ff] shadow-[0_0_15px_rgba(91,69,244,0.1)] transform scale-[1.02]' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
                >
                  <div className={`text-[10px] font-bold tracking-widest mb-1 ${mode === 'Balanced' ? 'text-[#5b45f4]' : 'text-slate-500'}`}>MODE</div>
                  <div className="text-lg font-bold mb-2">Balanced</div>
                  <div className={`text-xs leading-relaxed ${mode === 'Balanced' ? 'text-slate-600' : 'text-slate-500'}`}>Optimal balance between size and quality.</div>
                </div>

                {/* Setting Card: Maximum */}
                <div 
                  onClick={() => setMode('Maximum')}
                  className={`border rounded-xl p-5 cursor-pointer transition-all duration-200 ${mode === 'Maximum' ? 'border-2 border-[#5b45f4] bg-[#f8f7ff] shadow-[0_0_15px_rgba(91,69,244,0.1)] transform scale-[1.02]' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
                >
                  <div className={`text-[10px] font-bold tracking-widest mb-1 ${mode === 'Maximum' ? 'text-[#5b45f4]' : 'text-slate-500'}`}>MODE</div>
                  <div className="text-lg font-bold mb-2">Maximum</div>
                  <div className={`text-xs leading-relaxed ${mode === 'Maximum' ? 'text-slate-600' : 'text-slate-500'}`}>Smallest possible size with visible changes.</div>
                </div>
              </div>

              {/* Bottom Row Settings */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-6 w-full sm:w-auto">
                  <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setStripMeta(!stripMeta)}>
                    {stripMeta ? <CheckSquare size={20} className="text-[#3b28cc]" /> : <Square size={20} className="text-slate-300 group-hover:text-slate-400 transition-colors" />}
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Strip Metadata</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setAutoResize(!autoResize)}>
                    {autoResize ? <CheckSquare size={20} className="text-[#3b28cc]" /> : <Square size={20} className="text-slate-300 group-hover:text-slate-400 transition-colors" />}
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Auto-Resize (2x)</span>
                  </label>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-xs font-bold text-slate-500 tracking-wider">FORMAT</span>
                  <div className="relative group cursor-pointer">
                    <div className="bg-[#f1eff5] hover:bg-[#e7e4f0] text-slate-800 text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-6 transition-colors">
                      Keep Original
                      <ChevronDown size={16} className="text-slate-500 group-hover:text-slate-700" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Preview (Spans 5 cols) */}
          <div className="col-span-1 lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xs font-bold text-slate-500 tracking-wider">RESULT PREVIEW</h4>
              {isProcessing ? (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded tracking-widest animate-pulse">PROCESSING</span>
              ) : file ? (
                <span className="bg-[#10b981] text-white text-[10px] font-bold px-2 py-1 rounded tracking-widest">READY</span>
              ) : (
                <span className="bg-slate-300 text-white text-[10px] font-bold px-2 py-1 rounded tracking-widest">WAITING</span>
              )}
            </div>

            {/* Interactive Image Comparison Component using clip-path */}
            <div className="relative w-full h-[380px] rounded-xl overflow-hidden mb-6 bg-slate-900 shadow-inner group">
              {originalUrl && compressedUrl ? (
                <>
                  {/* Before Image (Background) */}
                  <div 
                    className="absolute inset-0 bg-contain bg-center bg-no-repeat" 
                    style={{ backgroundImage: `url(${originalUrl})` }}
                  />
                  {/* After Image (Clipped overlay) */}
                  <div 
                    className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                    style={{ 
                      backgroundImage: `url(${compressedUrl})`, 
                      clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
                    }}
                  />
                  
                  {/* Vertical Divider Line */}
                  <div 
                    className="absolute top-0 bottom-0 w-[2px] bg-white pointer-events-none z-10"
                    style={{ left: `${sliderPosition}%` }}
                  />

                  {/* Invisible Range Input for sliding */}
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={sliderPosition} 
                    onChange={(e) => setSliderPosition(Number(e.target.value))} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                  />

                  {/* Drag Handle UI */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg pointer-events-none transition-transform duration-200 z-30"
                    style={{ left: `calc(${sliderPosition}% - 16px)` }}
                  >
                    <MoveHorizontal size={16} className="text-slate-600" />
                  </div>
                </>
              ) : (
                // Placeholder if no image is uploaded
                <>
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1000")' }}
                  />
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ 
                      backgroundImage: 'url("https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=100&w=1000")', 
                      filter: 'contrast(1.1) brightness(1.05)',
                      clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
                    }}
                  />

                  <div 
                    className="absolute top-0 bottom-0 w-[2px] bg-white pointer-events-none z-10"
                    style={{ left: `${sliderPosition}%` }}
                  />

                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={sliderPosition} 
                    onChange={(e) => setSliderPosition(Number(e.target.value))} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                  />

                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg pointer-events-none z-30"
                    style={{ left: `calc(${sliderPosition}% - 16px)` }}
                  >
                    <MoveHorizontal size={16} className="text-slate-600" />
                  </div>
                </>
              )}

              {/* Labels */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-3 py-1.5 rounded-md shadow-sm pointer-events-none z-30">
                BEFORE
              </div>
              <div className="absolute bottom-4 right-4 bg-[#3b28cc] text-white text-[10px] font-bold px-3 py-1.5 rounded-md shadow-sm pointer-events-none z-30">
                AFTER
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#f8f7ff] rounded-xl p-4">
                <div className="text-[10px] font-bold text-slate-500 tracking-widest mb-1">ORIGINAL SIZE</div>
                <div className="text-2xl font-bold text-slate-900">
                  {file ? formatSize(originalSize) : '4.82 MB'}
                </div>
              </div>
              <div className="bg-[#eeebfd] rounded-xl p-4">
                <div className="text-[10px] font-bold text-[#5b45f4] tracking-widest mb-1">NEW SIZE</div>
                <div className="flex items-end gap-2">
                  <div className="text-2xl font-bold text-[#3b28cc]">
                    {file ? formatSize(compressedSize) : '1.14 MB'}
                  </div>
                  {file && (
                    <div className="text-sm font-bold text-[#5b45f4] mb-1">
                      -{getSavingsPercent()}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button 
              onClick={handleDownload}
              disabled={!file || isProcessing}
              className={`w-full font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group ${
                file && !isProcessing 
                  ? 'bg-[#3b28cc] hover:bg-indigo-800 text-white hover:shadow-lg hover:-translate-y-0.5' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Download size={20} className={file && !isProcessing ? "group-hover:animate-bounce" : ""} />
              {isProcessing ? 'Optimizing...' : 'Download Optimized Image'}
            </button>
          </div>
        </div>

        {/* Bottom Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-20 pt-12 border-t border-slate-200">
          <div className="flex gap-4 group cursor-default">
            <div className="w-12 h-12 rounded-xl bg-[#eeebfd] text-[#5b45f4] flex-shrink-0 flex items-center justify-center group-hover:bg-[#5b45f4] group-hover:text-white transition-all duration-300">
              <Gauge size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold mb-1 group-hover:text-[#5b45f4] transition-colors">Fast Processing</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Edge computing nodes ensure lightning fast compression speeds worldwide.</p>
            </div>
          </div>

          <div className="flex gap-4 group cursor-default">
            <div className="w-12 h-12 rounded-xl bg-[#eeebfd] text-[#5b45f4] flex-shrink-0 flex items-center justify-center group-hover:bg-[#5b45f4] group-hover:text-white transition-all duration-300">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold mb-1 group-hover:text-[#5b45f4] transition-colors">Secure by Design</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Images are processed in memory and never stored on our persistent servers.</p>
            </div>
          </div>

          <div className="flex gap-4 group cursor-default">
            <div className="w-12 h-12 rounded-xl bg-[#eeebfd] text-[#5b45f4] flex-shrink-0 flex items-center justify-center group-hover:bg-[#5b45f4] group-hover:text-white transition-all duration-300">
              <Blocks size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold mb-1 group-hover:text-[#5b45f4] transition-colors">Developer API</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Automate your workflows using our robust REST API and client libraries.</p>
            </div>
          </div>
        </div>

      </main>

    </div>
  );
}