import { useState } from 'react';
import { PlayCircle, Trophy, Star } from 'lucide-react';
import gamesData from '../data/games.json';

const GamesPage = () => {
    const [activeGame, setActiveGame] = useState<number | null>(null);

    return (
        <div className="w-full h-full overflow-y-auto px-6 py-8 md:p-12">
            <header className="mb-12 text-center">
                <h2 className="text-4xl md:text-5xl font-serif text-[var(--color-accent-amber)] mb-4 drop-shadow-md">Play & Learn</h2>
                <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                    Test your knowledge about India's culture through these kid-friendly interactive games.
                </p>
            </header>

            {activeGame ? (
                <div className="w-full max-w-4xl mx-auto bg-black/40 border border-white/20 rounded-3xl p-8 backdrop-blur-md animate-[mapFocus_800ms_ease-in-out]">
                    <div className="w-full aspect-video bg-black/60 rounded-2xl border-4 border-[var(--color-accent-cyan)] flex items-center justify-center relative overflow-hidden">
                        {/* Placeholder Game Interface */}
                        <div className="text-center">
                            <Star className="w-20 h-20 text-[var(--color-accent-amber)] mx-auto mb-6 animate-pulse" />
                            <h3 className="text-3xl font-bold font-sans text-white mb-2">Game Ready</h3>
                            <p className="text-gray-400">Placeholder mechanics waiting for data integration.</p>
                        </div>

                        {/* Animated particles */}
                        <div className="absolute inset-0 pointer-events-none opacity-20">
                            <div className="absolute top-10 left-10 w-4 h-4 rounded-full bg-white animate-ping" />
                            <div className="absolute bottom-20 right-20 w-3 h-3 rounded-full bg-[var(--color-accent-magenta)] animate-ping" style={{ animationDelay: '0.5s' }} />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={() => setActiveGame(null)}
                            className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-colors font-medium text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-amber)]"
                        >
                            ← Back to Arcade
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {gamesData.games.map(game => (
                        <button
                            key={game.id}
                            onClick={() => setActiveGame(game.id)}
                            className="group text-left p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[var(--color-accent-cyan)] transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-cyan)] relative overflow-hidden"
                        >
                            {/* Decorative background shape */}
                            <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20 blur-2xl group-hover:blur-3xl transition-all ${game.color}`} />

                            <div className="flex justify-between items-start mb-6">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-xs font-semibold tracking-wide text-gray-300 backdrop-blur-sm">
                                    <Trophy className="w-3.5 h-3.5" />
                                    {game.type}
                                </span>
                                <span className={`text-sm font-bold ${game.difficulty === 'Easy' ? 'text-emerald-400' :
                                    game.difficulty === 'Medium' ? 'text-orange-400' : 'text-red-400'
                                    }`}>
                                    {game.difficulty}
                                </span>
                            </div>

                            <h3 className="text-3xl font-sans font-bold text-white mb-2">{game.title}</h3>

                            <div className="mt-8 flex items-center gap-2 text-[var(--color-accent-cyan)] font-medium group-hover:text-white transition-colors">
                                <PlayCircle className="w-6 h-6" />
                                Play Now
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GamesPage;
