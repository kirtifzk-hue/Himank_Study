import { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, BookText, Volume2, VolumeX, Moon, Sun, Loader2, ChevronRight, CheckCircle2, XCircle, LayoutGrid, GraduationCap } from 'lucide-react';

const NCERT_DATA = {
  Subjects: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi'],
  Languages: ['English', 'Hindi'],
  Books: {
    Mathematics: { English: ['Mathematics'], Hindi: ['Ganit'] },
    Science: { English: ['Science'], Hindi: ['Vigyan'] },
    'Social Science': { 
      English: ['India and the Contemporary World - I (History)', 'Contemporary India - I (Geography)', 'Democratic Politics - I (Civics)', 'Economics'], 
      Hindi: ['Bharat Aur Samkalin Vishwa - I', 'Samkalin Bharat - I', 'Loktantrik Rajniti - I', 'Arthashastra'] 
    },
    English: { English: ['Beehive', 'Moments', 'Words and Expressions - I'], Hindi: [] },
    Hindi: { English: [], Hindi: ['Kshitij', 'Kritika', 'Sparsh', 'Sanchayan'] }
  },
  Activities: [
    { id: 'summary', name: 'Concept Summary' },
    { id: 'mcq', name: 'Multiple Choice Questions (MCQ)' },
    { id: 'fill_blank', name: 'Fill in the Blanks' },
    { id: 'qa', name: 'Important Q/A' }
  ]
};

const CHAPTERS = Array.from({length: 15}, (_, i) => `Chapter ${i + 1}`);

// Define typescript interfaces for our schema
interface Question {
  questionText: string;
  type: 'mcq' | 'fill_blank' | 'qa';
  options?: string[];
  answer: string;
  explanation: string;
}

interface ActivityContent {
  title: string;
  content?: string;
  questions?: Question[];
}

