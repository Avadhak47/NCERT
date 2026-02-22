import React, { useState } from 'react';
import { Globe } from 'lucide-react';

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

const LanguageSelector: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);

    const handleSelect = (lang: typeof LANGUAGES[0]) => {
        setSelectedLang(lang);
        setIsOpen(false);

        // Simulate Bhashini API trigger
        console.log(`[Bhashini API Mock] Triggering translation to: ${lang.code}`);
        // In a real integration: window.bhashini.translate(lang.code);
    };

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border-2 border-[var(--color-brand-primary)] text-[var(--color-brand-primary)] shadow-sm hover:bg-[var(--color-surface-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-brand-secondary)] font-bold text-sm"
                aria-label="Select Language"
                aria-expanded={isOpen}
            >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{selectedLang.name}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-[var(--color-brand-primary)] rounded-xl shadow-xl overflow-hidden animate-[panelEntry_200ms_ease-out]">
                    <div className="max-h-60 overflow-y-auto">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleSelect(lang)}
                                className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-[var(--color-surface-warm)] ${selectedLang.code === lang.code ? 'bg-[var(--color-surface-warm)] font-bold text-[var(--color-brand-primary)]' : 'text-[var(--color-text-main)]'}`}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                    <div className="px-3 py-2 bg-[var(--color-surface-muted)] border-t-2 border-[var(--color-surface-warm)] text-xs text-center text-[var(--color-text-muted)] font-medium">
                        Powered by Bhashini
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
