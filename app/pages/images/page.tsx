"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, UploadCloud, CheckSquare, Square, ChevronDown, 
  Download, Gauge, ShieldCheck, Blocks, Trash2, FileImage, 
  RefreshCw, DownloadCloud, Share2
} from 'lucide-react';
import Navbar from '../../componets/Navbar';
import Footer from '@/app/componets/Footer';

type ModeType = 'Lossless' | 'Balanced' | 'Maximum';
type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp';

interface ImageItem {
  id: string;
  file: File;
  originalUrl: string;
  originalSize: number;
  compressedUrl: string | null;
  compressedSize: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  newName: string;
  targetFormat: ImageFormat;
}

export default function ImageOptimizerPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [mode, setMode] = useState<ModeType>('Balanced');
  const [stripMeta, setStripMeta] = useState<boolean>(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    images.forEach(img => {
      if (img.status === 'done' || img.status === 'error') {
        processImage(img.id, mode, img.targetFormat);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleFiles = (files: FileList | File[]) => {
    const newImages: ImageItem[] = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .map(f => {
        const id = Math.random().toString(36).substring(7) + Date.now();
        const defaultFormat = 'image/jpeg'; 
        const nameWithoutExt = f.name.replace(/\.[^/.]+$/, "");

        return {
          id,
          file: f,
          originalUrl: URL.createObjectURL(f),
          originalSize: f.size,
          compressedUrl: null,
          compressedSize: 0,
          status: 'pending',
          newName: nameWithoutExt,
          targetFormat: defaultFormat,
        };
      });

    setImages(prev => [...newImages, ...prev]);
    newImages.forEach(img => processImage(img.id, mode, img.targetFormat));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const processImage = async (id: string, selectedMode: ModeType, format: ImageFormat) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, status: 'processing' } : img));
    
    setImages(prev => {
      const targetImg = prev.find(i => i.id === id);
      if (!targetImg) return prev;

      const img = new window.Image();
      img.src = targetImg.originalUrl;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;

        if (format === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        let quality = 0.75;
        if (selectedMode === 'Lossless') quality = 1.0;
        if (selectedMode === 'Balanced') quality = 0.7; 
        if (selectedMode === 'Maximum') quality = 0.3;

        canvas.toBlob((blob) => {
          if (blob) {
            const newCompUrl = URL.createObjectURL(blob);
            setImages(currentImages => currentImages.map(curr => {
              if (curr.id === id) {
                if (curr.compressedUrl) URL.revokeObjectURL(curr.compressedUrl);
                return { ...curr, compressedUrl: newCompUrl, compressedSize: blob.size, status: 'done' };
              }
              return curr;
            }));
          } else {
            setImages(currentImages => currentImages.map(curr => curr.id === id ? { ...curr, status: 'error' } : curr));
          }
        }, format, quality);
      };

      return prev;
    });
  };

  const handleNameChange = (id: string, newName: string) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, newName } : img));
  };

  const handleFormatChange = (id: string, newFormat: ImageFormat) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, targetFormat: newFormat } : img));
    processImage(id, mode, newFormat);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) {
        URL.revokeObjectURL(img.originalUrl);
        if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const downloadImage = (img: ImageItem) => {
    if (!img.compressedUrl || img.status !== 'done') return;
    let ext = 'jpg';
    if (img.targetFormat === 'image/png') ext = 'png';
    if (img.targetFormat === 'image/webp') ext = 'webp';
    const cleanName = img.newName ? img.newName.trim() : 'optimized_image';
    const finalName = `${cleanName}.${ext}`;
    const a = document.createElement('a');
    a.href = img.compressedUrl;
    a.download = finalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 🔥 NAYA SHARE FEATURE FOR IMAGE 🔥
  const shareImage = async (img: ImageItem) => {
    if (!img.compressedUrl || img.status !== 'done') return;
    try {
      const response = await fetch(img.compressedUrl);
      const blob = await response.blob();
      let ext = 'jpg';
      if (img.targetFormat === 'image/png') ext = 'png';
      if (img.targetFormat === 'image/webp') ext = 'webp';
      const cleanName = img.newName ? img.newName.trim() : 'optimized_image';
      const file = new File([blob], `${cleanName}.${ext}`, { type: img.targetFormat });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Optimized Image',
          text: 'Here is the optimized image.'
        });
      } else {
        alert("Native sharing is not supported on this browser. Please download the file instead.");
      }
    } catch (error) {
      console.error("Error sharing image:", error);
    }
  };

  const handleDownloadAll = async () => {
    const completedImages = images.filter(img => img.status === 'done');
    if (completedImages.length === 0) return;
    for (let i = 0; i < completedImages.length; i++) {
      downloadImage(completedImages[i]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  const getExtLabel = (format: ImageFormat) => {
    if (format === 'image/jpeg') return 'JPG';
    if (format === 'image/png') return 'PNG';
    return 'WEBP';
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 pb-12">
      <Navbar />
      <main className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#5b45f4] text-white text-xs font-semibold tracking-wide mb-4 shadow-sm cursor-default">
            <Sparkles size={14} className="fill-white/20" />
            AI BATCH OPTIMIZATION
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900">
            Image Optimizer Pro
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Compress, rename, convert and share multiple images at once securely in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="col-span-1 lg:col-span-4 space-y-6">
            <div 
              className="border-2 border-dashed border-slate-300 rounded-2xl bg-white p-8 flex flex-col items-center justify-center text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-300 cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
              <div className="w-14 h-14 bg-indigo-100 text-[#5b45f4] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#5b45f4] group-hover:text-white transition-all duration-300 shadow-sm">
                <UploadCloud size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-700 transition-colors">Select Multiple Images</h3>
              <p className="text-slate-500 text-xs">Drag & Drop files here <br/> (PNG, JPG, WebP)</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h4 className="text-xs font-bold text-slate-500 tracking-wider mb-4">GLOBAL COMPRESSION</h4>
              <div className="space-y-3 mb-6">
                <div onClick={() => setMode('Lossless')} className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${mode === 'Lossless' ? 'border-[#5b45f4] bg-[#f8f7ff]' : 'border-slate-200 hover:border-indigo-300'}`}>
                  <div className="text-sm font-bold mb-1">Lossless</div>
                  <div className="text-[11px] text-slate-500">High quality, large file size.</div>
                </div>
                <div onClick={() => setMode('Balanced')} className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${mode === 'Balanced' ? 'border-[#5b45f4] bg-[#f8f7ff]' : 'border-slate-200 hover:border-indigo-300'}`}>
                  <div className="text-sm font-bold mb-1">Balanced (Recommended)</div>
                  <div className="text-[11px] text-slate-500">Optimal balance between size and quality.</div>
                </div>
                <div onClick={() => setMode('Maximum')} className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${mode === 'Maximum' ? 'border-[#5b45f4] bg-[#f8f7ff]' : 'border-slate-200 hover:border-indigo-300'}`}>
                  <div className="text-sm font-bold mb-1">Maximum</div>
                  <div className="text-[11px] text-slate-500">Smallest size, visible quality loss.</div>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setStripMeta(!stripMeta)}>
                {stripMeta ? <CheckSquare size={18} className="text-[#3b28cc]" /> : <Square size={18} className="text-slate-300 group-hover:text-slate-400" />}
                <span className="text-sm font-medium text-slate-700">Strip Image Metadata</span>
              </label>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[500px]">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-500 tracking-wider">BATCH QUEUE ({images.length})</h4>
                <div className="flex items-center gap-4">
                  {images.some(img => img.status === 'done') && (
                    <button onClick={handleDownloadAll} className="text-xs bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-sm">
                      <DownloadCloud size={16} /> Download All
                    </button>
                  )}
                  {images.length > 0 && (
                    <button onClick={() => setImages([])} className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors">Clear All</button>
                  )}
                </div>
              </div>

              <div className="p-2 flex-1 overflow-y-auto bg-slate-50/50">
                {images.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 pb-10 mt-20">
                    <FileImage size={48} className="mb-4 opacity-20" />
                    <p>No images uploaded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {images.map((img) => {
                      const savings = img.compressedSize ? Math.round(((img.originalSize - img.compressedSize) / img.originalSize) * 100) : 0;
                      return (
                        <div key={img.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 hover:shadow-md transition-shadow group">
                          <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 relative border border-slate-200">
                            <img src={img.originalUrl} alt="preview" className="w-full h-full object-cover" />
                            {img.status === 'processing' && (
                              <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-sm">
                                <RefreshCw size={16} className="text-[#5b45f4] animate-spin" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 tracking-wider mb-1 block">FILE NAME</label>
                              <div className="flex items-center relative">
                                <input type="text" value={img.newName} onChange={(e) => handleNameChange(img.id, e.target.value)} className="w-full text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"/>
                                <span className="absolute right-3 text-xs text-slate-400 font-bold pointer-events-none">.{getExtLabel(img.targetFormat).toLowerCase()}</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 tracking-wider mb-1 block">CONVERT TO</label>
                              <div className="relative">
                                <select value={img.targetFormat} onChange={(e) => handleFormatChange(img.id, e.target.value as ImageFormat)} className="w-full text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-md pl-3 pr-8 py-1.5 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer">
                                  <option value="image/jpeg">JPEG (Normal)</option>
                                  <option value="image/png">PNG</option>
                                  <option value="image/webp">WebP (Best)</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto mt-2 sm:mt-0">
                            <div className="text-right flex flex-col items-end min-w-[80px]">
                              {img.status === 'done' ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400 line-through">{formatSize(img.originalSize)}</span>
                                    <span className="text-sm font-bold text-emerald-600">{formatSize(img.compressedSize)}</span>
                                  </div>
                                  <div className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 rounded">-{savings > 0 ? savings : 0}%</div>
                                </>
                              ) : (
                                <span className="text-xs font-semibold text-amber-500 animate-pulse">Processing...</span>
                              )}
                            </div>

                            {/* Action Buttons incl. Share */}
                            <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
                              <button onClick={() => shareImage(img)} disabled={img.status !== 'done'} title="Share Image" className={`p-2 rounded-lg transition-all ${img.status === 'done' ? 'text-slate-500 bg-slate-100 hover:bg-indigo-50 hover:text-[#3b28cc]' : 'text-slate-300 bg-slate-100 cursor-not-allowed'}`}>
                                <Share2 size={16} />
                              </button>
                              <button onClick={() => downloadImage(img)} disabled={img.status !== 'done'} title="Download Image" className={`p-2 rounded-lg transition-all ${img.status === 'done' ? 'text-white bg-[#3b28cc] hover:bg-indigo-800 shadow-sm hover:-translate-y-0.5' : 'text-slate-300 bg-slate-100 cursor-not-allowed'}`}>
                                <Download size={16} />
                              </button>
                              <button onClick={() => removeImage(img.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer/>
    </div>
  );
}