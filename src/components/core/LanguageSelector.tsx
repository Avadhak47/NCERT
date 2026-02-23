import React, { useState, useRef } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'mr', name: 'मराठी' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'ur', name: 'اردو' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
];

const HOVER_DELAY_MS = 150;

const LanguageSelector: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearCloseTimer = () => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    };

    const handleMouseEnter = () => {
        clearCloseTimer();
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        closeTimerRef.current = setTimeout(() => setIsOpen(false), HOVER_DELAY_MS);
    };

    const handleSelect = (lang: (typeof LANGUAGES)[0]) => {
        setSelectedLang(lang);
        setIsOpen(false);
        // TODO(Bhashini): Integrate Bhashini API for entire site translation here
        // 1. Send the requested language code (`lang.code`) to the Bhashini service.
        // 2. Fetch or trigger the translation stream.
        // 3. Update the internationalization context (e.g. i18n overlay or language provider bindings).
        console.log(`[Bhashini API Mock] Triggering translation to: ${lang.code}`);
    };

    return (
        <div
            className="relative z-50"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-2 text-slate-700 hover:text-slate-900 font-medium text-sm rounded-md hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                aria-label="Select Language"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <Globe className="w-4 h-4 shrink-0" />
                <span>Language</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden ring-1 ring-black/5 py-1">
                    <div className="max-h-72 overflow-y-auto">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                type="button"
                                onClick={() => handleSelect(lang)}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-2 transition-colors hover:bg-slate-50 ${selectedLang.code === lang.code ? 'bg-sky-50/80 font-semibold text-[var(--color-brand-primary)]' : 'text-slate-800'}`}
                            >
                                <span>{lang.name}</span>
                                {selectedLang.code === lang.code && <Check className="w-4 h-4 shrink-0 text-[var(--color-brand-primary)]" />}
                            </button>
                        ))}
                    </div>
                    <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 text-xs text-center text-slate-500 font-medium">
                        Powered by Bhashini
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
