import React, { useState, useRef } from 'react';
import { 
    Trophy, 
    Star, 
    Download, 
    User, 
    ArrowLeft, 
    Loader2, 
    Award,
    MapPin,
    Puzzle,
    Music,
    Clock,
    Landmark,
    Map,
    BookOpen
} from 'lucide-react';
import gamesData from '../data/games.json';

// Import modularized game components
import StateOnMapGame from '../components/games/StateOnMapGame';
import HeritageSiteBuilderGame from '../components/games/HeritageSiteBuilderGame';
import DanceStateGame from '../components/games/DanceStateGame';
import TimelineOrderGame from '../components/games/TimelineOrderGame';
import MonumentStateGame from '../components/games/MonumentStateGame';
import StateToRegionGame from '../components/games/StateToRegionGame';
import VirasatQuizGame from '../components/games/VirasatQuizGame';

type OnBackFn = (score?: string) => void;

// --- Placeholder for other coming-soon games ---
function PlaceholderGame({ title, onBack }: { title: string; onBack: OnBackFn }) {
    return (
        <div className="w-full max-w-2xl mx-auto text-center py-12">
            <Star className="w-16 h-16 text-[var(--color-accent-amber)] mx-auto mb-6 animate-pulse" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-600 mb-8">This game is coming soon. Stay tuned!</p>
            <button onClick={() => onBack()} className="px-6 py-3 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Arcade
            </button>
        </div>
    );
}

const GAME_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    MapPin, Puzzle, Music, Clock, Landmark, Map, BookOpen
};

// Slightly transparent background image per game (Unsplash — from user-provided links)
const GAME_BG_IMAGES: Record<number, string> = {
    1: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80', // State Capital Match — world map
    2: 'https://images.unsplash.com/photo-1729092087795-bdb99a8c1ad9?w=800&q=80', // Heritage Site Builder — beach
    3: 'https://images.unsplash.com/photo-1768491815837-87a90744f9e6?w=800&q=80', // Guess the Dance Form — dancer
    4: 'https://images.unsplash.com/photo-1765451816990-9d55690b5867?w=800&q=80', // Historical Timeline — silhouette/timeline
    5: 'https://images.unsplash.com/photo-1632941184796-fbbbf2c44e66?w=800&q=80', // Monument & State — building (Hawa Mahal)
    6: 'https://images.unsplash.com/photo-1635713792607-ed81197ecad0?w=800&q=80', // State to Region — mountain range
    7: 'https://images.unsplash.com/photo-1582481005114-1e5ce6c4ac0a?w=800&q=80', // Culture Trivia Quiz — cultural abstract (books/history)
};

