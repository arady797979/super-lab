/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, ChangeEvent } from 'react';
import { 
  Languages, 
  Volume2, 
  Square, 
  Download, 
  Trash2, 
  Moon, 
  Sun, 
  ChevronRight, 
  Loader2,
  FileText,
  Copy,
  Check,
  Upload,
  FileAudio,
  FileSearch,
  X,
  Mic,
  Library as LibraryIcon,
  Plus,
  History,
  Settings,
  MoreVertical,
  ExternalLink,
  FileCode,
  Globe,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getAiEngine, isRealAiActive } from './services/aiService';

// Initialize AI Engine
const engine = getAiEngine();

interface SavedProject {
  id: string;
  title: string;
  sourceText: string;
  translatedText: string;
  targetLang: string;
  timestamp: number;
}

// Languages supported by MyMemory API and browser TTS
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', voiceKey: 'en', recCode: 'en-US' },
  { code: 'es', name: 'Spanish', voiceKey: 'es', recCode: 'es-ES' },
  { code: 'fr', name: 'French', voiceKey: 'fr', recCode: 'fr-FR' },
  { code: 'de', name: 'German', voiceKey: 'de', recCode: 'de-DE' },
  { code: 'it', name: 'Italian', voiceKey: 'it', recCode: 'it-IT' },
  { code: 'pt', name: 'Portuguese', voiceKey: 'pt', recCode: 'pt-PT' },
  { code: 'zh', name: 'Chinese (Simplified)', voiceKey: 'zh', recCode: 'zh-CN' },
  { code: 'ar', name: 'Arabic', voiceKey: 'ar', recCode: 'ar-SA' },
  { code: 'hi', name: 'Hindi', voiceKey: 'hi', recCode: 'hi-IN' },
  { code: 'ja', name: 'Japanese', voiceKey: 'ja', recCode: 'ja-JP' },
  { code: 'ko', name: 'Korean', voiceKey: 'ko', recCode: 'ko-KR' },
  { code: 'ru', name: 'Russian', voiceKey: 'ru', recCode: 'ru-RU' },
];

type UILang = 'en' | 'ar' | 'es' | 'fr';