function ContentDisplay({ content, activity, language }: { content: ActivityContent, activity: string, language: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  const [fillInputs, setFillInputs] = useState<Record<number, string>>({});

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'Hindi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.9;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="flex flex-col flex-1 h-full relative space-y-12">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <h2 className="text-[24px] md:text-[36px] font-[700] text-slate-900 dark:text-[#F8FAFC] leading-[1.3]">{content.title}</h2>
        <button 
           onClick={() => speaking ? stopSpeaking() : speak(content.title + ". " + (content.content || ""))}
           className={`bg-blue-50 dark:bg-[#38BDF8]/10 border border-blue-500 dark:border-[#38BDF8] text-blue-600 dark:text-[#38BDF8] px-[16px] py-[10px] md:px-[20px] rounded-[12px] flex items-center gap-[8px] font-[600] text-[12px] md:text-[14px] cursor-pointer transition-colors ${speaking ? 'opacity-80' : 'hover:bg-blue-100 dark:hover:bg-[#38BDF8]/20'}`}
        >
          {speaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          <span className="hidden sm:inline">{speaking ? "STOP SPEAKING" : "SPEAK CONTENT"}</span>
          <span className="sm:hidden">{speaking ? "STOP" : "SPEAK"}</span>
        </button>
      </div>

      {content.content && (
        <div className="text-[16px] md:text-[20px] leading-relaxed text-slate-900 dark:text-[#F8FAFC] opacity-90 space-y-6">
           {content.content.split('\\n').map((para, i) => (
             <p key={i}>{para}</p>
           ))}
        </div>
      )}

      {content.questions && content.questions.length > 0 && (
         <div className="space-y-16">
            {content.questions.map((q, idx) => (
                <div key={idx} className="relative flex flex-col gap-6 md:gap-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1 md:gap-2">
                       <span className="text-slate-500 dark:text-[#94A3B8] font-bold text-[14px] md:text-[16px] tracking-[1px] uppercase">
                          Question {String(idx + 1).padStart(2, '0')} of {String(content.questions?.length).padStart(2, '0')}
                       </span>
                       <h3 className="text-[20px] md:text-[36px] leading-[1.3] font-[700]">{q.questionText}</h3>
                    </div>
                    <button 
                      onClick={() => speak(q.questionText + ". " + (q.options ? q.options.join(", ") : ""))}
                      className="bg-blue-50 dark:bg-[#38BDF8]/10 border border-blue-500 dark:border-[#38BDF8] text-blue-600 dark:text-[#38BDF8] p-[10px] rounded-[12px] flex items-center justify-center shrink-0 hover:bg-blue-100 dark:hover:bg-[#38BDF8]/20 transition-colors"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  {q.type === 'mcq' && q.options && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                       {q.options.map((opt, oIdx) => {
                          const isSelected = selectedOptions[idx] === opt;
                          const isCorrect = showAnswers[idx] && opt === q.answer;
                          const isIncorrect = showAnswers[idx] && isSelected && !isCorrect;
                          
                          let btnClass = "bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] hover:border-blue-500 dark:border-[#38BDF8] hover:bg-blue-50 dark:hover:bg-[#38BDF8]/5";
                          if (isCorrect) btnClass = "bg-green-600 dark:bg-green-50 dark:bg-[#22C55E]/10 border-green-500 dark:border-[#22C55E] text-green-700 dark:text-[#22C55E]";
                          else if (isIncorrect) btnClass = "bg-red-50 dark:bg-red-500/10 border-red-500 dark:border-red-600 text-red-600 dark:text-red-400";
                          else if (isSelected) btnClass = "bg-blue-50 dark:bg-[#38BDF8]/10 border-blue-500 dark:border-[#38BDF8] text-blue-600 dark:text-[#38BDF8]";

                          return (
                            <button
                               key={oIdx}
                               onClick={() => !showAnswers[idx] && setSelectedOptions(prev => ({...prev, [idx]: opt}))}
                               className={`border-2 p-[16px] md:p-[24px] rounded-[16px] text-[16px] md:text-[20px] font-[500] cursor-pointer transition-all flex items-center gap-[12px] md:gap-[16px] text-left ${btnClass}`}
                            >
                               <div className={`w-[24px] h-[24px] md:w-[28px] md:h-[28px] border-2 rounded-full shrink-0 flex items-center justify-center ${isCorrect ? 'border-green-500 dark:border-[#22C55E] bg-green-600 dark:bg-[#22C55E]' : (isIncorrect ? 'border-red-500 dark:border-red-600 bg-red-500' : 'border-slate-200 dark:border-[#334155]')}`}>
                                 {isCorrect && <CheckCircle2 className="w-4 h-4 text-white dark:text-[#F8FAFC]" />}
                                 {isIncorrect && <XCircle className="w-4 h-4 text-white dark:text-[#F8FAFC]" />}
                               </div>
                               <span>{opt}</span>
                            </button>
                          )
                       })}
                     </div>
                  )}

                  {q.type === 'fill_blank' && !showAnswers[idx] && (
                     <div className="flex gap-4">
                        <input 
                           type="text" 
                           value={fillInputs[idx] || ''}
                           onChange={e => setFillInputs(prev => ({...prev, [idx]: e.target.value}))}
                           placeholder="Type your answer..."
                           className="flex-1 w-full bg-slate-50 dark:bg-[#0F172A] border-2 border-slate-200 dark:border-[#334155] rounded-[16px] p-[16px] md:p-[24px] text-[16px] md:text-[20px] text-slate-900 dark:text-[#F8FAFC] focus:border-blue-500 dark:focus:border-blue-500 dark:border-[#38BDF8] outline-none"
                        />
                     </div>
                  )}

                  {(q.type === 'mcq' || q.type === 'fill_blank') && !showAnswers[idx] && (
                     <div className="flex justify-start mt-2">
                         <button 
                           onClick={() => setShowAnswers(prev => ({...prev, [idx]: true}))}
                           className="w-full md:w-auto bg-transparent border-2 border-slate-200 dark:border-[#334155] hover:border-blue-500 dark:border-[#38BDF8] hover:text-blue-600 dark:text-[#38BDF8] text-slate-500 dark:text-[#94A3B8] px-[24px] py-[12px] md:px-[32px] md:py-[14px] rounded-[12px] text-[16px] md:text-[18px] font-[700] cursor-pointer transition-all"
                         >
                           Check Answer
                         </button>
                     </div>
                  )}

                  {(q.type === 'qa' || showAnswers[idx]) && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       className="mt-4 p-[16px] md:p-[24px] bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-[16px] space-y-4"
                     >
                        <div className="flex items-center gap-2 md:gap-3 font-[600] text-blue-600 dark:text-[#38BDF8] text-[16px] md:text-[20px]">
                          <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 shrink-0" /> 
                          {q.type === 'qa' ? 'Answer :' : 'Correct Answer :'} <span className="text-slate-900 dark:text-[#F8FAFC]">{q.answer}</span>
                        </div>
                        {q.explanation && (
                          <div className="text-slate-500 dark:text-[#94A3B8] text-[16px] md:text-[18px] leading-relaxed mt-2 border-t border-slate-200 dark:border-[#334155] pt-4">
                             <span className="font-[600] block mb-2 text-slate-900 dark:text-[#F8FAFC]">Explanation:</span>
                             {q.explanation}
                          </div>
                        )}
                        <button
                           onClick={() => speak(q.answer + ". " + (q.explanation || ""))}
                           className="flex items-center gap-2 text-blue-600 dark:text-[#38BDF8] mt-4 hover:underline font-[600] text-[16px] cursor-pointer"
                        >
                           <Volume2 className="w-5 h-5" /> Listen to Explanation
                        </button>
                     </motion.div>
                  )}

                  {q.type === 'qa' && !showAnswers[idx] && (
                     <div className="flex justify-start mt-2">
                       <button 
                         onClick={() => setShowAnswers(prev => ({...prev, [idx]: true}))}
                         className="w-full md:w-auto bg-green-600 dark:bg-[#22C55E] text-white dark:text-[#F8FAFC] px-[24px] py-[12px] md:px-[32px] md:py-[14px] rounded-[12px] text-[16px] md:text-[18px] font-[700] shadow-[0_4px_14px_rgba(34,197,94,0.4)] cursor-pointer border-none"
                       >
                         View Answer
                       </button>
                     </div>
                  )}
               </div>
            ))}
         </div>
      )}
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Form State
  const [subject, setSubject] = useState(NCERT_DATA.Subjects[0]);
  const [language, setLanguage] = useState(NCERT_DATA.Languages[0]);
  const [book, setBook] = useState('');
  const [chapter, setChapter] = useState(CHAPTERS[0]);
  const [activity, setActivity] = useState(NCERT_DATA.Activities[0].id);

  // App State
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<ActivityContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async () => {
    if (!book) {
      setError("Please select a book first.");
      return;
    }
    setLoading(true);
    setError(null);
    setContent(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are an expert tutor for CBSE/NCERT Class 9 students. 
Activity: ${activity} - ${NCERT_DATA.Activities.find(a => a.id === activity)?.name}
Subject: ${subject}
Language: ${language}
Book: ${book}
Chapter: ${chapter}

Generate educational content for the above selection. Use the appropriate language (${language}). 
Ensure questions are highly engaging and appropriate for a 14-15 year old student. 
If the activity is 'summary', provide a structured and detailed summary (approx 300-400 words) in the 'content' field.
If the activity is 'mcq', generate 5 multiple choice questions.
If it is 'fill_blank', generate 5 fill in the blank questions.
If it is 'qa', generate 3 important question and answers.

IMPORTANT: Ensure your response is strictly valid JSON without endless looping or trailing characters. Keep the text concise to avoid truncation.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING, description: "Detailed summary or explanation if activity is Concept Summary. Limit to 500 words." },
          questions: {
            type: Type.ARRAY,
            description: "List of questions for MCQ, Fill in the Blanks, or Important Q/A. Do not use this for summary.",
            items: {
              type: Type.OBJECT,
              properties: {
                questionText: { type: Type.STRING },
                type: { type: Type.STRING, description: "'mcq', 'fill_blank', 'qa'" },
                options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of exactly 4 string options if type is 'mcq'" },
                answer: { type: Type.STRING, description: "Correct answer or text to fill in the blank. For 'qa' put the answer here." },
                explanation: { type: Type.STRING, description: "Explanation of the answer" }
              }
            }
          }
        }
      };

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", // Changed back to standard flash for stability and speed
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        }
      });

      let jsonStr = response.text?.trim() || "{}";
      // Ensure we strip any markdown wrappers just in case the model ignored responseMimeType
      if (jsonStr.startsWith('```json')) {
         jsonStr = jsonStr.substring(7);
      }
      if (jsonStr.endsWith('```')) {
         jsonStr = jsonStr.substring(0, jsonStr.length - 3);
      }
      jsonStr = jsonStr.trim();
      
      const parsed = JSON.parse(jsonStr) as ActivityContent;
      setContent(parsed);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while generating content.');
    } finally {
      setLoading(false);
    }
  };

  // Apply dark mode
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Update book selection when subject or language changes
  useEffect(() => {
    const availableBooks = (NCERT_DATA.Books as any)[subject]?.[language] || [];
    if (availableBooks.length > 0) {
      setBook(availableBooks[0]);
    } else {
      setBook('');
    }
  }, [subject, language]);

  // Auto-scroll to content view on mobile
  useEffect(() => {
    if ((loading || content) && window.innerWidth < 1024 && scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading, content]);

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] transition-colors duration-300 antialiased flex flex-col`} style={{ fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      <header className="h-[80px] px-4 md:px-10 flex items-center border-b border-slate-200 dark:border-[#334155] bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-10 transition-all">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-2 md:gap-3 text-blue-600 dark:text-[#38BDF8]">
             <GraduationCap className="w-6 h-6 md:w-8 md:h-8 shrink-0" />
             <h1 className="text-[20px] md:text-[28px] font-[800] tracking-[-1px]">Class 9 NCERT Tutor</h1>
          </div>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-3 rounded-full text-slate-500 dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-[#1E293B] transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1200px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
         {/* Form UI */}
         <div className="flex flex-col">
            <div className="bg-white dark:bg-[#1E293B] p-5 md:p-8 rounded-[24px] border border-slate-200 dark:border-[#334155] flex flex-col gap-4 md:gap-6 h-auto">
               <h2 className="md:hidden text-xl font-semibold flex items-center gap-2 text-blue-600 dark:text-[#38BDF8]">
                 <LayoutGrid className="w-5 h-5 text-blue-600 dark:text-[#38BDF8]" /> Lesson Setup
               </h2>

               <div className="space-y-4 md:space-y-6">
                 <div className="flex flex-col gap-[8px] md:gap-[10px]">
                   <label className="text-[12px] md:text-[14px] font-[600] text-blue-600 dark:text-[#38BDF8] uppercase tracking-[1px]">Subject</label>
                   <select 
                     value={subject} 
                     onChange={e => setSubject(e.target.value)}
                     className="bg-slate-50 dark:bg-[#0F172A] border-2 border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] p-[12px] md:p-[14px] rounded-[12px] text-[16px] md:text-[18px] cursor-pointer outline-none transition-colors focus:border-blue-500 dark:focus:border-blue-500 dark:border-[#38BDF8] w-full"
                   >
                     {NCERT_DATA.Subjects.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                 </div>

                 <div className="flex flex-col gap-[8px] md:gap-[10px]">
                   <label className="text-[12px] md:text-[14px] font-[600] text-blue-600 dark:text-[#38BDF8] uppercase tracking-[1px]">Language</label>
                   <select 
                     value={language} 
                     onChange={e => setLanguage(e.target.value)}
                     className="bg-slate-50 dark:bg-[#0F172A] border-2 border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] p-[12px] md:p-[14px] rounded-[12px] text-[16px] md:text-[18px] cursor-pointer outline-none transition-colors focus:border-blue-500 dark:focus:border-blue-500 dark:border-[#38BDF8] w-full"
                   >
                     {NCERT_DATA.Languages.map(l => <option key={l} value={l}>{l}</option>)}
                   </select>
                 </div>

                 <div className="flex flex-col gap-[8px] md:gap-[10px]">
                   <label className="text-[12px] md:text-[14px] font-[600] text-blue-600 dark:text-[#38BDF8] uppercase tracking-[1px]">Book Name</label>
                   <select 
                     value={book} 
                     onChange={e => setBook(e.target.value)}
                     className="bg-slate-50 dark:bg-[#0F172A] border-2 border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] p-[12px] md:p-[14px] rounded-[12px] text-[16px] md:text-[18px] cursor-pointer outline-none transition-colors focus:border-blue-500 dark:focus:border-blue-500 dark:border-[#38BDF8] w-full"
                     disabled={!book}
                   >
                     {((NCERT_DATA.Books as any)[subject]?.[language] || []).map((b: string) => <option key={b} value={b}>{b}</option>)}
                     {!book && <option value="">No Book Available</option>}
                   </select>
                 </div>

                 <div className="flex flex-col gap-[8px] md:gap-[10px]">
                   <label className="text-[12px] md:text-[14px] font-[600] text-blue-600 dark:text-[#38BDF8] uppercase tracking-[1px]">Chapter</label>
                   <select 
                     value={chapter} 
                     onChange={e => setChapter(e.target.value)}
                     className="bg-slate-50 dark:bg-[#0F172A] border-2 border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] p-[12px] md:p-[14px] rounded-[12px] text-[16px] md:text-[18px] cursor-pointer outline-none transition-colors focus:border-blue-500 dark:focus:border-blue-500 dark:border-[#38BDF8] w-full"
                   >
                     {CHAPTERS.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                 </div>

                 <div className="flex flex-col gap-[8px] md:gap-[10px]">
                   <label className="text-[12px] md:text-[14px] font-[600] text-blue-600 dark:text-[#38BDF8] uppercase tracking-[1px]">Activity Type</label>
                   <select 
                     value={activity} 
                     onChange={e => setActivity(e.target.value)}
                     className="bg-slate-50 dark:bg-[#0F172A] border-2 border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] p-[12px] md:p-[14px] rounded-[12px] text-[16px] md:text-[18px] cursor-pointer outline-none transition-colors focus:border-blue-500 dark:focus:border-blue-500 dark:border-[#38BDF8] w-full"
                   >
                     {NCERT_DATA.Activities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                   </select>
                 </div>

                 <button
                   onClick={generateContent}
                   disabled={loading || !book}
                   className="w-full bg-green-600 dark:bg-[#22C55E] text-white dark:text-[#F8FAFC] font-[700] py-[14px] px-[24px] md:px-[32px] rounded-[12px] text-[16px] md:text-[18px] border-none cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(34,197,94,0.4)] disabled:opacity-75 disabled:shadow-none disabled:cursor-not-allowed mt-2"
                 >
                   {loading ? (
                     <><Loader2 className="w-6 h-6 animate-spin" /> Generating...</>
                   ) : (
                     <><BookOpen className="w-6 h-6" /> Start Learning</>
                   )}
                 </button>
               </div>
            </div>
         </div>

         {/* Content View */}
         <div ref={scrollRef} className="flex flex-col gap-[24px] scroll-mt-24">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-6 rounded-[24px] md:rounded-[32px] mb-6 flex items-start gap-4 border border-red-500 dark:border-red-600/50">
                <XCircle className="w-6 h-6 md:w-8 md:h-8 shrink-0" />
                <p className="text-[16px] md:text-[20px] font-medium leading-[1.3]">{error}</p>
              </div>
            )}
            
            {loading ? (
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-[24px] md:rounded-[32px] p-[32px] md:p-[48px] h-full min-h-[400px] md:min-h-[500px] flex flex-col items-center justify-center text-slate-500 dark:text-[#94A3B8] gap-6">
                 <Loader2 className="w-12 h-12 md:w-16 md:h-16 animate-spin text-blue-600 dark:text-[#38BDF8]" />
                 <p className="text-[20px] md:text-[24px] font-[700] text-center">Preparing your lesson using AI...</p>
              </div>
            ) : content ? (
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-[24px] md:rounded-[32px] p-[20px] md:p-[48px] relative flex flex-col"
                >
                  <ContentDisplay key={content.title} content={content} activity={activity} language={language} />
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-[24px] md:rounded-[32px] p-[32px] md:p-[48px] h-full min-h-[400px] md:min-h-[500px] flex flex-col items-center justify-center text-slate-500 dark:text-[#94A3B8] gap-6">
                 <BookText className="w-16 h-16 md:w-24 md:h-24 opacity-30 text-blue-600 dark:text-[#38BDF8]" />
                 <p className="text-[20px] md:text-[24px] font-[600] text-center max-w-sm leading-[1.3]">Select your lesson options on the left to start learning!</p>
              </div>
            )}
         </div>
      </main>
    </div>
  );
}
