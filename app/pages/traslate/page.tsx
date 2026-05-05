"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronDown,
  Mic,
  FileUp,
  Volume2,
  Square,
  Copy,
  Share2,
  FileCode2,
  ShieldCheck,
  Boxes,
  Check,
  ArrowLeftRight,
} from 'lucide-react';
import Navbar from '../../componets/Navbar';

// FIX 1: Removed unused `MicOff` import

const LANGUAGES = [
  { code: 'af-ZA', name: 'Afrikaans', short: 'af' },
  { code: 'sq-AL', name: 'Albanian', short: 'sq' },
  { code: 'am-ET', name: 'Amharic', short: 'am' },
  { code: 'ar-SA', name: 'Arabic', short: 'ar' },
  { code: 'hy-AM', name: 'Armenian', short: 'hy' },
  { code: 'az-AZ', name: 'Azerbaijani', short: 'az' },
  { code: 'bn-IN', name: 'Bengali', short: 'bn' },
  { code: 'bs-BA', name: 'Bosnian', short: 'bs' },
  { code: 'bg-BG', name: 'Bulgarian', short: 'bg' },
  { code: 'my-MM', name: 'Burmese', short: 'my' },
  { code: 'ca-ES', name: 'Catalan', short: 'ca' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', short: 'zh' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', short: 'zh-TW' },
  { code: 'hr-HR', name: 'Croatian', short: 'hr' },
  { code: 'cs-CZ', name: 'Czech', short: 'cs' },
  { code: 'da-DK', name: 'Danish', short: 'da' },
  { code: 'nl-NL', name: 'Dutch', short: 'nl' },
  { code: 'en-US', name: 'English (US)', short: 'en' },
  { code: 'en-GB', name: 'English (UK)', short: 'en' },
  { code: 'et-EE', name: 'Estonian', short: 'et' },
  { code: 'fil-PH', name: 'Filipino', short: 'tl' },
  { code: 'fi-FI', name: 'Finnish', short: 'fi' },
  { code: 'fr-FR', name: 'French', short: 'fr' },
  { code: 'ka-GE', name: 'Georgian', short: 'ka' },
  { code: 'de-DE', name: 'German', short: 'de' },
  { code: 'el-GR', name: 'Greek', short: 'el' },
  { code: 'gu-IN', name: 'Gujarati', short: 'gu' },
  { code: 'he-IL', name: 'Hebrew', short: 'he' },
  { code: 'hi-IN', name: 'Hindi', short: 'hi' },
  { code: 'hu-HU', name: 'Hungarian', short: 'hu' },
  { code: 'is-IS', name: 'Icelandic', short: 'is' },
  { code: 'id-ID', name: 'Indonesian', short: 'id' },
  { code: 'it-IT', name: 'Italian', short: 'it' },
  { code: 'ja-JP', name: 'Japanese', short: 'ja' },
  { code: 'jv-ID', name: 'Javanese', short: 'jv' },
  { code: 'kn-IN', name: 'Kannada', short: 'kn' },
  { code: 'kk-KZ', name: 'Kazakh', short: 'kk' },
  { code: 'km-KH', name: 'Khmer', short: 'km' },
  { code: 'ko-KR', name: 'Korean', short: 'ko' },
  { code: 'ku-TR', name: 'Kurdish', short: 'ku' },
  { code: 'ky-KG', name: 'Kyrgyz', short: 'ky' },
  { code: 'lo-LA', name: 'Lao', short: 'lo' },
  { code: 'lv-LV', name: 'Latvian', short: 'lv' },
  { code: 'lt-LT', name: 'Lithuanian', short: 'lt' },
  { code: 'mk-MK', name: 'Macedonian', short: 'mk' },
  { code: 'ms-MY', name: 'Malay', short: 'ms' },
  { code: 'ml-IN', name: 'Malayalam', short: 'ml' },
  { code: 'mr-IN', name: 'Marathi', short: 'mr' },
  { code: 'mn-MN', name: 'Mongolian', short: 'mn' },
  { code: 'ne-NP', name: 'Nepali', short: 'ne' },
  { code: 'no-NO', name: 'Norwegian', short: 'no' },
  { code: 'ps-AF', name: 'Pashto', short: 'ps' },
  { code: 'fa-IR', name: 'Persian', short: 'fa' },
  { code: 'pl-PL', name: 'Polish', short: 'pl' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', short: 'pt' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', short: 'pt' },
  { code: 'pa-IN', name: 'Punjabi', short: 'pa' },
  { code: 'ro-RO', name: 'Romanian', short: 'ro' },
  { code: 'ru-RU', name: 'Russian', short: 'ru' },
  { code: 'sr-RS', name: 'Serbian', short: 'sr' },
  { code: 'si-LK', name: 'Sinhala', short: 'si' },
  { code: 'sk-SK', name: 'Slovak', short: 'sk' },
  { code: 'sl-SI', name: 'Slovenian', short: 'sl' },
  { code: 'es-ES', name: 'Spanish', short: 'es' },
  { code: 'es-MX', name: 'Spanish (Mexico)', short: 'es' },
  { code: 'sw-KE', name: 'Swahili', short: 'sw' },
  { code: 'sv-SE', name: 'Swedish', short: 'sv' },
  { code: 'ta-IN', name: 'Tamil', short: 'ta' },
  { code: 'te-IN', name: 'Telugu', short: 'te' },
  { code: 'th-TH', name: 'Thai', short: 'th' },
  { code: 'tr-TR', name: 'Turkish', short: 'tr' },
  { code: 'uk-UA', name: 'Ukrainian', short: 'uk' },
  { code: 'ur-PK', name: 'Urdu', short: 'ur' },
  { code: 'uz-UZ', name: 'Uzbek', short: 'uz' },
  { code: 'vi-VN', name: 'Vietnamese', short: 'vi' },
  { code: 'cy-GB', name: 'Welsh', short: 'cy' },
  { code: 'zu-ZA', name: 'Zulu', short: 'zu' },
];

