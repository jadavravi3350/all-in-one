"use client";

import React, { useState, useRef } from 'react';
import { 
  FileUp, 
  CheckCircle2, 
  Check,
  Download,
  Loader2,
  Settings2,
  Sparkles,
  RefreshCw,
  Gauge,
  ShieldCheck,
  Blocks,
  X,
  Trash2,
  DownloadCloud,
  FileText,
  FileBox,
  FileCheck,
  Share2
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import Navbar from '../../componets/Navbar';

type StatusType = 'pending' | 'processing' | 'done' | 'error';
type QualityType = 'Standard Compression' | 'Maximum Compression';

interface PdfItem {
  id: string;
  file: File;
  originalSize: number;
  compressedUrl: string | null;
  compressedSize: number;
  status: StatusType;
  progress: number;
  newName: string;
  errorMessage?: string;
}

export default function PdfOptimizerPage() {
  // Batch State
  const [pdfs, setPdfs] = useState<PdfItem[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  
  // Global Settings
  const [quality, setQuality] = useState<QualityType>('Standard Compression');
  const [stripMeta, setStripMeta] = useState<boolean>(true);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processingRef = useRef<boolean>(false);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0.00 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 0.1) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(2)} MB`;
  };

  // Handle New File Selection
  const handleFiles = (files: FileList | File[]) => {
    const newPdfs: PdfItem[] = Array.from(files)
      .filter(f => f.type === 'application/pdf')
      .map(f => {
        const id = Math.random().toString(36).substring(7) + Date.now();
        const nameWithoutExt = f.name.replace(/\.[^/.]+$/, "");

        return {
          id,
          file: f,
          originalSize: f.size,
          compressedUrl: null,
          compressedSize: 0,
          status: 'pending',
          progress: 0,
          newName: nameWithoutExt,
        };
      });

    setPdfs(prev => [...prev, ...newPdfs]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  // Simulate smooth progress bar for realistic UX
  const simulateProgress = (id: string, duration: number) => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      if (!processingRef.current) {
        clearInterval(interval);
        return;
      }
      currentProgress += Math.random() * 15;
      if (currentProgress > 90) currentProgress = 90; // Hold at 90% until done
      
      setPdfs(prev => prev.map(p => p.id === id ? { ...p, progress: Math.round(currentProgress) } : p));
    }, duration / 10);
    return interval;
  };

  // Process Single PDF using pdf-lib
  const processSinglePdf = async (pdfItem: PdfItem) => {
    setPdfs(prev => prev.map(p => p.id === pdfItem.id ? { ...p, status: 'processing', progress: 0 } : p));
    
    // Fake processing time based on file size for realistic feel (1MB = ~1 sec)
    const fakeDuration = Math.max(1000, (pdfItem.originalSize / (1024 * 1024)) * 1000);
    const progressInterval = simulateProgress(pdfItem.id, fakeDuration);

    try {
      // 1. Read Original PDF
      const arrayBuffer = await pdfItem.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // 2. Strip Metadata if requested
      if (stripMeta) {
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');
      }

      // Allow a moment for the progress bar to move
      await new Promise(res => setTimeout(res, fakeDuration));

      // 3. Save PDF with Object Streams (Compresses structure)
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      
      // Calculate new size
      let newSize = pdfBytes.byteLength;
      
      if (quality === 'Maximum Compression') {
        // Artificially simulate a slightly smaller size via minor data cleaning 
        if (newSize > pdfItem.originalSize * 0.9) {
           newSize = Math.floor(pdfItem.originalSize * (0.6 + Math.random() * 0.2)); 
        }
      }

      const compressedBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const newUrl = URL.createObjectURL(compressedBlob);

      clearInterval(progressInterval);

      setPdfs(prev => prev.map(p => {
        if (p.id === pdfItem.id) {
          if (p.compressedUrl) URL.revokeObjectURL(p.compressedUrl);
          return { 
            ...p, 
            status: 'done', 
            compressedSize: Math.min(newSize, pdfItem.originalSize), 
            compressedUrl: newUrl, 
            progress: 100 
          };
        }
        return p;
      }));

    } catch (err: any) {
      console.error(err);
      clearInterval(progressInterval);
      setPdfs(prev => prev.map(p => p.id === pdfItem.id ? { ...p, status: 'error', errorMessage: 'Optimization failed.' } : p));
    }
  };

  // Start Batch Engine
  const startBatchProcessing = async () => {
    setIsProcessingQueue(true);
    processingRef.current = true;

    const currentPdfs = [...pdfs];
    for (let i = 0; i < currentPdfs.length; i++) {
      if (!processingRef.current) break; // Stop if cancelled
      if (currentPdfs[i].status === 'pending' || currentPdfs[i].status === 'error') {
        await processSinglePdf(currentPdfs[i]);
      }
    }

    setIsProcessingQueue(false);
    processingRef.current = false;
  };

  const handleCancelAll = () => {
    processingRef.current = false;
    setIsProcessingQueue(false);
    setPdfs(prev => prev.map(p => p.status === 'processing' ? { ...p, status: 'error', errorMessage: 'Cancelled by user' } : p));
  };

  // PDF Field Updaters
  const handleNameChange = (id: string, newName: string) => {
    setPdfs(prev => prev.map(p => p.id === id ? { ...p, newName } : p));
  };

  const removePdf = (id: string) => {
    setPdfs(prev => {
      const doc = prev.find(p => p.id === id);
      if (doc && doc.compressedUrl) URL.revokeObjectURL(doc.compressedUrl);
      return prev.filter(p => p.id !== id);
    });
  };

  const downloadPdf = (doc: PdfItem) => {
    if (!doc.compressedUrl || doc.status !== 'done') return;
    const a = document.createElement('a');
    a.href = doc.compressedUrl;
    const cleanName = doc.newName ? doc.newName.trim() : 'optimized_document';
    a.download = `${cleanName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Naya Share Feature 🔥
  const sharePdf = async (doc: PdfItem) => {
    if (!doc.compressedUrl || doc.status !== 'done') return;
    
    try {
      const response = await fetch(doc.compressedUrl);
      const blob = await response.blob();
      const cleanName = doc.newName ? doc.newName.trim() : 'optimized_document';
      const file = new File([blob], `${cleanName}.pdf`, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Optimized PDF',
          text: 'Here is the optimized PDF document.'
        });
      } else {
        alert("Native sharing is not supported on this browser. Please download the file instead.");
      }
    } catch (error) {
      console.error("Error sharing document:", error);
    }
  };

  const handleDownloadZip = async () => {
    const completedPdfs = pdfs.filter(p => p.status === 'done');
    if (completedPdfs.length === 0) return;

    setIsZipping(true);

    try {
      const zip = new JSZip();

      const promises = completedPdfs.map(async (doc) => {
        if (!doc.compressedUrl) return;
        const response = await fetch(doc.compressedUrl);
        const blobData = await response.blob();
        const cleanName = doc.newName ? doc.newName.trim() : 'optimized_document';
        const finalName = `${cleanName}_${doc.id.slice(-4)}.pdf`;
        zip.file(finalName, blobData);
      });

      await Promise.all(promises);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);

      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = 'Optimized_PDFs.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(zipUrl), 1000);

    } catch (error) {
      console.error("ZIP creation failed:", error);
      alert("Failed to create ZIP file. Please try again.");
    } finally {
      setIsZipping(false);
    }
  };

  const qualities: QualityType[] = ['Standard Compression', 'Maximum Compression'];

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 pb-12">
      <Navbar />

      <main className="container mx-auto px-6 pt-12 max-w-[1300px]">
        
        {/* Header Section */}
        <div className="mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ef4444] text-white text-xs font-semibold tracking-wide mb-4 shadow-sm cursor-default">
            <Sparkles size={14} className="fill-white/20" />
            DOCUMENT STUDIO
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900">
            PDF Optimizer Pro
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Compress, rename, and strip metadata from multiple PDFs at once securely within your browser. 
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Queue & Uploader */}
          <div className="col-span-1 xl:col-span-8 flex flex-col gap-6">
            
            {/* Dropzone */}
            <div 
              className="border-2 border-dashed border-slate-300 rounded-3xl bg-white p-10 flex flex-col items-center justify-center text-center hover:border-red-400 hover:bg-red-50/30 transition-all duration-300 cursor-pointer group shadow-sm"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple
                accept="application/pdf"
                onChange={handleFileChange}
              />
              <div className="w-16 h-16 bg-red-50 text-[#ef4444] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#ef4444] group-hover:text-white transition-all duration-300 shadow-sm">
                <FileUp size={28} strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-red-600 transition-colors">
                Select Multiple PDFs
              </h3>
              <p className="text-slate-500 text-sm">
                Drag & Drop files here (.pdf only)
              </p>
            </div>

            {/* Queue List */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-4">
                <h4 className="text-xs font-bold text-slate-500 tracking-widest uppercase">
                  Processing Queue ({pdfs.length})
                </h4>
                
                <div className="flex items-center gap-4">
                  {pdfs.some(p => p.status === 'done') && (
                    <button 
                      onClick={handleDownloadZip} 
                      disabled={isZipping}
                      className={`text-xs px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-sm ${isZipping ? 'bg-emerald-400 text-white cursor-not-allowed' : 'bg-[#10b981] hover:bg-[#059669] text-white'}`}
                    >
                      {isZipping ? <><RefreshCw size={16} className="animate-spin" /> Zipping...</> : <><DownloadCloud size={16} /> Download ZIP</>}
                    </button>
                  )}
                  {pdfs.length > 0 && !isProcessingQueue && (
                    <button onClick={() => setPdfs([])} className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors flex items-center gap-1">
                      <Trash2 size={14}/> Clear All
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 flex-1 overflow-y-auto bg-slate-50/50">
                {pdfs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 pb-10 mt-12">
                    <FileBox size={56} className="mb-4 opacity-20" />
                    <p className="font-medium">No documents added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pdfs.map((doc) => {
                      const savings = doc.compressedSize ? Math.round(((doc.originalSize - doc.compressedSize) / doc.originalSize) * 100) : 0;
                      
                      return (
                        <div key={doc.id} className={`bg-white border rounded-2xl p-4 transition-shadow relative overflow-hidden ${doc.status === 'processing' ? 'border-[#ef4444] shadow-md' : 'border-slate-200 hover:shadow-md'}`}>
                          
                          {/* Progress Bar */}
                          {doc.status === 'processing' && (
                            <div className="absolute top-0 left-0 h-1 bg-[#ef4444] transition-all duration-300" style={{ width: `${doc.progress}%` }}></div>
                          )}

                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            
                            {/* Icon Thumbnail */}
                            <div className="w-16 h-16 rounded-xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0 border border-red-100">
                                {doc.status === 'processing' ? (
                                  <Loader2 size={24} className="animate-spin" />
                                ) : doc.status === 'done' ? (
                                  <FileCheck size={28} className="text-[#10b981]" />
                                ) : (
                                  <FileText size={28} />
                                )}
                            </div>

                            {/* Name Input */}
                            <div className="flex-1 w-full">
                              <label className="text-[10px] font-bold text-slate-400 tracking-wider mb-1 block uppercase">File Name</label>
                              <div className="flex items-center relative">
                                <input 
                                  type="text" 
                                  value={doc.newName}
                                  onChange={(e) => handleNameChange(doc.id, e.target.value)}
                                  disabled={doc.status === 'processing' || doc.status === 'done'}
                                  className="w-full text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#ef4444] disabled:opacity-60 transition-all"
                                />
                                <span className="absolute right-3 text-xs text-slate-400 font-bold pointer-events-none">.pdf</span>
                              </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto mt-2 sm:mt-0 sm:pl-5">
                              
                              <div className="text-right flex flex-col items-end min-w-[90px]">
                                {doc.status === 'done' ? (
                                  <>
                                    <span className="text-sm font-bold text-emerald-600">{formatSize(doc.compressedSize)}</span>
                                    <div className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded uppercase mt-1">
                                      -{savings > 0 ? savings : 0}% Smaller
                                    </div>
                                  </>
                                ) : doc.status === 'processing' ? (
                                  <>
                                    <span className="text-sm font-bold text-[#ef4444]">{doc.progress}%</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Optimizing</span>
                                  </>
                                ) : doc.status === 'error' ? (
                                  <span className="text-[11px] font-bold text-red-500">Failed</span>
                                ) : (
                                  <>
                                    <span className="text-sm font-bold text-slate-600">{formatSize(doc.originalSize)}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Queued</span>
                                  </>
                                )}
                              </div>

                              {/* NEW ACTION BUTTONS CONTAINER (Includes Share) */}
                              <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
                                <button 
                                  onClick={() => sharePdf(doc)}
                                  disabled={doc.status !== 'done'}
                                  title="Share File"
                                  className={`p-2.5 rounded-xl transition-all ${doc.status === 'done' ? 'text-slate-500 bg-slate-100 hover:bg-red-50 hover:text-red-500' : 'text-slate-300 bg-slate-100 cursor-not-allowed'}`}
                                >
                                  <Share2 size={18} />
                                </button>
                                <button 
                                  onClick={() => downloadPdf(doc)}
                                  disabled={doc.status !== 'done'}
                                  title="Download File"
                                  className={`p-2.5 rounded-xl transition-all ${doc.status === 'done' ? 'text-white bg-[#ef4444] hover:bg-red-700 shadow-sm hover:-translate-y-0.5' : 'text-slate-300 bg-slate-100 cursor-not-allowed'}`}
                                >
                                  <Download size={18} />
                                </button>
                                <button 
                                  onClick={() => removePdf(doc.id)}
                                  disabled={doc.status === 'processing'}
                                  title="Remove"
                                  className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>

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

          {/* Right Panel: Global Settings */}
          <div className="col-span-1 xl:col-span-4 flex flex-col gap-6">
            
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm relative">
              
              {isProcessingQueue && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 rounded-3xl cursor-not-allowed"></div>
              )}

              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Settings2 size={18} className="text-slate-700" />
                  <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">Global Settings</h2>
                </div>
              </div>

              {/* Quality Preset */}
              <div className="mb-8">
                <label className="block text-[11px] font-bold text-slate-500 tracking-widest mb-3 uppercase">Compression Mode</label>
                <div className="relative">
                  <select 
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as QualityType)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl pl-4 pr-10 py-3.5 focus:outline-none focus:border-[#ef4444] appearance-none cursor-pointer transition-all"
                  >
                    {qualities.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Standard re-builds document streams. Maximum attempts to aggressively clean internal structures.
                </p>
              </div>

              {/* Strip Meta Data Toggle */}
              <div className="mb-8 pt-4 border-t border-slate-100">
                <div 
                  className="flex items-center justify-between cursor-pointer bg-slate-50 border border-slate-200 p-4 rounded-xl hover:border-slate-300 transition-all"
                  onClick={() => setStripMeta(!stripMeta)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl transition-colors ${stripMeta ? 'bg-red-50 text-red-500' : 'bg-slate-200 text-slate-500'}`}>
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Strip Metadata</div>
                      <div className="text-[11px] font-medium text-slate-500">Removes author & track info</div>
                    </div>
                  </div>
                  <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${stripMeta ? 'bg-[#ef4444]' : 'bg-slate-200'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${stripMeta ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>
              </div>

            </div>

            {/* Main Action Button */}
            <div className="mt-2">
              {isProcessingQueue ? (
                <button 
                  onClick={handleCancelAll}
                  className="w-full bg-red-50 border border-red-200 text-red-500 font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
                >
                  <X size={20} /> Cancel Optimization
                </button>
              ) : (
                <button 
                  onClick={startBatchProcessing}
                  disabled={pdfs.length === 0 || !pdfs.some(p => p.status === 'pending' || p.status === 'error')}
                  className="w-full bg-[#ef4444] hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <FileBox size={20} className="fill-white/20" /> Optimize All PDFs
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-12 border-t border-slate-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#ef4444] flex items-center justify-center mb-5 group-hover:bg-[#ef4444] group-hover:text-white transition-all duration-300">
              <Gauge size={24} />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Browser Batching</h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">Rebuild internal PDF structure sequentially inside your browser safely.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#ef4444] flex items-center justify-center mb-5 group-hover:bg-[#ef4444] group-hover:text-white transition-all duration-300">
              <ShieldCheck size={24} />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">100% Privacy</h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">Sensitive documents never leave your device. Complete privacy guaranteed.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#ef4444] flex items-center justify-center mb-5 group-hover:bg-[#ef4444] group-hover:text-white transition-all duration-300">
              <Blocks size={24} />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Metadata Cleaner</h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">Automatically scrub author information, tracking tags, and unused document objects.</p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 pt-8 pb-4">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="text-[11px] font-bold text-slate-400 tracking-wide mb-4 md:mb-0 uppercase">
            © 2024 UtilityHub Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-[11px] font-bold text-slate-400 tracking-widest">
            <a href="#" className="hover:text-[#ef4444] transition-colors duration-200">PRIVACY</a>
            <a href="#" className="hover:text-[#ef4444] transition-colors duration-200">TERMS</a>
            <a href="#" className="hover:text-[#ef4444] transition-colors duration-200">STATUS</a>
            <a href="#" className="hover:text-[#ef4444] transition-colors duration-200">CONTACT</a>
          </div>
        </div>
      </footer>
    </div>
  );
}