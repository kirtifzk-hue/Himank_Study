import { useState, useEffect, useRef } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  BookText,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Loader2,
  ChevronRight,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  GraduationCap,
  Home,
  Download,
  Settings2,
  Columns3,
  AlignLeft,
  Palette,
  Type as TypeIcon,
  Rocket,
  Brain,
  Lightbulb,
  Zap,
  Star,
  Microscope,
  Sparkles,
  Target,
  Compass,
  Flame,
  Maximize,
  Minimize,
} from "lucide-react";
import { toPng } from "html-to-image";

const ICON_MAP: Record<string, any> = {
  Rocket,
  Brain,
  Lightbulb,
  Zap,
  Star,
  Microscope,
  Sparkles,
  Target,
  Compass,
  Flame,
};

const NCERT_DATA = {
  Subjects: ["Mathematics", "Science", "Social Science", "English", "Hindi"],
  Languages: ["English", "Hindi", "English+Hindi"],
  Books: {
    Mathematics: { English: ["Mathematics"], Hindi: ["Ganit"] },
    Science: { English: ["Science"], Hindi: ["Vigyan"] },
    "Social Science": {
      English: [
        "India and the Contemporary World - I (History)",
        "Contemporary India - I (Geography)",
        "Democratic Politics - I (Civics)",
        "Economics",
      ],
      Hindi: [
        "Bharat Aur Samkalin Vishwa - I",
        "Samkalin Bharat - I",
        "Loktantrik Rajniti - I",
        "Arthashastra",
      ],
    },
    English: {
      English: ["Beehive", "Moments", "Words and Expressions - I"],
      Hindi: [],
    },
    Hindi: {
      English: [],
      Hindi: ["Kshitij", "Kritika", "Sparsh", "Sanchayan"],
    },
  },
  Activities: [
    { id: "summary", name: "Concept Summary" },
    { id: "mcq", name: "Multiple Choice Questions (MCQ)" },
    { id: "fill_blank", name: "Fill in the Blanks" },
    { id: "qa", name: "Important Q/A" },
    { id: "infographic", name: "Visual Infographic" },
  ],
};

const CHAPTER_DATA: Record<string, string[]> = {
  Mathematics: [
    "1. Number Systems",
    "2. Polynomials",
    "3. Coordinate Geometry",
    "4. Linear Equations in Two Variables",
    "5. Introduction to Euclids Geometry",
    "6. Lines and Angles",
    "7. Triangles",
    "8. Quadrilaterals",
    "9. Areas of Parallelograms and Triangles",
    "10. Circles",
    "11. Constructions",
    "12. Herons Formula",
    "13. Surface Areas and Volumes",
    "14. Statistics",
    "15. Probability",
  ],
  Science: [
    "1. Matter in Our Surroundings",
    "2. Is Matter Around Us Pure",
    "3. Atoms and Molecules",
    "4. Structure of the Atom",
    "5. The Fundamental Unit of Life",
    "6. Tissues",
    "7. Diversity in Living Organisms",
    "8. Motion",
    "9. Force and Laws of Motion",
    "10. Gravitation",
    "11. Work and Energy",
    "12. Sound",
    "13. Why Do We Fall Ill",
    "14. Natural Resources",
    "15. Improvement in Food Resources",
  ],
  English: [
    "1. The Fun They Had",
    "2. The Sound of Music",
    "3. The Little Girl",
    "4. A Truly Beautiful Mind",
    "5. The Snake and the Mirror",
    "6. My Childhood",
    "7. Packing",
    "8. Reach for the Top",
    "9. The Bond of Love",
    "10. Kathmandu",
    "11. If I Were You",
  ],
};

const getChaptersForSubject = (subject: string, book: string): string[] => {
  if (CHAPTER_DATA[subject]) return CHAPTER_DATA[subject];
  if (book.includes("Economics") || book.includes("Arthashastra")) {
    return [
      "1. The Story of Village Palampur",
      "2. People as Resource",
      "3. Poverty as a Challenge",
      "4. Food Security in India",
    ];
  }
  if (book.includes("Civics") || book.includes("Rajniti")) {
    return [
      "1. What is Democracy",
      "2. Constitutional Design",
      "3. Electoral Politics",
      "4. Working of Institutions",
      "5. Democratic Rights",
    ];
  }
  if (book.includes("Geography") || book.includes("Samkalin Bharat")) {
    return [
      "1. India - Size and Location",
      "2. Physical Features of India",
      "3. Drainage",
      "4. Climate",
      "5. Natural Vegetation and Wildlife",
      "6. Population",
    ];
  }
  if (book.includes("History") || book.includes("Vishwa")) {
    return [
      "1. The French Revolution",
      "2. Socialism in Europe and the Russian Revolution",
      "3. Nazism and the Rise of Hitler",
      "4. Forest Society and Colonialism",
      "5. Pastoralists in the Modern World",
    ];
  }
  return Array.from({ length: 15 }, (_, i) => `Chapter ${i + 1}`);
};

// Define typescript interfaces for our schema
interface Question {
  questionText: string;
  type: "mcq" | "fill_blank" | "qa";
  options?: string[];
  answer: string;
  explanation: string;
}

interface InfographicItem {
  title: string;
  description: string;
  conceptText: string;
  iconName?: string;
}

interface ActivityContent {
  title: string;
  content?: string;
  summaryTopics?: { title: string; content: string }[];
  questions?: Question[];
  infographicItems?: InfographicItem[];
}