export default function RealTimeTranslatorPage() {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en-US');
  const [targetLang, setTargetLang] = useState('hi-IN');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  // FIX 2: Use a ref to track listening state inside callbacks to avoid stale closures
  const isListeningRef = useRef(false);
  // FIX 3: Polling interval ref for speechSynthesis Chrome bug workaround
  const speakPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // FIX 7: Fully clean up mic AND speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        if (speakPollRef.current) clearInterval(speakPollRef.current);
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) { /* ignore */ }
        recognitionRef.current = null;
      }
    };
  }, []);

  // FIX 8 & GOOGLE API UPDATE: Short-circuit translation when source === target language
  useEffect(() => {
    if (!inputText.trim()) {
      setTranslatedText('');
      setIsTranslating(false);
      return;
    }

    const sourceShort = LANGUAGES.find(l => l.code === sourceLang)?.short || 'en';
    const targetShort = LANGUAGES.find(l => l.code === targetLang)?.short || 'hi';

    // FIX 8: Skip API call if same language — just mirror the text
    if (sourceShort === targetShort) {
      setTranslatedText(inputText);
      setIsTranslating(false);
      return;
    }

    setIsTranslating(true);

    const timer = setTimeout(async () => {
      try {
        // ✨ GOOGLE TRANSLATE FIX: Increased chunk size to 1000 for better performance
        const chunkSize = 1000;
        const words = inputText.split(' ');
        const chunks: string[] = [];
        let currentChunk = '';

        for (const word of words) {
          if ((currentChunk + ' ' + word).length > chunkSize) {
            chunks.push(currentChunk.trim());
            currentChunk = word;
          } else {
            currentChunk = currentChunk ? currentChunk + ' ' + word : word;
          }
        }
        if (currentChunk) chunks.push(currentChunk.trim());

        let finalTranslatedText = '';

        for (const chunk of chunks) {
          if (!chunk) continue;
          
          // ✨ GOOGLE TRANSLATE API: Removed MyMemory, implemented Google API
          const response = await fetch(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceShort}&tl=${targetShort}&dt=t&q=${encodeURIComponent(chunk)}`
          );
          const data = await response.json();

          // Parsing Google Array format
          if (data && data[0]) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const chunkTranslation = data[0].map((item: any) => item[0]).join('');
            finalTranslatedText += chunkTranslation + ' ';
          }
        }

        setTranslatedText(finalTranslatedText.trim() || 'Translation error. Please try again.');
      } catch (error) {
        console.error('Translation failed:', error);
        setTranslatedText('Network error. Could not connect to translation service.');
      } finally {
        setIsTranslating(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [inputText, targetLang, sourceLang]);

  // FIX 2: toggleListening uses a ref-backed approach so `onend` never gets stale state
  const toggleListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Your browser does not support Speech Recognition. Please use Chrome.');
      return;
    }

    if (isListeningRef.current) {
      // User clicked Stop
      isListeningRef.current = false;
      setIsListening(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) { /* ignore */ }
        recognitionRef.current = null;
      }
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = sourceLang;
      recognition.continuous = true;
      recognition.interimResults = true;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInputText((prev) => (prev + ' ' + finalTranscript).trim() + ' ');
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        isListeningRef.current = false;
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.onend = () => {
        // FIX 2: Only mark stopped if the user didn't explicitly request continuous listening.
        // If isListeningRef is still true, the browser ended early — restart automatically.
        if (isListeningRef.current && recognitionRef.current) {
          try {
            recognition.start();
          } catch (_) {
            isListeningRef.current = false;
            setIsListening(false);
            recognitionRef.current = null;
          }
        } else {
          isListeningRef.current = false;
          setIsListening(false);
          recognitionRef.current = null;
        }
      };

      recognitionRef.current = recognition;
      isListeningRef.current = true;
      recognition.start();
      setIsListening(true);
    } catch (e) {
      console.error('Error starting speech recognition:', e);
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, [sourceLang]);

  // FIX 3: isSpeaking stuck fix — poll speechSynthesis.speaking as Chrome's onend is unreliable
  const handleSpeak = useCallback(() => {
    if (!translatedText) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      if (speakPollRef.current) { clearInterval(speakPollRef.current); speakPollRef.current = null; }
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    if (speakPollRef.current) { clearInterval(speakPollRef.current); speakPollRef.current = null; }

    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = targetLang;

    utterance.onstart = () => {
      setIsSpeaking(true);
      // Poll every 250ms to detect when speech actually ends (Chrome bug fix)
      speakPollRef.current = setInterval(() => {
        if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
          setIsSpeaking(false);
          if (speakPollRef.current) { clearInterval(speakPollRef.current); speakPollRef.current = null; }
        }
      }, 250);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (speakPollRef.current) { clearInterval(speakPollRef.current); speakPollRef.current = null; }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (speakPollRef.current) { clearInterval(speakPollRef.current); speakPollRef.current = null; }
    };

    window.speechSynthesis.speak(utterance);
  }, [translatedText, targetLang, isSpeaking]);

  const handleCopy = useCallback(() => {
    if (!translatedText) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [translatedText]);

  // FIX 5: Fixed share — guard on translatedText before attempting share
  const handleShare = useCallback(() => {
    if (!translatedText) return;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: 'Translation', text: translatedText }).catch(() => {/* user cancelled */});
    } else {
      alert('Sharing not supported on this browser.');
    }
  }, [translatedText]);

  // FIX 4: File upload — added user feedback for wrong file type
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt') && file.type !== 'text/plain') {
      alert('Only plain text (.txt) files are supported. Please upload a .txt file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) setInputText(text);
    };
    reader.onerror = () => {
      alert('Failed to read the file. Please try again.');
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // FIX 6: Language swap handler
  const handleSwapLanguages = useCallback(() => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    // Also swap the text so the user can back-translate
    setInputText(translatedText);
    setTranslatedText('');
  }, [sourceLang, targetLang, translatedText]);

  return (
    <div className="min-h-screen bg-[#fcfcff] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 pb-12">

      <Navbar />

      <main className="container mx-auto px-6 pt-12 max-w-[1200px] space-y-10">

        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-[#eeebfd] text-[#3b28cc] text-[11px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">
              Tool
            </span>
            <span className="text-[11px] font-bold text-[#3b28cc] tracking-widest uppercase">
              Real-Time Translator
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900">
            Break language barriers instantly.
          </h1>
          <p className="text-[17px] text-slate-600 leading-relaxed">
            Enterprise-grade translation engine powered by advanced neural networks.<br />
            Accurate, fast, and optimized for technical documentation and developer workflows.
          </p>
        </div>

        {/* FIX 6: Added swap button between the two panes */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Source Pane */}
          <div
            className={`bg-white rounded-[1.5rem] border ${
              isListening
                ? 'border-red-400 shadow-[0_0_15px_rgba(248,113,113,0.15)]'
                : 'border-slate-200 hover:border-slate-300'
            } p-6 flex flex-col h-[420px] shadow-sm transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">Source Language</span>
              <div className="relative group max-w-[180px] w-full">
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="appearance-none w-full flex items-center gap-2 bg-slate-50 border border-slate-200 pl-4 pr-10 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:border-[#d2c4f9] truncate"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={`src-${lang.code}`} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-slate-600" />
              </div>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 w-full resize-none outline-none text-slate-700 text-lg bg-transparent placeholder:text-slate-400"
              placeholder={isListening ? 'Listening… Speak now.' : 'Paste or type your text here...'}
            />

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleListening}
                  className={`transition-all flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    isListening
                      ? 'text-red-600 bg-red-50 border border-red-100 animate-pulse'
                      : 'text-slate-600 hover:text-[#3b28cc] hover:bg-indigo-50 border border-transparent'
                  }`}
                  title={isListening ? 'Stop listening' : 'Start speaking'}
                >
                  {isListening ? (
                    <><Square size={16} fill="currentColor" /> Stop</>
                  ) : (
                    <><Mic size={18} /> Speak</>
                  )}
                </button>

                <input
                  type="file"
                  accept=".txt,text/plain"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-slate-500 hover:text-[#3b28cc] transition-colors p-2 hover:bg-indigo-50 rounded-lg"
                  title="Upload Text File (.txt)"
                >
                  <FileUp size={20} />
                </button>
              </div>
              <span className="text-xs font-medium text-slate-400">{inputText.length} characters</span>
            </div>
          </div>

          {/* FIX 6: Swap button — centred between panes on desktop, inline on mobile */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden lg:flex">
            <button
              onClick={handleSwapLanguages}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-500 hover:text-[#3b28cc] hover:border-[#d2c4f9] hover:shadow-lg transition-all duration-200 active:scale-95"
              title="Swap languages"
            >
              <ArrowLeftRight size={16} />
            </button>
          </div>
          {/* Mobile swap button */}
          <div className="flex justify-center lg:hidden -mt-2 -mb-2">
            <button
              onClick={handleSwapLanguages}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow text-sm font-medium text-slate-600 hover:text-[#3b28cc] hover:border-[#d2c4f9] transition-all duration-200 active:scale-95"
            >
              <ArrowLeftRight size={15} /> Swap Languages
            </button>
          </div>

          {/* Target Pane */}
          <div className="bg-[#fcfbfe] rounded-[1.5rem] border border-[#e5e1f9] p-6 flex flex-col h-[420px] shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between mb-6 relative z-10">
              <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">Target Language</span>
              <div className="relative group max-w-[180px] w-full">
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="appearance-none w-full flex items-center gap-2 bg-white border border-[#e5e1f9] pl-4 pr-10 py-2 rounded-lg text-sm font-medium text-slate-700 hover:border-[#d2c4f9] transition-colors shadow-sm cursor-pointer focus:outline-none focus:border-[#3b28cc] truncate"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={`tgt-${lang.code}`} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-slate-600" />
              </div>
            </div>

            <div className="flex-1 w-full relative z-10 overflow-y-auto pr-2">
              {isTranslating ? (
                <div className="flex items-center gap-2 text-slate-400 text-lg">
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-[#3b28cc] rounded-full animate-spin" />
                  Translating…
                </div>
              ) : translatedText ? (
                <p className="text-lg text-[#3b28cc] font-medium leading-relaxed whitespace-pre-wrap">
                  {translatedText}
                </p>
              ) : (
                <p className="text-lg text-slate-400">
                  Translations will appear here as you type in the source pane…
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#e5e1f9] relative z-10 mt-auto">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSpeak}
                  disabled={!translatedText}
                  className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-all border ${
                    !translatedText
                      ? 'text-slate-400 border-transparent cursor-not-allowed'
                      : isSpeaking
                      ? 'text-red-600 bg-red-50 border-red-100'
                      : 'text-slate-600 border-transparent hover:text-[#3b28cc] hover:bg-white hover:border-slate-200'
                  }`}
                >
                  {isSpeaking ? (
                    <><Square size={16} fill="currentColor" /> Stop</>
                  ) : (
                    <><Volume2 size={18} /> Speak</>
                  )}
                </button>

                <button
                  onClick={handleCopy}
                  disabled={!translatedText}
                  className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-all border border-transparent ${
                    !translatedText
                      ? 'text-slate-400 cursor-not-allowed'
                      : copied
                      ? 'text-green-600 bg-green-50 border-green-100'
                      : 'text-slate-600 hover:text-[#3b28cc] hover:bg-white hover:border-slate-200'
                  }`}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <button
                onClick={handleShare}
                disabled={!translatedText}
                className={`p-2 rounded-lg border border-transparent transition-colors ${
                  !translatedText
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-500 hover:text-[#3b28cc] hover:bg-white hover:border-slate-200'
                }`}
                title="Share translation"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-[1.5rem] p-6 border border-slate-200 hover:border-[#4f38e6]/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex items-start gap-5">
            <div className="w-12 h-12 shrink-0 bg-[#eeebfd] text-[#4f38e6] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileCode2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">Code-Aware</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Preserves code syntax, markdown formatting, and technical variables during translation.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[1.5rem] p-6 border border-slate-200 hover:border-[#4f38e6]/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex items-start gap-5">
            <div className="w-12 h-12 shrink-0 bg-[#eeebfd] text-[#4f38e6] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">E2E Encryption</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Your source data is processed in a sandbox and never stored or used for model training.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[1.5rem] p-6 border border-slate-200 hover:border-[#4f38e6]/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex items-start gap-5">
            <div className="w-12 h-12 shrink-0 bg-[#eeebfd] text-[#4f38e6] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Boxes size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">Developer API</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Integrate our neural translation engine directly into your CI/CD pipelines and apps.
              </p>
            </div>
          </div>
        </div>

        <div className="relative rounded-[1.5rem] overflow-hidden h-[240px] bg-slate-900 shadow-lg group">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-700 group-hover:scale-105"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2000")' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 md:p-10 w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
              Precision-engineered for clarity.
            </h2>
            <p className="text-slate-300 text-sm md:text-base font-medium">
              Processing 1.2M tokens per second globally.
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-16 border-t border-slate-100 bg-[#f9fafc]">
        <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-6 text-[11px] font-bold text-slate-400 tracking-widest mb-4 md:mb-0">
            <a href="#" className="hover:text-[#3b28cc] transition-colors duration-200">PRIVACY</a>
            <a href="#" className="hover:text-[#3b28cc] transition-colors duration-200">TERMS</a>
            <a href="#" className="hover:text-[#3b28cc] transition-colors duration-200">STATUS</a>
            <a href="#" className="hover:text-[#3b28cc] transition-colors duration-200">CONTACT</a>
          </div>
          <div className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">
            © 2024 UtilityHub Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}