const UI_TRANSLATIONS: Record<UILang, any> = {
  en: {
    studio: 'Studio',
    library: 'Library',
    sessionMetrics: 'Session Metrics',
    words: 'words',
    source: 'SOURCE',
    extraction: 'Content Extraction',
    capture: 'Voice Capture',
    recording: 'Recording...',
    import: 'Import File',
    clear: 'Clear Workspace',
    translate: 'Translate Now',
    translating: 'Processing...',
    output: 'OUTPUT',
    targetLanguage: 'Target Language',
    copy: 'Copy',
    copied: 'Copied!',
    tts: 'Generate Audio',
    ttsAi: 'AI Speech Generation...',
    ttsSpeaking: 'Speaking',
    playbackHub: 'Playback Hub',
    history: 'Workspace History',
    openProject: 'Open Project',
    saveProject: 'Save Project',
    export: 'Export',
    translatingSequence: 'Translating Sequence...',
    awaitingInput: 'Awaiting Input',
    aiTranslation: 'AI Translation',
    placeholderOutput: 'AI translation will materialize here...',
    targetEngine: 'Target Engine',
    processing: 'Processing',
    aiVoiceGen: 'AI Voice Generation...',
    voiceLanguage: 'Voice Language',
    sloganMain: 'Turn any textbook into an audiobook',
    sloganSub: 'Enjoy translations of any text or audio book into another language',
    sloganVoice: 'Speak here and turn your speech into any language speech generated',
    projectsSaved: 'Projects Saved', // Library tab
    noProjects: 'No projects saved yet.',
    yourLibrary: 'Your Library',
    libraryDesc: 'Access your saved translations and processed documents.',
    matrix: 'Usage Matrix',
    matrixDesc: 'Real-time monitoring of AI consumption.',
    cost: 'Estimated Direct Cost',
    tokens: 'Tokens Scanned',
    requests: 'Total Requests',
    reset: 'Reset',
    close: 'Close Matrix',
    operationalBreakdown: 'Operational Breakdown',
    nominal: 'Status: Nominal',
    systemDesc: 'System consumption remains within optimal parameters.'
  },
  ar: {
    studio: 'الاستوديو',
    library: 'المكتبة',
    sessionMetrics: 'مقاييس الجلسة',
    words: 'كلمات',
    source: 'المصدر',
    extraction: 'استخراج المحتوى',
    capture: 'التقاط صوتي',
    recording: 'جاري التسجيل...',
    import: 'استيراد ملف',
    clear: 'مسح الاستوديو',
    translate: 'ترجم الآن',
    translating: 'جاري المعالجة...',
    output: 'النتيجة',
    targetLanguage: 'اللغة المستهدفة',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    tts: 'توليد الصوت',
    ttsAi: 'توليد صوت ذكاء اصطناعي...',
    ttsSpeaking: 'يتحدث',
    playbackHub: 'مركز التشغيل',
    history: 'سجل العمل',
    openProject: 'فتح المشروع',
    saveProject: 'حفظ المشروع',
    export: 'تصدير',
    translatingSequence: 'جاري الترجمة...',
    awaitingInput: 'في انتظار الإدخال',
    aiTranslation: 'ترجمة الذكاء الاصطناعي',
    placeholderOutput: 'ستظهر ترجمة الذكاء الاصطناعي هنا...',
    targetEngine: 'محرك البحث',
    processing: 'جاري العمل',
    aiVoiceGen: 'توليد صوت ذكاء اصطناعي...',
    voiceLanguage: 'لغة الصوت',
    sloganMain: 'حوّل أي كتاب مدرسي إلى كتاب صوتي',
    sloganSub: 'استمتع بترجمة أي نص أو كتاب صوتي إلى لغة أخرى',
    sloganVoice: 'تحدث هنا وحوّل كلامك إلى أي لغة منطوقة',
    projectsSaved: 'مشاريع محفوظة',
    noProjects: 'لا توجد مشاريع محفوظة بعد.',
    yourLibrary: 'مكتبتك',
    libraryDesc: 'الوصول إلى الترجمات والمجلدات المحفوظة.',
    matrix: 'مصفوفة الاستهلاك',
    matrixDesc: 'مراقبة حية لاستهلاك الذكاء الاصطناعي.',
    cost: 'التكلفة المباشرة المقدرة',
    tokens: 'الرموز الممسوحة',
    requests: 'إجمالي الطلبات',
    reset: 'إعادة ضبط',
    close: 'إغلاق المصفوفة',
    operationalBreakdown: 'التحليل التشغيلي',
    nominal: 'الحالة: طبيعية',
    systemDesc: 'استهلاك النظام ضمن المعايير المثالية.'
  },
  es: {
    studio: 'Estudio',
    library: 'Biblioteca',
    sessionMetrics: 'Métricas de Sesión',
    words: 'palabras',
    source: 'FUENTE',
    extraction: 'Extracción de Contenido',
    capture: 'Captura de Voz',
    recording: 'Grabando...',
    import: 'Importar Archivo',
    clear: 'Limpiar Espacio',
    translate: 'Traducir Ahora',
    translating: 'Procesando...',
    output: 'RESULTADO',
    targetLanguage: 'Idioma Destino',
    copy: 'Copiar',
    copied: '¡Copiado!',
    tts: 'Generar Audio',
    ttsAi: 'Generando Voz AI...',
    ttsSpeaking: 'Hablando',
    playbackHub: 'Centro de Reproducción',
    history: 'Historial',
    openProject: 'Abrir Proyecto',
    saveProject: 'Guardar Proyecto',
    export: 'Exportar',
    translatingSequence: 'Traduciendo Secuencia...',
    awaitingInput: 'Esperando Entrada',
    aiTranslation: 'Traducción IA',
    placeholderOutput: 'La traducción de IA aparecerá aquí...',
    targetEngine: 'Motor de Destino',
    processing: 'Procesando',
    aiVoiceGen: 'Generación de voz IA...',
    voiceLanguage: 'Idioma de Voz',
    sloganMain: 'Convierte cualquier libro de texto en un audiolibro',
    sloganSub: 'Disfruta de las traducciones de cualquier texto o audiolibro a otro idioma',
    sloganVoice: 'Habla aquí y convierte tu voz en cualquier idioma generado',
    projectsSaved: 'Proyectos Guardados',
    noProjects: 'Aún no hay proyectos guardados.',
    yourLibrary: 'Tu Biblioteca',
    libraryDesc: 'Accede a tus traducciones y documentos guardados.',
    matrix: 'Matriz de Consumo',
    matrixDesc: 'Monitoreo en tiempo real del consumo de IA.',
    cost: 'Costo Directo Estimado',
    tokens: 'Tokens Escaneados',
    requests: 'Solicitudes Totales',
    reset: 'Reiniciar',
    close: 'Cerrar Matriz',
    operationalBreakdown: 'Desglose Operativo',
    nominal: 'Estado: Nominal',
    systemDesc: 'El consumo del sistema permanece dentro de los parámetros óptimos.'
  },
  fr: {
    studio: 'Studio',
    library: 'Bibliothèque',
    sessionMetrics: 'Métriques de Session',
    words: 'mots',
    source: 'SOURCE',
    extraction: 'Extraction de Contenu',
    capture: 'Capture Vocale',
    recording: 'Enregistrement...',
    import: 'Importer Fichier',
    clear: 'Effacer l’espace',
    translate: 'Traduire Maintenant',
    translating: 'Traitement...',
    output: 'RÉSULTAT',
    targetLanguage: 'Langue Cible',
    copy: 'Copier',
    copied: 'Copié !',
    tts: 'Générer Audio',
    ttsAi: 'Génération de Voix IA...',
    ttsSpeaking: 'Parle',
    playbackHub: 'Centre de Lecture',
    history: 'Historique',
    openProject: 'Ouvrir le Projet',
    saveProject: 'Enregistrer le Projet',
    export: 'Exporter',
    translatingSequence: 'Codage en cours...',
    awaitingInput: 'Attente d\'entrée',
    aiTranslation: 'Traduction IA',
    placeholderOutput: 'La traduction IA apparaîtra ici...',
    targetEngine: 'Moteur Cible',
    processing: 'Traitement',
    aiVoiceGen: 'Génération de voix IA...',
    voiceLanguage: 'Langue de la Voix',
    sloganMain: 'Transformez n\'importe quel manuel en livre audio',
    sloganSub: 'Profitez des traductions de n\'importe quel texte ou livre audio dans une autre langue',
    sloganVoice: 'Parlez ici et transformez votre voix en n\'importe quelle langue générée',
    projectsSaved: 'Projets Sauvegardés',
    noProjects: 'Aucun projet sauvegardé pour le moment.',
    yourLibrary: 'Votre Bibliothèque',
    libraryDesc: 'Accédez à vos traducciones et documents sauvegardés.',
    matrix: 'Matrice de Consommation',
    matrixDesc: 'Surveillance en temps réel de la consommation d\'IA.',
    cost: 'Coût Direct Estimé',
    tokens: 'Tokens Scannés',
    requests: 'Demandes Totales',
    reset: 'Réinitialiser',
    close: 'Fermer la Matrice',
    operationalBreakdown: 'Répartition Opérationnelle',
    nominal: 'Statut : Nominal',
    systemDesc: 'La consommation du système reste dans les paramètres optimaux.'
  }
};

