"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileUp, Monitor, CheckCircle2, Clapperboard, Check,
  Download, Loader2, Settings2, VolumeX, Volume2,
  PlaySquare, Sparkles, RefreshCw, Video, Gauge,
  ShieldCheck, Blocks, X, Trash2, DownloadCloud, Film, Share2
} from 'lucide-react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import Navbar from '../../componets/Navbar';

type StatusType = 'pending' | 'processing' | 'done' | 'error';
type FormatType = 'MP4' | 'WebM';
type QualityType = 'High Quality' | 'Balanced' | 'Maximum Compression';

interface VideoItem {
  id: string;
  file: File;
  originalUrl: string;
  originalSize: number;
  compressedUrl: string | null;
  compressedSize: number;
  status: StatusType;
  progress: number;
  newName: string;
  targetFormat: FormatType;
  errorMessage?: string;
}

export default function VideoBatchCompressor() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isEngineLoading, setIsEngineLoading] = useState(false);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  
  const [resolution, setResolution] = useState<string>('720p HD');
  const [quality, setQuality] = useState<QualityType>('Balanced');
  const [removeAudio, setRemoveAudio] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<any>(null);
  const currentProcessingId = useRef<string | null>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0.00 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 0.1) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(2)} MB`;
  };

  const loadFFmpeg = async () => {
    if (!ffmpegRef.current) ffmpegRef.current = new FFmpeg();
    const ffmpeg = ffmpegRef.current;
    if (ffmpeg.loaded) return true;
    
    try {
      setIsEngineLoading(true);
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      ffmpeg.on('progress', ({ progress }: any) => {
        if (currentProcessingId.current) {
          const percent = Math.max(0, Math.min(100, Math.round(progress * 100)));
          setVideos(prev => prev.map(v => v.id === currentProcessingId.current ? { ...v, progress: percent } : v));
        }
      });
      
      setIsEngineLoading(false);
      return true;
    } catch (error) {
      console.error("FFmpeg load error:", error);
      setIsEngineLoading(false);
      alert("Engine load failed. Check internet or COOP/COEP headers.");
      return false;
    }
  };

  const handleFiles = (files: FileList | File[]) => {
    const newVideos: VideoItem[] = Array.from(files)
      .filter(f => f.type.startsWith('video/'))
      .map(f => {
        const id = Math.random().toString(36).substring(7) + Date.now();
        const nameWithoutExt = f.name.replace(/\.[^/.]+$/, "");
        return {
          id, file: f, originalUrl: URL.createObjectURL(f), originalSize: f.size,
          compressedUrl: null, compressedSize: 0, status: 'pending', progress: 0,
          newName: nameWithoutExt, targetFormat: 'MP4',
        };
      });
    setVideos(prev => [...prev, ...newVideos]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const processSingleVideo = async (video: VideoItem) => {
    currentProcessingId.current = video.id;
    setVideos(prev => prev.map(v => v.id === video.id ? { ...v, status: 'processing', progress: 0 } : v));
    const ffmpeg = ffmpegRef.current;
    const inputName = `input_${video.id}.mp4`;
    const outputName = `output_${video.id}.${video.targetFormat === 'MP4' ? 'mp4' : 'webm'}`;

    try {
      await ffmpeg.writeFile(inputName, await fetchFile(video.file));
      const command = ['-i', inputName];

      if (resolution === '720p HD') command.push('-vf', 'scale=-2:720');
      else if (resolution === '4K Ultra HD') command.push('-vf', 'scale=-2:2160');
      else if (resolution === '1080p Full HD') command.push('-vf', 'scale=-2:1080');

      let crf = '28'; 
      if (quality === 'High Quality') crf = '23';
      if (quality === 'Maximum Compression') crf = '34';

      if (video.targetFormat === 'MP4') {
        command.push('-vcodec', 'libx264', '-crf', crf, '-preset', 'ultrafast');
      } else {
        const vp9Crf = (parseInt(crf) + 4).toString(); 
        command.push('-vcodec', 'libvpx-vp9', '-crf', vp9Crf, '-b:v', '0');
      }

      if (removeAudio) command.push('-an');
      command.push(outputName);

      await ffmpeg.exec(command);
      const data = await ffmpeg.readFile(outputName);
      const compressedBlob = new Blob([data as any], { type: video.targetFormat === 'MP4' ? 'video/mp4' : 'video/webm' });
      const newUrl = URL.createObjectURL(compressedBlob);

      setVideos(prev => prev.map(v => {
        if (v.id === video.id) {
          if (v.compressedUrl) URL.revokeObjectURL(v.compressedUrl);
          return { ...v, status: 'done', compressedSize: compressedBlob.size, compressedUrl: newUrl, progress: 100 };
        }
        return v;
      }));

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

    } catch (err: any) {
      console.error(err);
      setVideos(prev => prev.map(v => v.id === video.id ? { ...v, status: 'error', errorMessage: 'Compression failed.' } : v));
    } finally {
      currentProcessingId.current = null;
    }
  };

  const startBatchProcessing = async () => {
    const isLoaded = await loadFFmpeg();
    if (!isLoaded) return;
    setIsProcessingQueue(true);
    let currentVideos = [...videos];
    for (let i = 0; i < currentVideos.length; i++) {
      if (currentVideos[i].status === 'pending' || currentVideos[i].status === 'error') {
        await processSingleVideo(currentVideos[i]);
      }
    }
    setIsProcessingQueue(false);
  };

  const handleCancelAll = () => {
    if (isProcessingQueue && ffmpegRef.current) {
      ffmpegRef.current.terminate();
      setIsProcessingQueue(false);
      setIsEngineLoading(false);
      currentProcessingId.current = null;
      ffmpegRef.current = new FFmpeg();
    }
    setVideos(prev => prev.map(v => v.status === 'processing' ? { ...v, status: 'error', errorMessage: 'Cancelled' } : v));
  };

  const handleNameChange = (id: string, newName: string) => setVideos(prev => prev.map(v => v.id === id ? { ...v, newName } : v));
  const handleFormatChange = (id: string, newFormat: FormatType) => setVideos(prev => prev.map(v => v.id === id ? { ...v, targetFormat: newFormat, status: v.status === 'error' ? 'pending' : v.status } : v));
  const removeVideo = (id: string) => {
    setVideos(prev => {
      const vid = prev.find(v => v.id === id);
      if (vid) {
        URL.revokeObjectURL(vid.originalUrl);
        if (vid.compressedUrl) URL.revokeObjectURL(vid.compressedUrl);
      }
      return prev.filter(v => v.id !== id);
    });
  };

  const downloadVideo = (vid: VideoItem) => {
    if (!vid.compressedUrl || vid.status !== 'done') return;
    const a = document.createElement('a');
    a.href = vid.compressedUrl;
    const cleanName = vid.newName ? vid.newName.trim() : 'optimized_video';
    a.download = `${cleanName}.${vid.targetFormat.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 🔥 NAYA SHARE FEATURE FOR VIDEO 🔥
  const shareVideo = async (vid: VideoItem) => {
    if (!vid.compressedUrl || vid.status !== 'done') return;
    try {
      const response = await fetch(vid.compressedUrl);
      const blob = await response.blob();
      const cleanName = vid.newName ? vid.newName.trim() : 'optimized_video';
      const file = new File([blob], `${cleanName}.${vid.targetFormat.toLowerCase()}`, { type: vid.targetFormat === 'MP4' ? 'video/mp4' : 'video/webm' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Optimized Video',
          text: 'Here is the optimized video.'
        });
      } else {
        alert("Native sharing is not supported on this browser. Please download the file instead.");
      }
    } catch (error) {
      console.error("Error sharing video:", error);
    }
  };

  const handleDownloadAll = async () => {
    const completed = videos.filter(v => v.status === 'done');
    for (let i = 0; i < completed.length; i++) {
      downloadVideo(completed[i]);
      await new Promise(res => setTimeout(res, 600)); 
    }
  };

  const resolutions: string[] = ['4K Ultra HD', '1080p Full HD', '720p HD'];
  const qualities: QualityType[] = ['High Quality', 'Balanced', 'Maximum Compression'];

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 pb-12">
      <Navbar />
      <main className="container mx-auto px-6 pt-12 max-w-[1300px]">
        <div className="mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#5b45f4] text-white text-xs font-semibold tracking-wide mb-4 shadow-sm cursor-default">
            <Sparkles size={14} className="fill-white/20" />
            AI BATCH VIDEO STUDIO
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900">
            Video Optimizer Pro
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Compress, mute, convert and share multiple videos at once securely in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <div className="col-span-1 xl:col-span-8 flex flex-col gap-6">
            <div 
              className="border-2 border-dashed border-slate-300 rounded-3xl bg-white p-10 flex flex-col items-center justify-center text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-300 cursor-pointer group shadow-sm"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input type="file" ref={fileInputRef} className="hidden" multiple accept="video/*" onChange={handleFileChange} />
              <div className="w-16 h-16 bg-indigo-100 text-[#5b45f4] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#5b45f4] group-hover:text-white transition-all duration-300 shadow-sm">
                <FileUp size={28} strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-700 transition-colors">Select Multiple Videos</h3>
              <p className="text-slate-500 text-sm">Drag & Drop files here (MP4, MOV, WebM)</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-4">
                <h4 className="text-xs font-bold text-slate-500 tracking-widest uppercase">Rendering Queue ({videos.length})</h4>
                <div className="flex items-center gap-4">
                  {videos.some(v => v.status === 'done') && (
                    <button onClick={handleDownloadAll} className="text-xs bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-sm">
                      <DownloadCloud size={16} /> Download All
                    </button>
                  )}
                  {videos.length > 0 && !isProcessingQueue && (
                    <button onClick={() => setVideos([])} className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors flex items-center gap-1">
                      <Trash2 size={14}/> Clear All
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 flex-1 overflow-y-auto bg-slate-50/50">
                {videos.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 pb-10 mt-12">
                    <Film size={56} className="mb-4 opacity-20" />
                    <p className="font-medium">No videos added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {videos.map((vid) => {
                      const savings = vid.compressedSize ? Math.round(((vid.originalSize - vid.compressedSize) / vid.originalSize) * 100) : 0;
                      return (
                        <div key={vid.id} className={`bg-white border rounded-2xl p-4 transition-shadow relative overflow-hidden ${vid.status === 'processing' ? 'border-[#3b28cc] shadow-md' : 'border-slate-200 hover:shadow-md'}`}>
                          {vid.status === 'processing' && (
                            <div className="absolute top-0 left-0 h-1 bg-[#3b28cc] transition-all duration-300" style={{ width: `${vid.progress}%` }}></div>
                          )}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="w-20 h-20 rounded-xl bg-black overflow-hidden flex-shrink-0 relative border border-slate-200">
                              <video src={vid.originalUrl} className="w-full h-full object-cover opacity-70" preload="metadata" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                {vid.status === 'processing' ? <div className="bg-white/90 p-1.5 rounded-full backdrop-blur-sm shadow-sm"><Loader2 size={16} className="text-[#3b28cc] animate-spin" /></div> : vid.status === 'done' ? <div className="bg-[#10b981] p-1.5 rounded-full text-white shadow-sm"><Check size={16} /></div> : <Clapperboard size={20} className="text-white/70" />}
                              </div>
                            </div>

                            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 tracking-wider mb-1 block uppercase">File Name</label>
                                <div className="flex items-center relative">
                                  <input type="text" value={vid.newName} onChange={(e) => handleNameChange(vid.id, e.target.value)} disabled={vid.status === 'processing' || vid.status === 'done'} className="w-full text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#3b28cc] disabled:opacity-60 transition-all"/>
                                  <span className="absolute right-3 text-xs text-slate-400 font-bold pointer-events-none">.{vid.targetFormat.toLowerCase()}</span>
                                </div>
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 tracking-wider mb-1 block uppercase">Convert To</label>
                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                  <button onClick={() => handleFormatChange(vid.id, 'MP4')} disabled={vid.status === 'processing' || vid.status === 'done'} className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all disabled:opacity-60 ${vid.targetFormat === 'MP4' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>MP4</button>
                                  <button onClick={() => handleFormatChange(vid.id, 'WebM')} disabled={vid.status === 'processing' || vid.status === 'done'} className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all disabled:opacity-60 ${vid.targetFormat === 'WebM' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>WebM</button>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-5">
                              <div className="text-right flex flex-col items-end min-w-[90px]">
                                {vid.status === 'done' ? (
                                  <>
                                    <span className="text-sm font-bold text-emerald-600">{formatSize(vid.compressedSize)}</span>
                                    <div className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded uppercase mt-1">-{savings > 0 ? savings : 0}%</div>
                                  </>
                                ) : vid.status === 'processing' ? (
                                  <>
                                    <span className="text-sm font-bold text-[#3b28cc]">{vid.progress}%</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Rendering</span>
                                  </>
                                ) : vid.status === 'error' ? (
                                  <span className="text-[11px] font-bold text-red-500">Failed</span>
                                ) : (
                                  <>
                                    <span className="text-sm font-bold text-slate-600">{formatSize(vid.originalSize)}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Queued</span>
                                  </>
                                )}
                              </div>

                              {/* Actions inclding SHARE */}
                              <div className="flex items-center gap-2">
                                <button onClick={() => shareVideo(vid)} disabled={vid.status !== 'done'} title="Share Video" className={`p-2.5 rounded-xl transition-all ${vid.status === 'done' ? 'text-slate-500 bg-slate-100 hover:bg-indigo-50 hover:text-[#3b28cc]' : 'text-slate-300 bg-slate-100 cursor-not-allowed'}`}>
                                  <Share2 size={18} />
                                </button>
                                <button onClick={() => downloadVideo(vid)} disabled={vid.status !== 'done'} className={`p-2.5 rounded-xl transition-all ${vid.status === 'done' ? 'text-white bg-[#3b28cc] hover:bg-indigo-800 shadow-sm hover:-translate-y-0.5' : 'text-slate-300 bg-slate-100 cursor-not-allowed'}`}>
                                  <Download size={18} />
                                </button>
                                <button onClick={() => removeVideo(vid.id)} disabled={vid.status === 'processing'} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50">
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

          <div className="col-span-1 xl:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm relative">
              {isProcessingQueue && <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 rounded-3xl cursor-not-allowed"></div>}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2"><Settings2 size={18} className="text-slate-700" /><h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">Global Settings</h2></div>
              </div>
              <div className="mb-6">
                <label className="block text-[11px] font-bold text-slate-500 tracking-widest mb-3 uppercase">Quality Level</label>
                <div className="relative">
                  <select value={quality} onChange={(e) => setQuality(e.target.value as QualityType)} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl pl-4 pr-10 py-3.5 focus:outline-none focus:border-[#3b28cc] appearance-none cursor-pointer transition-all">
                    {qualities.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-[11px] font-bold text-slate-500 tracking-widest mb-3 uppercase">Resolution Preset</label>
                <div className="grid grid-cols-1 gap-2">
                  {resolutions.map((res) => (
                    <button key={res} onClick={() => setResolution(res)} className={`rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-all border ${resolution === res ? 'border-[#3b28cc] bg-indigo-50 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                      <span className={`text-sm ${resolution === res ? 'font-bold text-[#3b28cc]' : 'font-semibold text-slate-600'}`}>{res}</span>
                      {resolution === res ? <CheckCircle2 size={18} className="text-[#3b28cc]" /> : <Monitor size={16} className="text-slate-400" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-8 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between cursor-pointer bg-slate-50 border border-slate-200 p-4 rounded-xl hover:border-slate-300 transition-all" onClick={() => setRemoveAudio(!removeAudio)}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl transition-colors ${removeAudio ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-[#3b28cc]'}`}>{removeAudio ? <VolumeX size={18} /> : <Volume2 size={18} />}</div>
                    <div><div className="text-sm font-bold text-slate-800">Mute Audio Track</div><div className="text-[11px] font-medium text-slate-500">Completely removes audio</div></div>
                  </div>
                  <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${removeAudio ? 'bg-[#3b28cc]' : 'bg-slate-200'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${removeAudio ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2">
              {isProcessingQueue || isEngineLoading ? (
                <button onClick={handleCancelAll} className="w-full bg-red-50 border border-red-200 text-red-500 font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-all"><X size={20} /> Stop Processing</button>
              ) : (
                <button onClick={startBatchProcessing} disabled={videos.length === 0 || !videos.some(v => v.status === 'pending' || v.status === 'error')} className="w-full bg-[#3b28cc] hover:bg-indigo-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all"><PlaySquare size={20} className="fill-white/20" /> Start Rendering All</button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}