function ContentDisplay({
  content,
  activity,
  language,
}: {
  content: ActivityContent;
  activity: string;
  language: string;
}) {
  const [speaking, setSpeaking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});
  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, string>
  >({});
  const [fillInputs, setFillInputs] = useState<Record<number, string>>({});

  // Infographic settings
  const [infoLayout, setInfoLayout] = useState<"grid" | "timeline">("grid");
  const [infoColor, setInfoColor] = useState<
    "blue" | "purple" | "green" | "rose"
  >("blue");
  const [infoFont, setInfoFont] = useState<"sans" | "serif" | "mono">("sans");
  const [infoSpacing, setInfoSpacing] = useState<"tight" | "normal" | "loose">(
    "normal",
  );
  const [infoHeader, setInfoHeader] = useState<string>("Study Guide");
  const [infoFooter, setInfoFooter] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const infographicRef = useRef<HTMLDivElement>(null);

  const colors = {
    
    blue: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-900 dark:text-slate-100",
      border: "hover:border-slate-900 dark:hover:border-slate-100",
      bloom: "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200",
    },
    purple: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-900 dark:text-slate-100",
      border: "hover:border-slate-900 dark:hover:border-slate-100",
      bloom: "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200",
    },
    green: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-900 dark:text-slate-100",
      border: "hover:border-slate-900 dark:hover:border-slate-100",
      bloom: "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200",
    },
    rose: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-900 dark:text-slate-100",
      border: "hover:border-slate-900 dark:hover:border-slate-100",
      bloom: "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200",
    },
  };
  const activeColor = colors[infoColor];

  const downloadInfographic = async () => {
    if (!infographicRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(infographicRef.current, {
        pixelRatio: 2,
        backgroundColor: "#FFFFFF",
      });
      const link = document.createElement("a");
      link.download = `${content.title.replace(/\s+/g, "_")}_Infographic.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to capture infographic:", err);
      alert("Failed to download image.");
    } finally {
      setDownloading(false);
    }
  };

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang =
        language === "Hindi" || language === "English+Hindi"
          ? "hi-IN"
          : "en-IN";
      utterance.rate = 0.9;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      document.body.style.overflow = "auto"; // reset on unmount
    };
  }, []);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isFullscreen]);

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 editorial-panel p-4 sm:p-6 md:p-8 overflow-y-auto h-[100dvh] flex flex-col space-y-12"
          : "flex flex-col flex-1 h-full relative space-y-12"
      }
    >
      {isFullscreen && (
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-slate-800">
            NCERT Study Buddy
          </h2>
          <button
            onClick={() => setIsFullscreen(false)}
            className="p-2 sm:p-3 rounded-none bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 font-semibold flex items-center gap-2 hover:bg-orange-200 dark:hover:bg-orange-500/30"
          >
            <Minimize className="w-5 h-5" />{" "}
            <span className="hidden sm:inline">Exit Fullscreen</span>
          </button>
        </div>
      )}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <h2 className="text-3xl md:text-5xl font-semibold font-serif text-slate-900 dark:text-white leading-tight tracking-tight flex-1 mr-4">
          {content.title}
        </h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isFullscreen && (
            <button
              onClick={() => setIsFullscreen(true)}
              className="editorial-button-secondary text-slate-800 dark:text-slate-200 px-4 sm:px-5 py-3 rounded-none flex items-center justify-center gap-2 font-semibold text-sm md:text-base cursor-pointer hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all shadow-sm flex-1 sm:flex-none"
            >
              <Maximize className="w-5 h-5" />
              <span className="hidden sm:inline">FULL SCREEN</span>
              <span className="sm:hidden">EXPAND</span>
            </button>
          )}
          <button
            onClick={() => {
              if (speaking) {
                stopSpeaking();
              } else {
                let textToSpeak = content.title + ". ";
                if (content.summaryTopics && content.summaryTopics.length > 0) {
                  textToSpeak += content.summaryTopics
                    .map((t) => t.title + ". " + t.content)
                    .join(" ");
                } else if (content.content) {
                  textToSpeak += content.content;
                }
                speak(textToSpeak);
              }
            }}
            className={`editorial-button-secondary text-slate-800 dark:text-slate-200 px-4 sm:px-5 py-3 rounded-none flex items-center justify-center gap-2 font-semibold text-sm md:text-base cursor-pointer hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all shadow-sm flex-1 sm:flex-none ${speaking ? "opacity-80 animate-pulse" : ""}`}
          >
            {speaking ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">
              {speaking ? "STOP SPEAKING" : "SPEAK CONTENT"}
            </span>
            <span className="sm:hidden">{speaking ? "STOP" : "SPEAK"}</span>
          </button>
        </div>
      </div>

      {content.summaryTopics && content.summaryTopics.length > 0 && (
        <div className="flex flex-col space-y-8">
          {content.summaryTopics.map((topic, i) => (
            <div
              key={i}
              className="flex flex-col space-y-3 editorial-card p-5 md:p-8 rounded-none hover:-translate-y-1 transition-transform"
            >
              <h3 className="text-xl md:text-3xl font-semibold font-serif text-[#fffb01] border-b border-slate-200 dark:border-slate-600 pb-4 flex items-center gap-3">
                <div className="bg-white/50 dark:bg-white/10 text-slate-800 dark:text-slate-300 p-2 rounded-none text-lg w-10 h-10 flex flex-col justify-center items-center">
                  {i + 1}
                </div>{" "}
                {topic.title}
              </h3>
              <div className="text-lg md:text-xl leading-relaxed text-slate-800 dark:text-slate-200 space-y-4 pt-2 font-medium pb-2">
                {(topic.content || "").split(/\\n|\n/).map(
                  (para, j) =>
                    para.trim() && (
                      <p key={j} className="text-slate-700 dark:text-slate-300">
                        {para}
                      </p>
                    ),
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {content.content &&
        (!content.summaryTopics || content.summaryTopics.length === 0) && (
          <div className="text-lg md:text-xl leading-relaxed text-slate-800 dark:text-slate-200 space-y-6 font-semibold">
            {(content.content || "").split(/\\n|\n/).map(
              (para, i) =>
                para.trim() && (
                  <p
                    key={i}
                    className="editorial-card p-5 md:p-8 rounded-none"
                  >
                    {para}
                  </p>
                ),
            )}
          </div>
        )}

      {content.infographicItems && content.infographicItems.length > 0 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 border border-slate-200 dark:bg-slate-800/50 p-4 rounded-none border border-slate-200 dark:border-slate-700">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-slate-600" />
                  <select
                    value={infoLayout}
                    onChange={(e) => setInfoLayout(e.target.value as any)}
                    className="bg-transparent text-base font-semibold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                  >
                    <option className="dark:bg-slate-800" value="grid">
                      Grid Layout
                    </option>
                    <option className="dark:bg-slate-800" value="timeline">
                      Timeline Layout
                    </option>
                  </select>
                </div>
                <div className="w-px h-8 bg-indigo-200 dark:bg-slate-700 hidden sm:block"></div>
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-purple-500" />
                  <div className="flex items-center gap-2">
                    {(["blue", "purple", "green", "rose"] as const).map((c) => (
                      <button
                        key={c}
                        onClick={() => setInfoColor(c)}
                        className={`w-6 h-6 rounded-full border ${infoColor === c ? "border-slate-400 dark:border-slate-400 scale-125 shadow-md" : "border-transparent hover:scale-110"} transition-all`}
                        style={{
                          backgroundColor:
                            c === "blue"
                              ? "#4F46E5"
                              : c === "purple"
                                ? "#9333EA"
                                : c === "green"
                                  ? "#16A34A"
                                  : "#E11D48",
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="w-px h-8 bg-indigo-200 dark:bg-slate-700 hidden sm:block"></div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`flex items-center gap-2 text-base font-semibold transition-colors w-full sm:w-auto justify-center sm:justify-start ${showAdvanced ? "text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-300 hover:text-slate-700"}`}
                >
                  <Settings2 className="w-5 h-5 sm:w-4 sm:h-4" />
                  <span>
                    Advanced <span className="inline">Settings</span>
                  </span>
                </button>
              </div>

              <button
                onClick={downloadInfographic}
                disabled={downloading}
                className="flex items-center justify-center gap-2 px-6 py-3 editorial-button whitespace-nowrap w-full sm:w-auto"
              >
                {downloading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                {downloading ? "Saving..." : "Save Image"}
              </button>
            </div>

            {/* Advanced Settings Drawer */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 md:p-5 bg-slate-50/30 dark:bg-slate-800/30 rounded-none border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                    {/* Font Dropdown */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                        <TypeIcon className="w-4 h-4" /> Font Family
                      </div>
                      <select
                        value={infoFont}
                        onChange={(e) => setInfoFont(e.target.value as any)}
                        className="bg-transparent text-base font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer border-b-2 border-slate-200 dark:border-slate-600 focus:border-slate-500 pb-1 w-full"
                      >
                        <option className="dark:bg-slate-800" value="sans">
                          Clean (Sans-Serif)
                        </option>
                        <option className="dark:bg-slate-800" value="serif">
                          Classic (Serif)
                        </option>
                        <option className="dark:bg-slate-800" value="mono">
                          Technical (Mono)
                        </option>
                      </select>
                    </div>
                    {/* Spacing Dropdown */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                        <AlignLeft className="w-4 h-4" /> Element Spacing
                      </div>
                      <select
                        value={infoSpacing}
                        onChange={(e) => setInfoSpacing(e.target.value as any)}
                        className="bg-transparent text-base font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer border-b-2 border-slate-200 dark:border-slate-600 focus:border-slate-500 pb-1 w-full"
                      >
                        <option className="dark:bg-slate-800" value="tight">
                          Compact (Tight)
                        </option>
                        <option className="dark:bg-slate-800" value="normal">
                          Default (Normal)
                        </option>
                        <option className="dark:bg-slate-800" value="loose">
                          Spacious (Loose)
                        </option>
                      </select>
                    </div>
                    {/* Custom Header Input */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Document Header
                      </div>
                      <input
                        type="text"
                        value={infoHeader}
                        onChange={(e) => setInfoHeader(e.target.value)}
                        placeholder="e.g. Study Guide"
                        className="bg-transparent text-base font-semibold text-slate-800 dark:text-slate-200 outline-none border-b-2 border-slate-200 dark:border-slate-600 focus:border-slate-500 transition-colors pb-1 w-full"
                      />
                    </div>
                    {/* Custom Footer Input */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Document Footer
                      </div>
                      <input
                        type="text"
                        value={infoFooter}
                        onChange={(e) => setInfoFooter(e.target.value)}
                        placeholder="e.g. Student Name"
                        className="bg-transparent text-base font-semibold text-slate-800 dark:text-slate-200 outline-none border-b-2 border-slate-200 dark:border-slate-600 focus:border-slate-500 transition-colors pb-1 w-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-slate-200/50 dark:bg-slate-900/50 p-4 md:p-8 rounded-none flex justify-center overflow-x-auto">
            {/* A4 Paper Template - Stripped of Dark Mode so it is ALWAYS Print-Ready White */}
            <div
              ref={infographicRef}
              className={`bg-white w-full max-w-[794px] min-w-[320px] flex flex-col p-4 sm:p-8 md:p-12 shadow-sm rounded-md relative shrink-0 ${infoFont === "serif" ? "font-serif" : infoFont === "mono" ? "font-mono" : "font-sans"}`}
              style={{
                minHeight: "min(1123px, 140vw)",
                backgroundImage:
                  "radial-gradient(#e2e8f0 2px, transparent 2px)",
                backgroundSize: "30px 30px",
              }}
            >
              {/* Document Header */}
              <div className="text-center mb-10 pt-4">
                {infoHeader ? (
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">
                    {infoHeader}
                  </p>
                ) : null}
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif text-slate-800 uppercase tracking-wide leading-tight px-2">
                  {content.title}
                </h3>
                <div
                  className={`mx-auto mt-6 w-16 h-1.5 rounded-full ${activeColor.bg
                    .replace(/dark:\S+/g, "")
                    .trim()
                    .split(" ")[0]
                    .replace("100", "500")}`}
                ></div>
                <p
                  className={`mt-4 font-semibold tracking-widest text-sm uppercase ${activeColor.text.replace(/dark:\S+/g, "").trim()}`}
                >
                  Key Concepts Overview
                </p>
              </div>

              {/* Layout Container */}
              <div className="flex-1 flex flex-col justify-center">
                {infoLayout === "grid" ? (
                  <div
                    className={`grid grid-cols-1 sm:grid-cols-2 w-full ${infoSpacing === "tight" ? "gap-4" : infoSpacing === "loose" ? "gap-10" : "gap-6"}`}
                  >
                    {content.infographicItems.map((item, idx) => {
                      const IconComponent =
                        item.iconName && ICON_MAP[item.iconName]
                          ? ICON_MAP[item.iconName]
                          : Star;
                      return (
                        <div
                          key={idx}
                          className={`editorial-card rounded-none relative overflow-hidden flex flex-col shadow-sm hover:shadow-md ${activeColor.border.replace(/dark:\S+/g, "").trim()} transition-all duration-300 group ${infoSpacing === "tight" ? "p-3 sm:p-4 gap-2" : infoSpacing === "loose" ? "p-6 sm:p-8 gap-3 sm:gap-4" : "p-4 sm:p-6 gap-2 sm:gap-3"}`}
                        >
                          <div
                            className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl transition-all duration-500 ${activeColor.bloom.replace(/dark:\S+/g, "").trim()}`}
                          ></div>
                          <div className="flex items-start gap-2.5 sm:gap-3 relative z-10">
                            <div
                              className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full font-semibold text-xs sm:text-sm shrink-0 shadow-sm mt-0.5 ${activeColor.bg.replace(/dark:\S+/g, "").trim()} ${activeColor.text.replace(/dark:\S+/g, "").trim()}`}
                            >
                              {idx + 1}
                            </div>
                            <span
                              className={`font-semibold text-[10px] sm:text-xs uppercase tracking-widest bg-slate-100 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md leading-tight ${activeColor.text.replace(/dark:\S+/g, "").trim()}`}
                            >
                              {item.conceptText}
                            </span>
                          </div>
                          <div className="flex items-start gap-3 sm:gap-4 mt-2 sm:mt-3">
                            <div
                              className={`mt-1 p-2 rounded-none bg-slate-50 border border-slate-100 shrink-0 ${activeColor.text.replace(/dark:\S+/g, "").trim()}`}
                            >
                              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="flex-1">
                              <h4
                                className={`text-slate-900 font-semibold relative z-10 leading-snug text-lg sm:text-xl`}
                              >
                                {item.title}
                              </h4>
                              <p
                                className={`text-slate-600 dark:text-slate-300 font-medium text-sm sm:text-base leading-relaxed relative z-10 flex-1 mt-1.5`}
                              >
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    className={`flex flex-col relative ml-2 sm:ml-4 md:ml-12 py-4 ${infoSpacing === "tight" ? "gap-4 sm:gap-6" : infoSpacing === "loose" ? "gap-8 sm:gap-14" : "gap-6 sm:gap-10"}`}
                  >
                    <div
                      className={`absolute left-[11px] sm:left-[15px] top-4 bottom-4 w-1 flex flex-col items-center opacity-20 ${
                        activeColor.bg
                          .replace(/dark:\S+/g, "")
                          .trim()
                          .split(" ")[0]
                      }`}
                    >
                      <div className="w-full h-full border-l-[3px] border-dashed border-inherit"></div>
                    </div>
                    {content.infographicItems.map((item, idx) => {
                      const IconComponent =
                        item.iconName && ICON_MAP[item.iconName]
                          ? ICON_MAP[item.iconName]
                          : Star;
                      return (
                        <div
                          key={idx}
                          className="relative pl-8 sm:pl-10 md:pl-16 group"
                        >
                          <div
                            className={`absolute -left-1 sm:-left-1 top-0 sm:top-1 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm shadow-md ring-4 ring-white z-10 hover:scale-110 transition-transform ${activeColor.bg.replace(/dark:\S+/g, "").trim()} ${activeColor.text.replace(/dark:\S+/g, "").trim()}`}
                          >
                            {idx + 1}
                          </div>
                          <div
                            className={`editorial-card rounded-none relative overflow-hidden shadow-sm hover:shadow-md ${activeColor.border.replace(/dark:\S+/g, "").trim()} transition-all duration-300 ${infoSpacing === "tight" ? "p-3 sm:p-4 md:p-6 mb-1" : infoSpacing === "loose" ? "p-5 sm:p-6 md:p-10 mb-4" : "p-4 sm:p-5 md:p-8 mb-3"}`}
                          >
                            <div className="flex items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2">
                              <span
                                className={`font-semibold text-[10px] sm:text-xs uppercase tracking-widest bg-slate-100 px-2 sm:px-2.5 sm:pt-1 sm:pb-1 rounded-md text-left leading-tight ${activeColor.text.replace(/dark:\S+/g, "").trim()}`}
                              >
                                {item.conceptText}
                              </span>
                              <IconComponent
                                className={`w-4 h-4 sm:w-5 sm:h-5 opacity-40 shrink-0 mt-0.5 sm:mt-0 ${activeColor.text.replace(/dark:\S+/g, "").trim()}`}
                              />
                            </div>
                            <h4
                              className={`text-slate-900 font-semibold relative z-10 leading-snug ${infoSpacing === "tight" ? "text-base sm:text-lg md:text-xl" : infoSpacing === "loose" ? "text-xl sm:text-2xl md:text-3xl" : "text-lg sm:text-xl md:text-2xl"}`}
                            >
                              {item.title}
                            </h4>
                            <p
                              className={`text-slate-600 leading-relaxed relative z-10 mt-1.5 sm:mt-3 ${infoSpacing === "tight" ? "text-[11px] sm:text-xs md:text-sm" : infoSpacing === "loose" ? "text-sm sm:text-base md:text-lg" : "text-xs sm:text-sm md:text-base"}`}
                            >
                              {item.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Document Footer */}
              <div className="mt-12 pt-6 border-t-2 border-slate-100 flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-widest px-4">
                <span>
                  {infoFooter ? infoFooter : `Study Guide / ${language}`}
                </span>
                <span>Page 1</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {content.questions && content.questions.length > 0 && (
        <div className="space-y-16">
          {content.questions.map((q, idx) => (
            <div key={idx} className="relative flex flex-col gap-6 md:gap-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <span className="text-slate-500 dark:text-slate-600 font-semibold text-sm tracking-widest uppercase">
                    Question {String(idx + 1).padStart(2, "0")} of{" "}
                    {String(content.questions?.length).padStart(2, "0")}
                  </span>
                  <h3 className="text-xl md:text-2xl leading-relaxed font-serif text-slate-800 dark:text-white text-left">
                    {q.questionText}
                  </h3>
                </div>
                <button
                  onClick={() =>
                    speak(
                      q.questionText +
                        ". " +
                        (q.options ? q.options.join(", ") : ""),
                    )
                  }
                  className="editorial-button-secondary text-slate-800 dark:text-slate-200 p-2 sm:p-2.5 rounded-none flex items-center justify-center shrink-0 hover:bg-slate-100 dark:hover:bg-slate-500/20 hover:scale-110 active:scale-95 transition-all shadow-sm"
                >
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {q.type === "mcq" && q.options && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = selectedOptions[idx] === opt;
                    const isCorrect = showAnswers[idx] && opt === q.answer;
                    const isIncorrect =
                      showAnswers[idx] && isSelected && !isCorrect;

                    let btnClass =
                      "editorial-card border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-500/10 shadow-sm shadow-indigo-100/30 dark:shadow-none hover:-translate-y-1";
                    if (isCorrect)
                      btnClass =
                        "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-emerald-100/50";
                    else if (isIncorrect)
                      btnClass =
                        "bg-rose-50 dark:bg-slate-900/10 border-rose-400 text-rose-600 dark:text-rose-400 shadow-rose-100/50";
                    else if (isSelected)
                      btnClass =
                        "bg-slate-50 dark:bg-slate-500/10 border-slate-500 text-slate-800 dark:text-slate-200 scale-[1.02] shadow-md shadow-indigo-100/50 dark:shadow-none";

                    return (
                      <button
                        key={oIdx}
                        onClick={() =>
                          !showAnswers[idx] &&
                          setSelectedOptions((prev) => ({
                            ...prev,
                            [idx]: opt,
                          }))
                        }
                        className={`border p-5 md:p-6 rounded-none text-base md:text-lg font-semibold cursor-pointer transition-all flex items-center gap-4 text-left ${btnClass}`}
                      >
                        <div
                          className={`w-8 h-8 md:w-10 md:h-10 border rounded-full shrink-0 flex items-center justify-center ${isCorrect ? "border-emerald-500 bg-emerald-500" : isIncorrect ? "border-rose-500 bg-slate-900" : "border-slate-200 dark:border-slate-700"}`}
                        >
                          {isCorrect && (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          )}
                          {isIncorrect && (
                            <XCircle className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <span className="flex-1">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {q.type === "fill_blank" && (
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    value={fillInputs[idx] || ""}
                    onChange={(e) =>
                      setFillInputs((prev) => ({
                        ...prev,
                        [idx]: e.target.value,
                      }))
                    }
                    placeholder="Type your answer..."
                    disabled={showAnswers[idx]}
                    className={`flex-1 w-full border rounded-none p-5 md:p-6 text-base md:text-lg font-semibold outline-none transition-all
                              ${
                                showAnswers[idx]
                                  ? fillInputs[idx]?.trim().toLowerCase() ===
                                    q.answer.trim().toLowerCase()
                                    ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                                    : "bg-rose-50 dark:bg-slate-900/10 border-rose-400 text-rose-600 dark:text-rose-400"
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:border-slate-400 focus:bg-slate-50"
                              }
                           `}
                  />
                </div>
              )}

              {(q.type === "mcq" ||
                q.type === "fill_blank" ||
                q.type === "qa") &&
                !showAnswers[idx] && (
                  <div className="flex justify-start mt-2">
                    <button
                      onClick={() =>
                        setShowAnswers((prev) => ({ ...prev, [idx]: true }))
                      }
                      className="w-full md:w-auto editorial-button-secondary hover:border-slate-400 hover:bg-white text-slate-500 dark:text-slate-300 hover:text-slate-800 px-6 py-3 rounded-none text-base font-semibold cursor-pointer transition-all shadow-sm"
                    >
                      {q.type === "qa" ? "Show Answer" : "Check Answer"}
                    </button>
                  </div>
                )}

              {showAnswers[idx] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6 p-6 md:p-8 editorial-panel rounded-none space-y-5 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-emerald-400"></div>
                  <div className="flex items-center gap-3 font-semibold text-emerald-600 dark:text-emerald-400 text-lg md:text-xl pl-2">
                    <CheckCircle2 className="w-6 h-6 shrink-0" />
                    {q.type === "qa" ? "Answer :" : "Correct Answer :"}{" "}
                    <span className="text-slate-800 dark:text-slate-200">
                      {q.answer}
                    </span>
                  </div>
                  {q.explanation && (
                    <div className="text-slate-600 dark:text-slate-300 text-base md:text-lg font-medium leading-relaxed mt-2 border-t-2 border-slate-200 dark:border-slate-700 pt-5 pl-2">
                      <span className="font-semibold text-xs uppercase tracking-widest block mb-2 text-slate-500">
                        Explanation
                      </span>
                      {q.explanation}
                    </div>
                  )}
                  <div className="pl-2">
                    <button
                      onClick={() =>
                        speak(q.answer + ". " + (q.explanation || ""))
                      }
                      className="flex items-center gap-2 text-slate-800 dark:text-slate-200 mt-2 hover:bg-slate-100 dark:hover:bg-indigo-900/30 px-4 py-2 -ml-4 rounded-lg font-semibold text-sm cursor-pointer transition-colors"
                    >
                      <Volume2 className="w-5 h-5" /> Listen to Explanation
                    </button>
                  </div>
                </motion.div>
              )}

              {q.type === "qa" && !showAnswers[idx] && (
                <div className="flex justify-start mt-2">
                  <button
                    onClick={() =>
                      setShowAnswers((prev) => ({ ...prev, [idx]: true }))
                    }
                    className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-none text-base font-semibold shadow-sm shadow-emerald-500/30 cursor-pointer border-none transition-transform hover:scale-105 active:scale-95"
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
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Form State
  const [subject, setSubject] = useState("Science");
  const [language, setLanguage] = useState(NCERT_DATA.Languages[0]);
  const [book, setBook] = useState("Science");
  const [chapter, setChapter] = useState("2. Is Matter Around Us Pure");
  const [activity, setActivity] = useState(NCERT_DATA.Activities[0].id);

  // App State
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<ActivityContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMobileSetupOpen, setIsMobileSetupOpen] = useState(true);

  const getAvailableBooks = (sub: string, lang: string) => {
    const books = NCERT_DATA.Books as any;
    if (lang === "English+Hindi") {
      const eng = books[sub]?.["English"] || [];
      const hin = books[sub]?.["Hindi"] || [];
      return Array.from(new Set([...eng, ...hin]));
    }
    return books[sub]?.[lang] || [];
  };

  const availableBooks = getAvailableBooks(subject, language);
  const availableChapters = getChaptersForSubject(subject, book);

  const generateContent = async () => {
    if (!book) {
      setError("Please select a book first.");
      return;
    }
    setLoading(true);
    setError(null);
    setContent(null);
    if (window.innerWidth < 1024) {
      setIsMobileSetupOpen(false); // smoothly hide setup on mobile
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const langInstruction =
        language === "English+Hindi"
          ? 'Bilingual (English and Hindi). IMPORTANT: Write the content in English and immediately provide its Hindi translation (in Devanagari script) in brackets. Example: "Matter (पदार्थ)". Apply this to ALL text EXCEPT the "title" field, so students weak in English can easily understand.'
          : language;
      const prompt = `You are an expert tutor for CBSE/NCERT Class 9 students. 
Activity: ${activity} - ${NCERT_DATA.Activities.find((a) => a.id === activity)?.name}
Subject: ${subject}
Language: ${language}
Book: ${book}
Chapter: ${chapter}

Generate educational content for the above selection. Use the appropriate language (${langInstruction}). 
Ensure questions are highly engaging and appropriate for a 14-15 year old student. 

STRICT LENGTH LIMITS & FORMATTING RULES:
- If activity is 'summary': Provide a structured summary divided topic-wise using the 'summaryTopics' array. Give EXACTLY 3 to 5 distinct topic objects. Topic content MUST be strictly under 50 words each.
- If activity is 'mcq': Generate EXACTLY 5 multiple choice questions with ONLY 2 options each.
- If activity is 'fill_blank': Generate EXACTLY 5 fill in the blank questions.
- If activity is 'qa': Generate EXACTLY 3 important question and answers.
- If activity is 'infographic': Generate EXACTLY 4 key concepts. Give each item a 'title', a 'conceptText' (1-3 words), and a 'description' STRICTLY UNDER 30 WORDS EACH.

CRITICAL INSTRUCTIONS TO PREVENT ENDLESS LOOPS:
- YOU MUST STOP GENERATING AS SOON AS YOU MEET THE EXACT COUNT (e.g., EXACTLY 3, exactly 4, exactly 5).
- DO NOT generate endless lists of questions or topics.
- DO NOT repeat yourself or get stuck in a loop.
- KEEP ALL TEXT CONCISE.
- ABSOLUTELY NO EMOJIS ALLOWED IN ANY FIELD. ZERO EMOJIS.
- Ensure the output is strictly valid JSON without markdown wrapping.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          content: {
            type: Type.STRING,
            description:
              "Detailed explanation or general summary content. (Do NOT use if using summaryTopics).",
          },
          summaryTopics: {
            type: Type.ARRAY,
            description:
              "Topic-wise split for a structured summary layout. ONLY use if activity is 'summary'.",
            items: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: "The topic heading. NO EMOJIS.",
                },
                content: {
                  type: Type.STRING,
                  description:
                    "Detailed paragraph about this specific topic. NO EMOJIS.",
                },
              },
            },
          },
          infographicItems: {
            type: Type.ARRAY,
            description:
              "Array of items for the infographic timeline/grid. ONLY use if activity is 'infographic'",
            items: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: "Title of the concept. NO EMOJIS.",
                },
                description: {
                  type: Type.STRING,
                  description: "Short description. NO EMOJIS.",
                },
                conceptText: {
                  type: Type.STRING,
                  description:
                    "A very short 1-3 word keyword for this block. NO EMOJIS.",
                },
                iconName: {
                  type: Type.STRING,
                  description:
                    "Choose exactly one: Rocket, Brain, Lightbulb, Zap, Star, Microscope, Sparkles, Target, Compass, Flame",
                },
              },
            },
          },
          questions: {
            type: Type.ARRAY,
            description:
              "List of questions for MCQ, Fill in the Blanks, or Important Q/A. Do not use this for summary.",
            items: {
              type: Type.OBJECT,
              properties: {
                questionText: {
                  type: Type.STRING,
                  description: "The question text. NO EMOJIS.",
                },
                type: {
                  type: Type.STRING,
                  description: "'mcq', 'fill_blank', 'qa'",
                },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description:
                    "Array of exactly 2 string options if type is 'mcq'. Empty array otherwise. NO EMOJIS.",
                },
                answer: {
                  type: Type.STRING,
                  description:
                    "Correct answer or text to fill in the blank. For 'qa' put the answer here. NO EMOJIS.",
                },
                explanation: {
                  type: Type.STRING,
                  description: "Explanation of the answer. NO EMOJIS.",
                },
              },
              required: [
                "questionText",
                "type",
                "options",
                "answer",
                "explanation",
              ],
            },
          },
        },
      };

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          maxOutputTokens: 8192,
          temperature: 0.7,
        },
      });

      let jsonStr = response.text?.trim() || "";

      if (!jsonStr) {
        throw new Error(
          "Empty response from AI. Status: " +
            (response?.candidates?.[0]?.finishReason || "Unknown"),
        );
      }

      // Ensure we strip any markdown wrappers just in case the model ignored responseMimeType
      jsonStr = jsonStr.replace(/^```(json)?\s*/i, "").replace(/\s*```$/i, "");
      jsonStr = jsonStr.trim();

      try {
        const parsed = JSON.parse(jsonStr) as ActivityContent;
        if (!parsed.title) parsed.title = chapter;
        setContent(parsed);
      } catch (parseErr) {
        console.warn("Initial JSON parse failed, attempting strict repair...");
        // Fallback for truncated JSON string
        let repaired = jsonStr;
        if (repaired.endsWith('"')) {
          repaired += "}]}";
        } else if (!repaired.endsWith("}")) {
          repaired += '"]}]}';
        }
        try {
          const fallbackParsed = JSON.parse(repaired) as ActivityContent;
          if (!fallbackParsed.title) fallbackParsed.title = chapter;
          setContent(fallbackParsed);
        } catch (e) {
          console.error(
            "JSON Error:",
            e,
            "Raw string start:",
            jsonStr.substring(0, 100),
            "Raw string end:",
            jsonStr.slice(-100),
          );
          throw new Error(
            `Failed to parse AI response. Error: ${(e as Error).message}. (Check console for details)`,
          );
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while generating content.");
    } finally {
      setLoading(false);
    }
  };

  // Apply dark mode
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Update book selection when subject or language changes
  useEffect(() => {
    const booksForSelection = getAvailableBooks(subject, language);
    if (booksForSelection.length > 0) {
      setBook(booksForSelection[0]);
    } else {
      setBook("");
    }
  }, [subject, language]);

  // Update chapter selection when book or subject changes
  useEffect(() => {
    const chaptersForSelection = getChaptersForSubject(subject, book);
    if (chaptersForSelection.length > 0) {
      setChapter(chaptersForSelection[0]);
    } else {
      setChapter("");
    }
  }, [subject, book]);

  // Auto-scroll to content view on mobile
  useEffect(() => {
    if ((loading || content) && window.innerWidth < 1024 && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading, content]);

  const goHome = () => {
    setContent(null);
    setError(null);
    setLoading(false);
    setIsMobileSetupOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={`min-h-screen bg-transparent text-slate-900 dark:text-slate-100 transition-colors duration-300 antialiased flex flex-col`}
    >
      <header className="h-[80px] px-4 md:px-10 flex items-center border-b border-white/20 dark:border-white/10 editorial-panel sticky top-0 z-20 transition-all shadow-sm">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between w-full">
          <div
            className="flex items-center gap-2 md:gap-3 text-slate-800 dark:text-slate-200 cursor-pointer hover:scale-105 transition-transform"
            onClick={goHome}
          >
            <div className="editorial-panel p-2 rounded-none shadow-sm">
              <GraduationCap className="w-6 h-6 md:w-8 md:h-8 shrink-0" />
            </div>
            <h1 className="text-[28px] md:text-[36px] font-bold font-serif tracking-tight hidden sm:block text-slate-900 dark:text-white">
              NCERT Study Buddy
            </h1>
            <h1 className="text-[26px] md:hidden font-bold font-serif tracking-tight text-slate-900 dark:text-white">
              Study Buddy
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={goHome}
              className="flex items-center gap-2 px-5 py-2.5 rounded-none editorial-button-secondary"
              title="Go Home"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-3 rounded-none editorial-button-secondary"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <Moon className="w-5 h-5 md:w-6 md:h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 md:gap-8">
        {/* Form UI */}
        <div className="flex flex-col relative z-10">
          <div className="editorial-card p-6 md:p-8 rounded-none flex flex-col gap-5 h-auto">
            <h2
              className="md:hidden text-xl font-semibold flex items-center justify-between text-slate-800 dark:text-slate-200 cursor-pointer p-2 -m-2 rounded-none hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              onClick={() => setIsMobileSetupOpen(!isMobileSetupOpen)}
            >
              <span className="flex items-center gap-3">
                <div className="bg-white/50 dark:bg-white/10 p-2 rounded-lg">
                  <LayoutGrid className="w-5 h-5" />
                </div>{" "}
                Lesson Setup
              </span>
              <ChevronRight
                className={`w-5 h-5 transition-transform ${isMobileSetupOpen ? "rotate-90" : ""}`}
              />
            </h2>

            <div
              className={`space-y-5 ${!isMobileSetupOpen ? "hidden md:block" : "block"}`}
            >
              <div className="flex flex-col gap-2">
                <label className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider pl-1">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-white/50 dark:bg-black/20 border border-white/50 dark:border-white/10 backdrop-blur-sm text-slate-900 dark:text-slate-100 p-3.5 md:p-4 rounded-none text-base md:text-lg font-semibold cursor-pointer outline-none transition-all focus:border-slate-500 focus:bg-slate-50 dark:focus:bg-indigo-900/20 dark:focus:border-slate-400 w-full shadow-sm hover:border-indigo-300"
                >
                  {NCERT_DATA.Subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider pl-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-white/50 dark:bg-black/20 border border-white/50 dark:border-white/10 backdrop-blur-sm text-slate-900 dark:text-slate-100 p-3.5 md:p-4 rounded-none text-base md:text-lg font-semibold cursor-pointer outline-none transition-all focus:border-slate-500 focus:bg-slate-50 dark:focus:bg-[#151515] dark:focus:border-slate-900 dark:focus:border-white w-full shadow-sm hover:border-slate-900 dark:hover:border-white"
                >
                  {NCERT_DATA.Languages.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider pl-1">
                  Book Name
                </label>
                <select
                  value={book}
                  onChange={(e) => setBook(e.target.value)}
                  className="bg-white/50 dark:bg-black/20 border border-white/50 dark:border-white/10 backdrop-blur-sm text-slate-900 dark:text-slate-100 p-3.5 md:p-4 rounded-none text-base md:text-lg font-semibold cursor-pointer outline-none transition-all focus:border-slate-900 dark:focus:border-white focus:bg-slate-50 dark:focus:bg-[#151515] dark:focus:border-slate-900 dark:focus:border-white w-full shadow-sm hover:border-slate-900 dark:hover:border-white disabled:opacity-50"
                  disabled={!book}
                >
                  {availableBooks.map((b: string) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                  {!book && <option value="">No Book Available</option>}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider pl-1">
                  Chapter
                </label>
                <select
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="bg-white/50 dark:bg-black/20 border border-white/50 dark:border-white/10 backdrop-blur-sm text-slate-900 dark:text-slate-100 p-3.5 md:p-4 rounded-none text-base md:text-lg font-semibold cursor-pointer outline-none transition-all focus:border-slate-900 dark:focus:border-white focus:bg-slate-50 dark:focus:bg-[#151515] dark:focus:border-slate-900 dark:focus:border-white w-full shadow-sm hover:border-slate-900 dark:hover:border-white"
                >
                  {availableChapters.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider pl-1">
                  Activity Type
                </label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="bg-white/50 dark:bg-black/20 border border-white/50 dark:border-white/10 backdrop-blur-sm text-slate-900 dark:text-slate-100 p-3.5 md:p-4 rounded-none text-base md:text-lg font-semibold cursor-pointer outline-none transition-all focus:border-slate-900 dark:focus:border-white focus:bg-slate-50 dark:focus:bg-[#151515] dark:focus:border-slate-900 dark:focus:border-white w-full shadow-sm hover:border-slate-900 dark:hover:border-white"
                >
                  {NCERT_DATA.Activities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={generateContent}
                disabled={loading || !book}
                className="w-full editorial-button py-5 px-6 md:px-8 text-lg md:text-xl flex items-center justify-center gap-3 mt-4 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-7 h-7 animate-spin" /> Generating
                    Magic...
                  </>
                ) : (
                  <>
                    <Rocket className="w-7 h-7 group-hover:animate-bounce" />{" "}
                    Start Learning
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content View */}
        <div ref={scrollRef} className="flex flex-col gap-6 scroll-mt-24">
          {error && (
            <div className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 p-6 rounded-none mb-2 flex items-start gap-4 border-2 border-red-200 dark:border-red-500/30 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
              <XCircle className="w-7 h-7 shrink-0" />
              <p className="text-lg font-semibold leading-snug pt-0.5">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="editorial-card rounded-none p-8 md:p-12 h-full min-h-[500px] flex flex-col items-center justify-center text-slate-800 dark:text-slate-200 gap-6">
              <div className="bg-slate-50 dark:bg-slate-500/10 p-6 rounded-full inline-flex">
                <Sparkles className="w-16 h-16 animate-pulse" />
              </div>
              <p className="text-2xl font-serif text-center max-w-sm text-slate-500">
                Crafting your perfect study guide...
              </p>
            </div>
          ) : content ? (
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="editorial-card border border-slate-100 dark:border-slate-700 rounded-none p-6 md:p-10 lg:p-12 relative flex flex-col shadow-md shadow-indigo-100/40 dark:shadow-none"
              >
                <ContentDisplay
                  key={content.title}
                  content={content}
                  activity={activity}
                  language={language}
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="editorial-panel border-dashed rounded-none p-8 md:p-12 h-full min-h-[500px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-200 gap-6">
              <div className="bg-slate-100 dark:bg-slate-700/50 p-8 rounded-none rotate-[-5deg] hover:rotate-0 transition-transform cursor-default">
                <Rocket className="w-20 h-20 text-slate-300 dark:text-slate-700" />
              </div>
              <p className="text-xl md:text-2xl font-serif text-center max-w-sm leading-snug text-slate-500">
                Select your lesson options on the left to blast off!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