interface ConsumptionData {
  totalTokens: number;
  promptTokens: number;
  candidateTokens: number;
  translationTokens: number;
  ttsTokens: number;
  totalRequests: number;
  estimatedCost: number; // In USD
}

const BRAND_COLORS = {
  primary: '#00ffaa',
  secondary: '#00d2ff',
  tertiary: '#bd00ff',
  quaternary: '#ff00c8'
};

export default function App() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLang, setTargetLang] = useState('es');
  const [voiceLang, setVoiceLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speakingLanguage, setSpeakingLanguage] = useState<string | null>(null);
  const [uiLang, setUiLang] = useState<UILang>('en');

  // Multi-lang helper
  const t = UI_TRANSLATIONS[uiLang];

  // Consumption State
  const [consumption, setConsumption] = useState<ConsumptionData>({
    totalTokens: 0,
    promptTokens: 0,
    candidateTokens: 0,
    translationTokens: 0,
    ttsTokens: 0,
    totalRequests: 0,
    estimatedCost: 0
  });

  const [showConsumptionMatrix, setShowConsumptionMatrix] = useState(false);
  
  // New States for File Support
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Library & UI Scale States
  const [library, setLibrary] = useState<SavedProject[]>([]);
  const [activeTab, setActiveTab] = useState<'workspace' | 'library'>('workspace');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const synth = useRef<SpeechSynthesis | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpeakingRequested = useRef(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    synth.current = window.speechSynthesis;
    
    const loadVoices = () => {
      if (synth.current) {
        const voices = synth.current.getVoices();
        if (voices.length > 0) {
          console.log("Voices initialized successfully.");
        }
      }
    };

    // Chrome/Edge/Safari support both methods
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
    
    // Some browsers need a tiny delay to initialize the voice list after the first call
    setTimeout(loadVoices, 100);
    setTimeout(loadVoices, 500);

    // Load dark mode preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }

    return () => {
      if (synth.current) synth.current.cancel();
    };
  }, []);

  // Load Library from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('aurabook_library');
    if (saved) {
      try {
        setLibrary(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load library");
      }
    }
  }, []);

  // Persist Library
  useEffect(() => {
    localStorage.setItem('aurabook_library', JSON.stringify(library));
  }, [library]);

  // Load UI Language
  useEffect(() => {
    const savedUiLang = localStorage.getItem('aurabook_uilang');
    if (savedUiLang && (['en', 'ar', 'es', 'fr'].includes(savedUiLang))) {
      setUiLang(savedUiLang as UILang);
    }
  }, []);

  // Persist UI Language
  useEffect(() => {
    localStorage.setItem('aurabook_uilang', uiLang);
    document.dir = uiLang === 'ar' ? 'rtl' : 'ltr';
  }, [uiLang]);

  // Persist Voice Language
  useEffect(() => {
    localStorage.setItem('vox_voicelang', voiceLang);
  }, [voiceLang]);

  // Load Preferences
  useEffect(() => {
    const savedVoiceLang = localStorage.getItem('vox_voicelang');
    if (savedVoiceLang) setVoiceLang(savedVoiceLang);
  }, []);

  // Load Consumption Data
  useEffect(() => {
    const saved = localStorage.getItem('aurabook_consumption');
    if (saved) {
      try {
        setConsumption(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Persist Consumption Data
  useEffect(() => {
    localStorage.setItem('aurabook_consumption', JSON.stringify(consumption));
  }, [consumption]);

  // Load Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('vox_theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Persist Theme
  useEffect(() => {
    localStorage.setItem('vox_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Stats calculation
  const stats = useMemo(() => {
    const text = sourceText || '';
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const charCount = text.length;
    const estTimeMinutes = Math.ceil(wordCount / 180); // Average reading speed
    return { wordCount, charCount, estTimeMinutes };
  }, [sourceText]);

  // Split text into chunks for translation API (max 500 chars for safety)
  const chunkText = (text: string, size: number) => {
    const chunks = [];
    for (let i = 0; i < text.length; i += size) {
      chunks.push(text.slice(i, i + size));
    }
    return chunks;
  };

  const updateConsumption = (usage: any, type: 'translation' | 'tts') => {
    if (!usage) return;
    
    const promptTokens = usage.promptTokenCount || 0;
    const candidateTokens = usage.candidatesTokenCount || 0;
    const total = promptTokens + candidateTokens;

    // Pricing (approximate for Flash models)
    // $0.00001875 per 1000 tokens for prompt (Flash 1.5 style)
    // Let's use a conservative estimate: $0.075 per 1M tokens
    const costIncrement = (total / 1000000) * 0.075;

    setConsumption(prev => ({
      ...prev,
      totalTokens: prev.totalTokens + total,
      promptTokens: prev.promptTokens + promptTokens,
      candidateTokens: prev.candidateTokens + candidateTokens,
      translationTokens: prev.translationTokens + (type === 'translation' ? total : 0),
      ttsTokens: prev.ttsTokens + (type === 'tts' ? total : 0),
      totalRequests: prev.totalRequests + 1,
      estimatedCost: prev.estimatedCost + costIncrement
    }));
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    
    setIsTranslating(true);
    // Only clear translation if we're not recording to allow progressive updates if needed
    setTranslatedText('');
    
    try {
      const targetLangName = SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;
      
      const result = await engine.translate(sourceText, targetLangName);

      // Track usage
      if (result.usageMetadata) {
        updateConsumption(result.usageMetadata, 'translation');
      }

      if (result.text) {
        setTranslatedText(result.text.trim());
      } else {
        throw new Error('Translation failed');
      }
    } catch (error) {
      console.error('Translation error:', error);
      alert('Translation failed. Please try again later.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleAiSpeak = async (text: string) => {
    setIsAiProcessing(true);
    setIsSpeaking(true);
    isSpeakingRequested.current = true;

    try {
      const result = await engine.tts(`Say this naturally in Arabic: ${text}`);

      // Track usage
      if (result.usageMetadata) {
        updateConsumption(result.usageMetadata, 'tts');
      }

      const base64Audio = result.audioBase64;
      if (!base64Audio) throw new Error("No audio data returned from AI");

      // Stop any existing audio
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
      }

      // Initialize AudioContext
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Gemini TTS returns 16-bit PCM at 24kHz
      const pcmData = new Int16Array(bytes.buffer);
      const audioBuffer = ctx.createBuffer(1, pcmData.length, 24000);
      const nowBuffering = audioBuffer.getChannelData(0);
      
      for (let i = 0; i < pcmData.length; i++) {
        nowBuffering[i] = pcmData[i] / 32768; // Convert to float between -1 and 1
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        setIsSpeaking(false);
        isSpeakingRequested.current = false;
        setIsAiProcessing(false);
      };

      audioSourceRef.current = source;
      source.start();
      setIsAiProcessing(false);
    } catch (err) {
      console.error("AI TTS Error:", err);
      alert("AI Voice Generation failed. Falling back to browser voice.");
      setIsAiProcessing(false);
      // Fallback to browser TTS
      isSpeakingRequested.current = false;
      handleSpeak();
    }
  };

  const handleSpeak = () => {
    if (!synth.current) {
      alert("Speech synthesis not supported in this browser.");
      return;
    }

    // Toggle logic
    if (isSpeakingRequested.current) {
      handleStop();
      return;
    }

    const rawText = (translatedText || sourceText).trim();
    if (!rawText) return;

    // Intelligence: If we have a translation and the target isn't English, 
    // we MUST use the translation. If we only have source, we use source.
    const useTranslation = targetLang !== 'en' && !!translatedText;
    const textToSpeak = useTranslation ? translatedText : sourceText;

    // AI VOICE GATE: If Arabic, use the high-quality Gemini TTS engine
    if (targetLang === 'ar' && useTranslation) {
       handleAiSpeak(textToSpeak);
       return;
    }
    
    // Set debug state to track what we're actually trying to speak
    setSpeakingLanguage(useTranslation ? targetLang : 'en');

    // Sanitize text for TTS (remove emojis or strange Unicode that can crash synthesis)
    const sanitizedText = textToSpeak.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}]/gu, '');

    // Reset synthesis state
    if (synth.current) synth.current.cancel();
    isSpeakingRequested.current = true;
    setIsSpeaking(true);

    // Improved sentence extraction including Arabic (؟) and other punctuation
    const chunks = sanitizedText.match(/[^.!?。？！؟]+[.!?。？！؟]*|[^.!?。？！؟]+/g) || [sanitizedText];
    let index = 0;

    const speak = () => {
      // Guard: Ensure we still want to speak, haven't finished, and synth is available
      if (!isSpeakingRequested.current || index >= chunks.length || !synth.current) {
        if (index >= chunks.length || !isSpeakingRequested.current) {
          handleStop();
        }
        return;
      }

      const chunk = chunks[index].trim();
      if (!chunk) {
        index++;
        speak();
        return;
      }

      try {
        const utterance = new SpeechSynthesisUtterance(chunk);
        utteranceRef.current = utterance;

        if (synth.current) synth.current.resume();

        const voices = window.speechSynthesis.getVoices();
        const target = targetLang.toLowerCase();
        
        // Match voice by language code or name keywords
        let voice = voices.find(v => v.lang.toLowerCase() === target) || 
                    voices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith(target)) ||
                    voices.find(v => v.lang.toLowerCase().startsWith(target));

        if (!voice && target === 'ar') {
           // Extreme fallback for Arabic code in the lang string
           voice = voices.find(v => v.lang.toLowerCase().includes('ar'));
        }

        if (!voice) {
          const keywords: Record<string, string[]> = {
            'ar': ['arabic', 'ar-sa', 'maged', 'laila', 'tarik', 'hoda', 'naayf', 'zeina', 'nizar', 'salma'],
            'zh': ['chinese', 'zh-cn', 'putonghua', 'huihui', 'yaoyao', 'kangkang'],
          };
          const list = keywords[target] || [target];
          for (const word of list) {
            voice = voices.find(v => v.name.toLowerCase().includes(word.toLowerCase()));
            if (voice) break;
          }
        }

        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        } else {
          utterance.lang = target === 'ar' ? 'ar-SA' : targetLang;
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          setProgress(((index + 1) / chunks.length) * 100);
        };

        utterance.onend = () => {
          index++;
          // Small delay (50ms) to ensure the current utterance is fully cleared
          setTimeout(() => {
            if (isSpeakingRequested.current) speak();
          }, 50);
        };

        utterance.onerror = (e: any) => {
          console.error("SpeechSynthesis Error:", e);
          if (e.error === 'interrupted') return;
          
          if (e.error === 'not-allowed') {
            alert("Audio playback blocked. Please click the page first.");
            handleStop();
            return;
          }

          index++;
          speak();
        };

        synth.current.speak(utterance);
      } catch (err) {
        console.error("Critical Speech Error:", err);
        handleStop();
      }
    };

    // CRITICAL: Call the first speak() IMMEDIATELY to preserve user gesture
    speak();
  };

  const handleStop = () => {
    isSpeakingRequested.current = false;
    setSpeakingLanguage(null);
    setIsAiProcessing(false);

    if (synth.current) {
      synth.current.cancel();
    }

    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {}
      audioSourceRef.current = null;
    }

    utteranceRef.current = null;
    setIsSpeaking(false);
    setProgress(0);
  };

  const handleDownloadText = (format: 'txt' | 'html' | 'json' = 'txt') => {
    let content = '';
    let fileName = `Vox_Export_${targetLang}_${Date.now()}`;
    let type = 'text/plain';

    if (format === 'json') {
      content = JSON.stringify({
        sourceText,
        translatedText,
        targetLang,
        timestamp: Date.now(),
        stats
      }, null, 2);
      fileName += '.json';
      type = 'application/json';
    } else if (format === 'html') {
      content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Vox Translation - ${targetLang}</title>
          <style>
            body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; background: #0f172a; color: #f8fafc; }
            section { background: #1e293b; padding: 30px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #334155; }
            h2 { color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px; margin-top: 0; }
            .meta { font-size: 12px; color: #94a3b8; margin-bottom: 20px; }
            pre { white-space: pre-wrap; font-family: inherit; }
            .rtl { direction: rtl; text-align: right; }
          </style>
        </head>
        <body>
          <div class="meta">Exported from Vox Premium on ${new Date().toLocaleString()}</div>
          <section>
            <h2>Original Text</h2>
            <pre>${sourceText}</pre>
          </section>
          <section class="${targetLang === 'ar' ? 'rtl' : ''}">
            <h2>Translation (${SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name})</h2>
            <pre>${translatedText}</pre>
          </section>
        </body>
        </html>
      `;
      fileName += '.html';
      type = 'text/html';
    } else {
      content = `ORIGINAL TEXT\n=============\n${sourceText}\n\nTRANSLATION (${targetLang})\n==========================\n${translatedText}`;
      fileName += '.txt';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const saveToLibrary = () => {
    if (!sourceText.trim()) return;
    
    const newProject: SavedProject = {
      id: Math.random().toString(36).substr(2, 9),
      title: sourceText.slice(0, 30).trim() + (sourceText.length > 30 ? '...' : ''),
      sourceText,
      translatedText,
      targetLang,
      timestamp: Date.now()
    };

    setLibrary([newProject, ...library]);
    alert("Saved to Library!");
  };

  const deleteFromLibrary = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLibrary(library.filter(p => p.id !== id));
  };

  const loadProject = (project: SavedProject) => {
    setSourceText(project.sourceText);
    setTranslatedText(project.translatedText);
    setTargetLang(project.targetLang);
    setActiveTab('workspace');
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setUploadProgress('Extracting content...');
    
    try {
      const base64Data = await fileToBase64(file);
      const mimeType = file.type || 'application/octet-stream';
      
      // Determine prompt based on file type
      let prompt = "Extract and transcribe all the text from this file exactly as it is. If it's an audio file, transcribe the speech.";
      if (file.type.includes('pdf') || file.type.includes('document')) {
        prompt = "Extract all text from this document. Maintain the logical order of paragraphs.";
      } else if (file.type.includes('audio')) {
        prompt = "Transcribe this audio file accurately. Include only the spoken text.";
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { data: base64Data, mimeType } }
          ]
        }
      });

      if (response.text) {
        setSourceText(response.text);
      } else {
        throw new Error('No text extracted');
      }
    } catch (error) {
      console.error('File processing error:', error);
      alert('Failed to process file. Make sure it is a supported audio or document format.');
    } finally {
      setIsProcessingFile(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopy = () => {
    const text = translatedText || sourceText;
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const clearAll = () => {
    if (window.confirm('Clear all text and translations?')) {
      setSourceText('');
      setTranslatedText('');
      handleStop();
    }
  };

  const toggleMic = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    // Use selected voice language recCode
    const selectedLang = SUPPORTED_LANGUAGES.find(l => l.code === voiceLang);
    recognition.lang = selectedLang?.recCode || 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setSourceText(prev => (prev ? prev + ' ' : '') + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
      if (event.error === 'not-allowed') {
        alert("Microphone access was denied.");
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 max-w-[1500px] mx-auto gap-6 transition-all duration-300">
      {/* Premium Navigation */}
      <header className="flex justify-between items-center bg-panel/30 p-2 pl-4 pr-4 rounded-2xl border border-border/40 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter flex items-center gap-2 group cursor-default">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-neon-blue group-hover:to-neon-purple transition-all duration-700">VOX</span> 
              <span className="bg-accent text-[10px] px-2 py-0.5 rounded-full text-black font-black tracking-widest uppercase shadow-[0_0_15px_rgba(0,255,170,0.4)]">Premium</span>
              {!isRealAiActive() && (
                <span className="text-[8px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-text-dim font-bold tracking-widest uppercase ml-1">Sandbox</span>
              )}
            </h1>
          </div>
          
          <nav className="flex gap-1">
            {[
              { id: 'workspace', icon: Globe, label: t.studio, color: 'text-accent' },
              { id: 'library', icon: LibraryIcon, label: t.library, color: 'text-neon-blue' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative overflow-hidden group ${activeTab === tab.id ? 'text-white' : 'text-text-dim hover:text-white'}`}
              >
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="nav-bg"
                    className="absolute inset-0 bg-white/5 border border-white/10"
                    style={{ borderRadius: '12px' }}
                  />
                )}
                <tab.icon size={14} className={`relative z-10 ${activeTab === tab.id ? tab.color : 'text-current opacity-60'}`} />
                <span className="hidden sm:inline relative z-10">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              const langs: UILang[] = ['en', 'ar', 'es', 'fr'];
              const nextIndex = (langs.indexOf(uiLang) + 1) % langs.length;
              setUiLang(langs[nextIndex]);
            }}
            className="px-3 h-10 flex items-center justify-center rounded-xl bg-panel border border-border/40 hover:border-accent transition-all text-text-dim hover:text-white gap-2"
            title="Switch UI Language"
          >
            <Languages size={18} className="text-accent" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{uiLang}</span>
          </button>

          <div className="hidden lg:flex gap-4 border-r border-border/40 pr-6 mr-2 ml-2">
            <div className="text-right">
              <span className="text-[10px] block font-black text-text-dim uppercase tracking-wider opacity-60">{t.sessionMetrics}</span>
              <span className="text-xs font-black bg-clip-text text-transparent bg-gradient-to-r from-accent to-neon-blue">{stats.wordCount} <span className="text-text-dim font-bold opacity-40 italic uppercase">{t.words}</span></span>
            </div>
          </div>
          
          <button 
            onClick={() => setShowConsumptionMatrix(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-panel border border-border/40 hover:border-accent transition-all text-text-dim hover:text-white"
            title="Consumption Matrix"
          >
            <FileCode size={18} />
          </button>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-panel border border-border/40 hover:border-accent transition-all text-text-dim hover:text-white"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Hero / Slogan Section */}
      <AnimatePresence mode="wait">
        {activeTab === 'workspace' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center text-center gap-2 mb-2"
          >
            <h2 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-accent via-neon-blue to-accent animate-gradient">
              {t.sloganMain}
            </h2>
            <p className="text-sm text-text-dim max-w-2xl font-medium">
              {t.sloganSub}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'library' ? (
            <motion.div 
              key="library"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{t.yourLibrary}</h2>
                  <p className="text-sm text-text-dim">{t.libraryDesc}</p>
                </div>
                <div className="flex gap-2">
                  <div className="bg-panel px-4 py-2 rounded-xl border border-border/40 text-[10px] font-bold uppercase tracking-widest text-text-dim">
                    {library.length} {t.projectsSaved}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {library.length === 0 ? (
                  <div className="col-span-full py-24 flex flex-col items-center justify-center border-2 border-dashed border-border/40 rounded-3xl opacity-40 italic">
                    <History size={48} className="mb-4" />
                    <p>{t.noProjects}</p>
                  </div>
                ) : (
                  library.map(project => (
                    <motion.div 
                      key={project.id}
                      whileHover={{ y: -4 }}
                      onClick={() => loadProject(project)}
                      className="group bg-panel border border-border/40 p-5 rounded-2xl cursor-pointer hover:border-accent/50 transition-all shadow-xl hover:shadow-accent/5"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="bg-accent/10 text-accent text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                          {SUPPORTED_LANGUAGES.find(l => l.code === project.targetLang)?.name}
                        </div>
                        <button 
                          onClick={(e) => deleteFromLibrary(project.id, e)}
                          className="p-1.5 rounded-lg text-text-dim hover:bg-red-500/20 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <h3 className="font-bold text-lg mb-2 line-clamp-1">{project.title}</h3>
                      <p className="text-xs text-text-dim line-clamp-2 mb-4 opacity-70 leading-relaxed font-medium">
                        {project.translatedText || project.sourceText}
                      </p>
                      <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/10">
                        <span className="text-[10px] text-text-dim font-bold uppercase">
                          {new Date(project.timestamp).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1.5 text-accent text-[10px] font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
                          {t.openProject} <ChevronRight size={14} />
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="workspace"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-6 h-full"
            >
              <div className="flex flex-col gap-6 overflow-hidden min-h-[600px] lg:h-full">
                {/* Enhanced Workspace Panels */}
                <div className="flex-1 flex flex-col gap-3 min-h-0">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim flex items-center gap-2">
                       {t.source} <span className="opacity-40 tracking-normal font-normal">/ {t.extraction}</span>
                    </label>
                    <div className="flex gap-2 items-center">
                      <div className="hidden lg:flex flex-col items-end mr-2">
                        <span className="text-[9px] font-black text-accent uppercase tracking-[0.15em] opacity-80">{t.sloganVoice}</span>
                      </div>
                      
                      <div className="relative group/lang">
                        <select 
                          value={voiceLang}
                          onChange={(e) => setVoiceLang(e.target.value)}
                          className="appearance-none bg-panel border border-border/40 text-[10px] font-bold uppercase tracking-wider pl-3 pr-8 py-1.5 rounded-lg hover:border-accent/50 transition-all cursor-pointer focus:outline-none focus:border-accent"
                        >
                          {SUPPORTED_LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                          ))}
                        </select>
                        <ChevronRight size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-text-dim pointer-events-none group-hover/lang:text-accent transition-colors" />
                      </div>

                      <button 
                        onClick={toggleMic}
                        className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all flex items-center gap-2 ${isRecording ? 'bg-red-500 border-red-500 text-white animate-pulse shadow-lg shadow-red-500/20' : 'text-text-dim border-border/40 hover:bg-white/5'}`}
                      >
                        <Mic size={12} className={isRecording ? 'animate-bounce' : ''} />
                        {isRecording 
                          ? `${t.recording} (${SUPPORTED_LANGUAGES.find(l => l.code === voiceLang)?.name})` 
                          : t.capture}
                      </button>

                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessingFile}
                        className="text-[10px] font-bold uppercase tracking-wider text-accent border border-accent/20 px-3 py-1.5 rounded-lg hover:bg-accent/10 transition-all flex items-center gap-2"
                      >
                        {isProcessingFile ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                        {isProcessingFile ? uploadProgress : t.import}
                      </button>
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".mp3,.wav,.pdf,.docx,.txt" />
                    </div>
                  </div>
                  
                  <div className="relative flex-1 group">
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Paste text or import an audio/doc file for AI extraction..."
              dir="auto"
              className="w-full h-full p-8 rounded-3xl border-2 border-border/40 bg-panel/20 shadow-2xl text-base lg:text-lg focus:border-accent/40 focus:bg-panel/40 transition-all resize-none"
            />
                    {!sourceText && !isProcessingFile && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-10 gap-4 p-8 text-center">
                        <Mic size={64} />
                        <p className="text-sm font-bold uppercase tracking-[0.4em]">{t.awaitingInput}</p>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-medium max-w-xs">{t.sloganVoice}</p>
                      </div>
                    )}
                    {isProcessingFile && (
                      <div className="absolute inset-0 bg-panel/90 backdrop-blur-md flex flex-col items-center justify-center rounded-3xl z-20">
                         <Loader2 className="animate-spin text-accent w-12 h-12 mb-6" />
                         <p className="font-black uppercase tracking-[0.3em] text-accent text-sm animate-pulse">{uploadProgress}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-3 min-h-0 relative">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim flex items-center gap-2">
                       {t.output} <span className="opacity-40 tracking-normal font-normal">/ {t.aiTranslation}</span>
                    </label>
                    {translatedText && (
                      <div className="flex gap-2">
                        <button onClick={saveToLibrary} className="flex h-8 px-4 items-center gap-2 rounded-lg bg-white/5 border border-border/40 text-[10px] font-bold uppercase hover:bg-accent/10 hover:text-accent transition-all">
                          <Plus size={12} /> Save Project
                        </button>
                        <div className="relative">
                          <button 
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex h-8 px-4 items-center gap-2 rounded-lg bg-accent text-white text-[10px] font-bold uppercase hover:shadow-lg hover:shadow-accent/20 transition-all"
                          >
                            <Download size={12} /> Export
                          </button>
                          {showExportMenu && (
                            <div className="absolute bottom-full right-0 mb-2 w-48 bg-panel border border-border rounded-xl shadow-2xl p-2 z-50">
                               {[
                                 { id: 'txt', label: 'Plain Text (.txt)', icon: FileText },
                                 { id: 'html', label: 'Formatted Doc (.html)', icon: Globe },
                                 { id: 'json', label: 'Project Data (.json)', icon: FileCode },
                               ].map(opt => (
                                 <button 
                                   key={opt.id}
                                   onClick={() => handleDownloadText(opt.id as any)}
                                   className="w-full text-left p-2.5 rounded-lg hover:bg-white/5 text-[11px] font-bold flex items-center gap-2"
                                 >
                                   <opt.icon size={14} className="text-accent" /> {opt.label}
                                 </button>
                               ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className={`p-8 rounded-3xl border-2 border-border/40 bg-panel/30 shadow-2xl flex-1 overflow-y-auto relative ${!translatedText && 'flex items-center justify-center italic opacity-30 text-sm'}`}>
                    <AnimatePresence mode="wait">
                      {isTranslating ? (
                        <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
                           <div className="flex gap-2">
                              {[0, 1, 2, 3].map(i => <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} className="w-2 h-2 rounded-full bg-accent" />)}
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Translating Sequence...</span>
                        </motion.div>
                      ) : (
                        <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} dir="auto" className="text-lg leading-relaxed font-medium">
                          {translatedText || t.placeholderOutput}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isSpeaking && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
                        <motion.div 
                          className="h-full bg-accent shadow-[0_0_20px_white]"
                          animate={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Advanced Sidebar */}
              <aside className="flex flex-col gap-6">
                <div className="bg-panel/40 backdrop-blur-xl border border-border/40 rounded-[2rem] p-8 shadow-2xl flex flex-col gap-8 h-full">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim mb-4 block">{t.targetEngine}</label>
                    <div className="grid grid-cols-1 gap-2">
                      <select 
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="w-full bg-bg border-2 border-border/40 p-4 rounded-2xl font-bold text-sm outline-none focus:border-accent transition-all appearance-none cursor-pointer"
                      >
                        {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                      </select>
                      
                      <button 
                        onClick={handleTranslate}
                        disabled={isTranslating || !sourceText}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${isTranslating || !sourceText ? 'bg-border/40 text-text-dim cursor-not-allowed' : 'bg-accent text-white hover:shadow-[0_20px_50px_rgba(99,102,241,0.3)] hover:-translate-y-1'}`}
                      >
                        {isTranslating ? <Loader2 className="animate-spin" size={16} /> : <Languages size={16} />}
                        {isTranslating ? t.processing : t.translate}
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-border/20" />

                  <div>
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim mb-4 block">{t.playbackHub}</label>
                     <button 
                        onClick={handleSpeak}
                        disabled={isTranslating || (!sourceText && !translatedText)}
                        className={`w-full py-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center gap-3 ${isSpeaking ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-accent/5 border-accent/20 text-accent hover:bg-accent/10'}`}
                     >
                        <div className={`p-4 rounded-full ${isSpeaking ? 'bg-red-500 text-white' : 'bg-accent text-white'}`}>
                          {isSpeaking ? <X size={24} /> : <Volume2 size={24} />}
                        </div>
                        <span className="font-black text-xs uppercase tracking-tighter">{isAiProcessing ? t.aiVoiceGen : (isSpeaking ? `${t.ttsSpeaking} ${SUPPORTED_LANGUAGES.find(l => l.code === (speakingLanguage || targetLang))?.name}` : t.tts)}</span>
                     </button>
                  </div>

                  <div className="mt-auto">
                    <div className="bg-bg/50 p-4 rounded-2xl border border-border/40">
                       <div className="flex items-center gap-3 mb-4">
                          <History size={16} className="text-text-dim" />
                          <span className="text-[10px] font-black uppercase text-text-dim tracking-widest">{t.history}</span>
                       </div>
                       <div className="space-y-2">
                          {library.slice(0, 3).map(p => (
                            <button 
                              key={p.id} 
                              onClick={() => loadProject(p)}
                              className="w-full text-left p-2 rounded-lg text-[10px] font-bold text-text-dim hover:bg-white/5 truncate"
                            >
                              • {p.title}
                            </button>
                          ))}
                          {library.length > 3 && (
                            <button onClick={() => setActiveTab('library')} className="text-[10px] font-bold text-accent px-2">Show {library.length - 3} more...</button>
                          )}
                       </div>
                    </div>
                  </div>
                </div>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="footer flex justify-between items-center text-[10px] text-text-dim font-bold uppercase tracking-widest border-t border-border/20 py-4">
         <div className="flex gap-6">
            <span>© 2026 Vox Premium</span>
            <span className="text-accent/50 opacity-40">●</span>
            <span className="text-accent underline cursor-pointer">Security Protocol Active</span>
         </div>
         <div className="hidden sm:block">Session Status: <span className="text-text">Encrypted & Local</span></div>
      </footer>

      <AnimatePresence>
        {showConsumptionMatrix && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowConsumptionMatrix(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-panel border border-border/40 p-10 rounded-[2.5rem] max-w-4xl w-full shadow-2xl relative overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-10"
              onClick={e => e.stopPropagation()}
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 blur-[120px] rounded-full -mr-48 -mt-48 transition-all duration-700" />
              
              <div className="relative z-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                     <FileCode size={32} className="text-accent" />
                     <h2 className="text-4xl font-black tracking-tighter">{t.matrix}</h2>
                  </div>
                  <p className="text-text-dim text-sm leading-relaxed mb-8">
                     {t.matrixDesc}
                  </p>

                  <div className="space-y-4">
                     <div className="bg-bg/40 p-5 rounded-2xl border border-border/10">
                        <span className="text-[10px] font-black uppercase text-text-dim block mb-1">{t.cost}</span>
                        <span className="text-3xl font-black text-white">${consumption.estimatedCost.toFixed(4)} <span className="text-sm font-medium text-text-dim uppercase tracking-widest ml-1">USD</span></span>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-bg/40 p-5 rounded-2xl border border-border/10">
                           <span className="text-[10px] font-black uppercase text-text-dim block mb-1">{t.requests}</span>
                           <span className="text-2xl font-black text-white">{consumption.totalRequests}</span>
                        </div>
                        <div className="bg-bg/40 p-5 rounded-2xl border border-border/10">
                           <span className="text-[10px] font-black uppercase text-text-dim block mb-1">{t.tokens}</span>
                           <span className="text-2xl font-black text-white">{(consumption.totalTokens / 1000).toFixed(1)}k</span>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="mt-12 flex gap-4">
                  <button 
                    onClick={() => setConsumption({
                      totalTokens: 0,
                      promptTokens: 0,
                      candidateTokens: 0,
                      translationTokens: 0,
                      ttsTokens: 0,
                      totalRequests: 0,
                      estimatedCost: 0
                    })}
                    className="px-6 py-3 rounded-xl border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-tighter hover:bg-red-500/10 transition-all flex items-center gap-2"
                  >
                    <Trash2 size={14} /> {t.reset}
                  </button>
                  <button 
                    onClick={() => setShowConsumptionMatrix(false)}
                    className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-tighter hover:bg-white/10 transition-all flex-1"
                  >
                    {t.close}
                  </button>
                </div>
              </div>

              <div className="relative z-10 flex flex-col gap-6">
                 <div className="bg-white/5 rounded-3xl p-6 border border-white/5 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                       <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">{t.operationalBreakdown}</span>
                       <div className="w-10 h-px bg-border/20" />
                    </div>

                    <div className="space-y-8 flex-1">
                       {/* Translation Metrics */}
                       <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                             <span>Translation Services</span>
                             <span className="text-neon-blue">{((consumption.translationTokens / consumption.totalTokens) * 100 || 0).toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${(consumption.translationTokens / consumption.totalTokens) * 100 || 0}%` }}
                               className="h-full bg-neon-blue" 
                             />
                          </div>
                          <div className="flex justify-between text-[8px] font-bold text-text-dim tracking-widest uppercase">
                             <span>Scan Volume</span>
                             <span>{consumption.translationTokens.toLocaleString()} tokens</span>
                          </div>
                       </div>

                       {/* TTS Metrics */}
                       <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                             <span>Speech Synthesis</span>
                             <span className="text-neon-purple">{((consumption.ttsTokens / consumption.totalTokens) * 100 || 0).toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${(consumption.ttsTokens / consumption.totalTokens) * 100 || 0}%` }}
                               className="h-full bg-neon-purple" 
                             />
                          </div>
                          <div className="flex justify-between text-[8px] font-bold text-text-dim tracking-widest uppercase">
                             <span>Scan Volume</span>
                             <span>{consumption.ttsTokens.toLocaleString()} tokens</span>
                          </div>
                       </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-3 text-emerald-400">
                         <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                         <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.nominal}</span>
                      </div>
                      <p className="text-[9px] text-text-dim mt-2 leading-relaxed opacity-60">
                         {t.systemDesc}
                      </p>
                    </div>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