function generateCertificateId(): string {
    return `CERT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

type CertificateData = { gameTitle: string; score?: string; certName?: string; certId?: string };

type LastResult = { gameTitle: string; score?: string };

const GamesPage = () => {
    const [playerName, setPlayerName] = useState('');
    const [nameSubmitted, setNameSubmitted] = useState(false);
    const [activeGame, setActiveGame] = useState<number | null>(null);
    const [certificate, setCertificate] = useState<CertificateData | null>(null);
    const [lastResult, setLastResult] = useState<LastResult | null>(null);
    const [showCertForm, setShowCertForm] = useState(false);
    const [certFormName, setCertFormName] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadedCerts, setDownloadedCerts] = useState<any[]>(() => {
        try { return JSON.parse(localStorage.getItem('virasat_certs') || '[]'); } catch { return []; }
    });
    const certificateRef = useRef<HTMLDivElement>(null);
    const gameMeta = gamesData.games.find(g => g.id === activeGame);

    const handleStartPlaying = (e: React.FormEvent) => {
        e.preventDefault();
        const name = playerName.trim();
        if (name) setNameSubmitted(true);
    };

    const handleLeaveGame = (score?: string) => {
        // Only show certificate form when user finished the game (left with a score).
        if (gameMeta && score != null && score !== '') {
            setLastResult({ gameTitle: gameMeta.title, score });
            setCertFormName(playerName);
            setShowCertForm(true);
        }
        setActiveGame(null);
    };

    const handleOpenCertificateForDownload = () => {
        if (lastResult) {
            setCertFormName(playerName);
            setShowCertForm(true);
        }
    };

    const handleGenerateCertificate = (e: React.FormEvent) => {
        e.preventDefault();
        setShowCertForm(false);
        const nameToUse = certFormName.trim() || playerName;
        if (lastResult) {
            const newCert = {
                id: generateCertificateId(),
                gameTitle: lastResult.gameTitle,
                score: lastResult.score,
                name: nameToUse,
                date: new Date().toISOString()
            };
            const updated = [newCert, ...downloadedCerts];
            setDownloadedCerts(updated);
            localStorage.setItem('virasat_certs', JSON.stringify(updated));
            setCertificate({ gameTitle: lastResult.gameTitle, score: lastResult.score, certName: nameToUse, certId: newCert.id });
        }
    };

    const handleCertificateClose = () => {
        setCertificate(null);
        setActiveGame(null);
    };

    const handleDownloadCertificate = async () => {
        if (!certificate || isDownloading) return;
        setIsDownloading(true);

        try {
            // Create a high-quality offscreen canvas as the "predefined template"
            const canvas = document.createElement('canvas');
            const width = 1200;
            const height = 800;
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Could not get canvas context");

            // 1. Background
            ctx.fillStyle = '#fefce8'; // Elegant cream background
            ctx.fillRect(0, 0, width, height);

            // 2. Borders
            ctx.lineWidth = 12;
            ctx.strokeStyle = '#1e293b'; // slate-800
            ctx.strokeRect(6, 6, width - 12, height - 12);

            // 3. Tricolour Top
            ctx.fillStyle = '#FF9933';
            ctx.fillRect(12, 12, width / 3 - 4, 16);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(12 + width / 3 - 4, 12, width / 3, 16);
            ctx.fillStyle = '#138808';
            ctx.fillRect(12 + (width / 3) * 2 - 4, 12, width / 3 - 8, 16);

            // 4. Tricolour Bottom
            ctx.fillStyle = '#FF9933';
            ctx.fillRect(12, height - 28, width / 3 - 4, 16);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(12 + width / 3 - 4, height - 28, width / 3, 16);
            ctx.fillStyle = '#138808';
            ctx.fillRect(12 + (width / 3) * 2 - 4, height - 28, width / 3 - 8, 16);

            // Helper for centered text
            const drawText = (text: string, y: number, font: string, color: string = '#1e293b') => {
                ctx.font = font;
                ctx.fillStyle = color;
                ctx.textAlign = 'center';
                ctx.fillText(text, width / 2, y);
            };

            // 5. Official Header
            drawText('GOVERNMENT OF INDIA', 110, 'bold 16px Arial, sans-serif', '#475569');
            drawText('MINISTRY OF CULTURE', 150, 'bold 28px Arial, sans-serif', '#1e293b');
            drawText('Virasat Portal Cultural Archive', 190, 'bold 20px Arial, sans-serif', '#475569');
            drawText('Digital India · Cultural Exploration Platform', 220, '18px Arial, sans-serif', '#64748b');

            // Line separator
            ctx.beginPath();
            ctx.moveTo(350, 260);
            ctx.lineTo(850, 260);
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 6. Certificate Title
            drawText('Certificate of Participation', 340, 'bold 64px "Times New Roman", serif', '#0f172a');

            // 7. Body
            drawText('This is to certify that', 420, 'italic 24px "Times New Roman", serif', '#334155');
            drawText(certificate.certName || playerName, 490, 'bold 56px "Times New Roman", serif', '#0f172a');
            drawText('has successfully completed the game', 560, 'italic 24px "Times New Roman", serif', '#334155');
            drawText(certificate.gameTitle, 620, 'bold 40px "Times New Roman", serif', '#0f172a');

            if (certificate.score != null) {
                drawText(`Score: ${certificate.score}`, 670, '22px Arial, sans-serif', '#475569');
            }

            // 8. Footer (Date and ID)
            const certId = certificate.certId || generateCertificateId();
            const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
            
            ctx.font = '18px Arial, sans-serif';
            ctx.fillStyle = '#64748b';
            ctx.textAlign = 'left';
            ctx.fillText(`Date: ${dateStr}`, 100, 720);
            
            ctx.textAlign = 'right';
            ctx.fillText(`Certificate No.: ${certId}`, width - 100, 720);

            // Directly generate Blob URL and trigger the programmatic click download
            // We use toBlob here because Chrome strictly drops custom filenames for large Base64 Data URLs
            canvas.toBlob((blob) => {
                if (!blob) {
                    setIsDownloading(false);
                    return;
                }
                const objectUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                
                // Format filename: username_game_HHhMMm.png
                const now = new Date();
                const timeStr = `${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}m`;
                const certNameFixed = (certificate?.certName || playerName).replace(/[^a-zA-Z0-9]/g, '_');
                const gameTitleFixed = (certificate?.gameTitle || 'Game').replace(/[^a-zA-Z0-9]/g, '_');
                
                link.download = `${certNameFixed}_${gameTitleFixed}_${timeStr}.png`;
                link.href = objectUrl;
                
                // Append link to body to ensure it clicks successfully in all browsers
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                URL.revokeObjectURL(objectUrl);
                setIsDownloading(false);
            }, 'image/png', 1.0);

        } catch (err) {
            console.error('Failed to generate cert background canvas', err);
            setIsDownloading(false);
        }
    };

    // Name entry screen (before any game) — transparent glassmorphism
    if (!nameSubmitted) {
        return (
            <div className="w-full min-h-full flex flex-col items-center justify-center px-4 sm:px-6 py-12">
                <div
                    className="w-full max-w-md rounded-3xl p-8 sm:p-10 relative overflow-hidden transition-transform duration-300 hover:scale-[1.01] bg-white/40 backdrop-blur-xl border-white/50 shadow-xl"
                >
                    <div className="flex justify-center mb-6">
                        <div
                            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl border border-[var(--color-brand-primary)]/40 bg-[var(--color-brand-primary)]/10"
                        >
                            <User className="w-10 h-10 text-[var(--color-brand-primary)]" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-black text-black text-center mb-2">Enter Your Name</h2>
                    <p className="text-black text-sm text-center mb-6 font-bold uppercase tracking-widest text-[10px]">
                        Your name will appear on your certificate when you complete a game.
                    </p>
                    <form onSubmit={handleStartPlaying} className="space-y-5">
                        <div className="relative">
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                placeholder="Type your name here"
                                className="w-full px-5 py-4 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/60 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 border border-slate-300 bg-slate-50"
                                required
                                minLength={1}
                                maxLength={64}
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-4 rounded-2xl font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:ring-offset-2 focus:ring-offset-transparent bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90 text-white shadow-md shadow-[var(--color-brand-primary)]/20"
                        >
                            Start Playing
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Form before certificate
    if (showCertForm && lastResult) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                <div className="w-full max-w-md bg-white/50 backdrop-blur-xl border-white/60 p-8 rounded-2xl shadow-xl">
                    <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Claim Your Certificate</h3>
                    <p className="text-slate-600 mb-6 text-sm">Enter the details to be printed on your official certificate for completing <strong>{lastResult.gameTitle}</strong>.</p>
                    <form onSubmit={handleGenerateCertificate} className="space-y-4">
                        <div>
                            <label className="block text-slate-700 text-sm font-medium mb-1">Full Name</label>
                            <input required type="text" value={certFormName} onChange={e => setCertFormName(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]" />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button type="button" onClick={() => setShowCertForm(false)} className="flex-1 py-2.5 rounded-xl bg-white/40 backdrop-blur-sm hover:bg-white/60 border border-white/50 text-slate-800 font-medium transition-colors">Cancel</button>
                            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90 text-white font-bold transition-colors">Generate</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // Certificate overlay (after leaving a game) — Virasat Portal / Ministry of Culture style, rectangle, with spacing from navbar
    if (certificate) {
        const certId = certificate.certId || generateCertificateId();
        const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center bg-black/60 backdrop-blur-sm pt-20 sm:pt-28 md:pt-32 pb-6 sm:pb-8 px-3 sm:px-4 overflow-y-auto">
                <div className="w-full max-w-2xl flex flex-col items-center gap-4 sm:gap-6 mt-0">
                    {/* Certificate card — rectangle, no rounded corners */}
                    <div
                        ref={certificateRef}
                        className="w-full bg-[#fefce8] border-4 border-slate-800 shadow-2xl overflow-hidden rounded-none"
                        style={{ minHeight: '420px' }}
                    >
                        {/* Tricolour strip — Government of India */}
                        <div className="flex h-2">
                            <div className="flex-1 bg-[#FF9933]" />
                            <div className="flex-1 bg-white" />
                            <div className="flex-1 bg-[#138808]" />
                        </div>
                        <div className="px-4 sm:px-8 md:px-12 py-4 sm:py-6 md:py-8">
                            {/* Official header — Virasat Portal & Ministry of Culture */}
                            <p className="text-center text-slate-700 text-xs font-semibold tracking-widest uppercase mb-0.5">
                                Government of India
                            </p>
                            <p className="text-center text-slate-800 text-sm font-bold tracking-wide mb-0.5">
                                Ministry of Culture
                            </p>
                            <p className="text-center text-slate-600 text-xs font-medium mb-0.5">
                                Virasat Portal Cultural Archive
                            </p>
                            <p className="text-center text-slate-500 text-xs font-medium mb-6">
                                Digital India · Cultural Exploration Platform
                            </p>
                            {/* Decorative line */}
                            <div className="flex justify-center gap-2 mb-6">
                                <span className="w-12 h-0.5 bg-slate-400" />
                                <Award className="w-6 h-6 text-amber-600 shrink-0" strokeWidth={1.5} />
                                <span className="w-12 h-0.5 bg-slate-400" />
                            </div>
                            <h2 className="text-center text-slate-900 font-serif text-xl sm:text-2xl font-bold tracking-tight mb-6">
                                Certificate of Participation
                            </h2>
                            <p className="text-slate-700 text-center text-sm leading-relaxed mb-4">
                                This is to certify that
                            </p>
                            <p className="text-slate-900 font-serif text-2xl sm:text-3xl font-bold text-center mb-4">
                                {certificate.certName || playerName}
                            </p>
                            <p className="text-slate-700 text-center text-sm leading-relaxed mb-2">
                                has successfully completed the game
                            </p>
                            <p className="text-slate-900 font-serif text-lg sm:text-xl font-semibold text-center mb-6">
                                {certificate.gameTitle}
                            </p>
                            {certificate.score != null && (
                                <p className="text-slate-600 text-center text-sm mb-4">Score: {certificate.score}</p>
                            )}
                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-slate-600 text-xs">
                                <span>Date: {dateStr}</span>
                                <span>Certificate No.: {certId}</span>
                            </div>
                        </div>
                        {/* Bottom border accent */}
                        <div className="flex h-1">
                            <div className="flex-1 bg-[#FF9933]" />
                            <div className="flex-1 bg-white" />
                            <div className="flex-1 bg-[#138808]" />
                        </div>
                    </div>
                    {/* Actions — Download (primary) and Back to Arcade */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                        <button
                            type="button"
                            onClick={handleDownloadCertificate}
                            disabled={isDownloading}
                            className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/70 disabled:cursor-not-allowed text-slate-900 font-semibold shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer"
                        >
                            {isDownloading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating…
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5 shrink-0" />
                                    Download Certificate
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleCertificateClose}
                            className="py-3.5 px-6 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                        >
                            Back to Arcade
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-full overflow-y-auto overflow-x-hidden relative px-3 sm:px-6 py-6 sm:py-8 md:py-12 z-0 bg-transparent">
            <header className="mb-10 md:mb-14 text-center pt-16">
                <div
                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 bg-white/40 backdrop-blur-xl border border-white/50 shadow-sm"
                >
                    <Trophy className="w-10 h-10 text-[var(--color-brand-primary)]" />
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif font-black text-black mb-3 tracking-tight">Play & Learn</h2>
                <p className="text-black max-w-xl mx-auto text-base md:text-lg font-bold opacity-100 uppercase tracking-widest text-[10px]">
                    Test your knowledge about India&apos;s culture with these interactive games.
                </p>
            </header>

            {/* Greeting: Hi, [playerName] */}
            <div className="flex justify-center mb-6">
                <p
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-center bg-white/40 backdrop-blur-xl border-white/50 shadow-md"
                >
                    <span className="text-black text-base sm:text-lg font-black tracking-wide uppercase text-[12px]">Hi,</span>
                    <span
                        className="font-serif text-xl sm:text-2xl font-black text-[var(--color-brand-primary)]"
                    >
                        {playerName}
                    </span>
                </p>
            </div>

            {/* Last score + Download certificate on games list — 3D card */}
            {!activeGame && lastResult && (
                <div
                    className="mb-8 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 p-5 rounded-2xl border border-white/50 bg-white/40 backdrop-blur-xl shadow-lg"
                >
                    <div className="flex items-center gap-2 text-black">
                        <Star className="w-5 h-5 text-amber-500 shrink-0" />
                        <span className="font-black uppercase tracking-widest text-[11px]">Last score:</span>
                        <span className="text-black font-black">{lastResult.gameTitle}</span>
                        {lastResult.score != null && (
                            <span className="text-[var(--color-brand-primary)] font-black">{lastResult.score}</span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleOpenCertificateForDownload}
                        className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold shadow-lg shadow-amber-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                        <Download className="w-5 h-5 shrink-0" />
                        Download certificate
                    </button>
                </div>
            )}

            {activeGame ? (
                <div
                    className="w-full max-w-4xl mx-auto mt-4 md:mt-6 pt-6 sm:pt-8 rounded-3xl p-6 md:p-8 pointer-events-auto relative overflow-hidden bg-white/40 backdrop-blur-2xl border border-white/50 shadow-2xl"
                >
                    <div className="mb-6 flex items-center gap-4">
                        <button
                            type="button"
                            id="game-back-button"
                            onClick={() => handleLeaveGame()}
                            className="p-2.5 rounded-xl bg-white/40 backdrop-blur-md hover:bg-white/60 text-slate-800 transition-colors shrink-0 border border-white/40"
                            aria-label="Back to games list"
                        >
                            <ArrowLeft className="w-5 h-5" aria-hidden />
                        </button>
                        {gameMeta && (
                            <h3 className="text-xl font-black font-serif text-black flex items-center gap-2">
                                {(() => {
                                    const Icon = GAME_ICONS[gameMeta.icon as keyof typeof GAME_ICONS] || Star;
                                    return <Icon className="w-6 h-6 text-[var(--color-brand-primary)]" />;
                                })()}
                                {gameMeta.title}
                            </h3>
                        )}
                    </div>
                    <div className="min-h-[320px]">
                        {activeGame === 1 && <StateOnMapGame onBack={handleLeaveGame} />}
                        {activeGame === 2 && <HeritageSiteBuilderGame onBack={handleLeaveGame} />}
                        {activeGame === 3 && <DanceStateGame onBack={handleLeaveGame} />}
                        {activeGame === 4 && <TimelineOrderGame onBack={handleLeaveGame} />}
                        {activeGame === 5 && <MonumentStateGame onBack={handleLeaveGame} />}
                        {activeGame === 6 && <StateToRegionGame onBack={handleLeaveGame} />}
                        {activeGame === 7 && <VirasatQuizGame onBack={handleLeaveGame} />}
                        {![1, 2, 3, 4, 5, 6, 7].includes(activeGame) && (
                            <PlaceholderGame title="Game" onBack={handleLeaveGame} />
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
                    {gamesData.games.map(game => {
                        const Icon = GAME_ICONS[(game as { icon?: string }).icon as keyof typeof GAME_ICONS] || Star;
                        const bgImage = GAME_BG_IMAGES[game.id];
                        return (
                            <button
                                key={game.id}
                                onClick={() => setActiveGame(game.id)}
                                className="group relative h-48 sm:h-56 rounded-[2rem] overflow-hidden border border-white/40 bg-white/30 backdrop-blur-md text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-white active:scale-95 shadow-lg"
                            >
                                {/* Background Image with Overlay */}
                                {bgImage && (
                                    <div className="absolute inset-0 z-0">
                                        <img 
                                            src={bgImage} 
                                            alt="" 
                                            className="w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-transparent" />
                                    </div>
                                )}
                                
                                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-[var(--color-brand-primary)] group-hover:text-white transition-all duration-300">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-serif font-black text-black leading-tight mb-1 group-hover:text-[var(--color-brand-primary)] transition-colors">
                                            {game.title}
                                        </h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-black/50 group-hover:text-black/80 transition-colors">
                                            {game.difficulty || 'Casual'} · {game.id === 7 ? 'Quiz' : 'Action'}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default GamesPage;
