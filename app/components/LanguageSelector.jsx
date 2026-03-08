"use client";

import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useTranslation } from "@/app/contexts/TranslationContext";

export default function LanguageSelector({ walletAddress }) {
  const { currentLang, switchLanguage, isTranslating, LANGUAGES } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isTranslating}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-wait shadow-sm"
      >
        <Globe size={15} />
        <span className="font-medium">
          {isTranslating ? "..." : current.native}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50 max-h-72 overflow-y-auto">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                switchLanguage(lang.code, walletAddress);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-sm flex justify-between items-center transition-colors hover:bg-blue-50 ${
                lang.code === currentLang
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700"
              }`}
            >
              <span>{lang.native}</span>
              <span className="text-xs text-gray-400">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}