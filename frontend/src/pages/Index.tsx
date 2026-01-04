import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Timer, Lightbulb, Play, BarChart3, Lock } from "lucide-react";
import { toast } from "sonner";
import { Rastvrstice } from "@/components/ui/rastvrstice";


type GameState = "home" | "playing" | "playing-answered" | "correct" | "wrong" | "stats" | "gameover";
const mockQuestion = {
  question: "What year was Apple created?",
  correctAnswer: "1976",
  hints: ["Not quite recently", "Not dating back to ancient times", "1976"]
};
const mockLeaderboard = [{
  name: "Janez_Hacker_2000",
  score: 285,
  hints: 0
}, {
  name: "Ana_CS_Queen",
  score: 290,
  hints: 1
}, {
  name: "Luka_AlgoPro",
  score: 295,
  hints: 0
}, {
  name: "Ti",
  score: 0,
  hints: 0
}, {
  name: "Marko_Debug",
  score: 310,
  hints: 2
}];
const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [gameState, setGameState] = useState<GameState>("home");
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [revealedHints, setRevealedHints] = useState<boolean[]>([false, false, false]);
  const [userAnswer, setUserAnswer] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState<"correct" | "wrong" | null>(null);
  
  // Avtomatski začetek igre, če prihaja iz HowToPlay strani
  useEffect(() => {
    if (location.state?.autoStart) {
      startGame();
      // Počisti state
      window.history.replaceState({}, document.title);
    }
  }, []);
  
  useEffect(() => {
    if (gameState === "playing" && timeRemaining > 0 && showAnswerFeedback !== "correct") {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTimeout(() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setGameState("gameover");
                setIsTransitioning(false);
              }, 500);
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, timeRemaining, showAnswerFeedback]);

  // Hints are now available on demand (player can reveal any of the 3 hints at any time)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  const startGame = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setGameState("playing");
      setTimeRemaining(60);
      setHintsRevealed(0);
      setRevealedHints([false, false, false]);
      setUserAnswer("");
      setShowAnswerFeedback(null);
      setIsTransitioning(false);
    }, 500);
  };
  const revealHint = (hintIndex: number) => {
    setRevealedHints(prev => {
      if (prev[hintIndex]) return prev;
      // Preveri, ali so vsi prejšnji hintsnji odklenjeni
      if (hintIndex > 0 && !prev[hintIndex - 1]) {
        toast.error(`Najprej odkleni Hint ${hintIndex}!`);
        return prev;
      }
      const next = [...prev];
      next[hintIndex] = true;
      return next;
    });
    setHintsRevealed(prevCount => prevCount + 1);
  };
  const handleSubmit = () => {
    if (!userAnswer.trim()) return;
    const isCorrect = userAnswer.trim().toLowerCase() === mockQuestion.correctAnswer.toLowerCase();
    if (isCorrect) {      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      // Takoj ustavi timer in pojdi na stats
      setGameState("playing-answered");
      setShowAnswerFeedback("correct");
      setTimeout(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setGameState("stats");
          setIsTransitioning(false);
        }, 500);
      }, 1000);
    } else {
      setShowAnswerFeedback("wrong");
      setTimeout(() => {
        setUserAnswer("");
        setShowAnswerFeedback(null);
      }, 500);
    }
  };
  const viewStats = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setGameState("stats");
      setIsTransitioning(false);
    }, 500);
  };
  return <div className="min-h-screen flex flex-col items-center justify-start px-6 sm:px-8 md:px-12 py-4 font-pixel text-center">
      {/* Fixed Title */}
      <h1 className="text-7xl sm:text-8xl md:text-[9rem] font-extrabold text-white mb-12 animate-pulse leading-none">
        <span className="text-primary text-glow-red">FRI</span>VIA
      </h1>

      {/* Content Area with Slide Animations */}
      <div className="w-full max-w-3xl mb-8">
        {/* Home Screen */}
        {gameState === "home" && <div className={`text-center space-y-8 ${isTransitioning ? "slide-out-left" : "slide-in-right"}`}>
            <p className="text-2xl md:text-3xl font-medium text-white">
              Daily questions.<br />
              Limited hints.<br />
              Compete with others.
            </p>

            <div className="space-y-4 md:space-y-0 md:flex md:flex-row md:items-center md:justify-center md:gap-4">
              <Button onClick={startGame} size="lg" className="w-full max-w-xs h-16 text-xl glow-red hover:glow-red-strong transition-all">
                <Play className="mr-2 h-6 w-6" />
                PLAY
              </Button>

              <Button onClick={() => navigate("/how-to-play")} variant="outline" size="lg" className="w-full max-w-xs h-16 text-xl border-white/100 hover:border-white">
                How To Play
              </Button>
            </div>
          </div>}

        {/* Playing Screen */}
        {gameState === "playing" && <div className={`space-y-6 ${isTransitioning ? "slide-out-left" : "slide-in-right"}`}>
            {/* Question */}
            <div className="text-center text-lg font-semibold mb-8">
              {mockQuestion.question}
            </div>

            {/* Answer Input with >> << decorations */}
            <div className="relative flex items-center justify-center gap-3">
              <span className={`text-2xl transition-all ${showAnswerFeedback === "correct" ? "text-success blink-green" : showAnswerFeedback === "wrong" ? "text-destructive vibrate-red" : "text-muted-foreground"}`}>
                &gt;&gt;
              </span>
                <Input value={userAnswer} onChange={e => setUserAnswer(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} placeholder="Your answer..." className={`h-14 text-lg border-primary/50 focus:border-primary w-full max-w-xl text-center placeholder:text-sm ${showAnswerFeedback === "wrong" ? "text-destructive vibrate-red" : ""}`} disabled={showAnswerFeedback !== null} />
              <span className={`text-2xl transition-all ${showAnswerFeedback === "correct" ? "text-success blink-green" : showAnswerFeedback === "wrong" ? "text-destructive vibrate-red" : "text-muted-foreground"}`}>
                &lt;&lt;
              </span>
            </div>

            {/* Timer Progress Bar */}
            <div className="w-full max-w-2xl mx-auto space-y-2 mt-8">
              <div className="text-center text-sm">
                {formatTime(timeRemaining)}
              </div>
              <div className="h-4 bg-background border-2 border-primary rounded-full overflow-hidden">
                <div className="h-full bg-destructive transition-all duration-1000 ease-linear" style={{
              width: `${timeRemaining / 60 * 100}%`
            }} />
              </div>
            </div>

         {/*Hints*/}
            <div className="space-y-3 mt-8 max-w-2xl mx-auto">
              {[0, 1, 2].map((idx) => {
                const isRevealed = revealedHints[idx];
                const isLocked = idx > 0 && !revealedHints[idx - 1];
                
                return (
                  <div key={idx} className="relative w-full h-14 overflow-hidden rounded-lg">
                    {/* Zaklenjen gumb */}
                    <div 
                      className={`absolute inset-0 border-2 flex items-center px-4 transition-all duration-500 ease-in-out rounded-lg ${
                        isRevealed 
                          ? 'transform translate-x-full opacity-0' 
                          : 'transform translate-x-0 opacity-100'
                      } ${
                        isLocked
                          ? 'bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed'
                          : 'bg-white text-black border-black hover:border-primary cursor-pointer'
                      }`}
                      onClick={() => !isRevealed && !isLocked && revealHint(idx)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm">{`Reveal Hint ${idx + 1}`}</span>
                        <Lock className="h-5 w-5" />
                      </div>
                    </div>
                    
                    {/* Odklenjeno vsebina */}
                    <div 
                      className={`absolute inset-0 border-2 flex items-center px-4 transition-all duration-500 ease-in-out rounded-lg ${
                        isRevealed 
                          ? 'transform translate-x-0 opacity-100' 
                          : 'transform -translate-x-full opacity-0'
                      } bg-black text-white border-white`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <p className="text-sm">{mockQuestion.hints[idx]}</p>
                        <div className="w-5 h-5"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>}

        {/* Game Over Screen */}
        {gameState === "gameover" && <div className={`space-y-6 ${isTransitioning ? "slide-out-left" : "slide-in-right"}`}>
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-2 text-destructive">TIME'S UP!</h2>
              <p className="text-xl text-white mb-8">Better luck next time!</p>
            </div>

            <Card className="p-6 bg-card border-white/30">
              <div className="space-y-4">
                  <div className="text-sm text-white mb-1">The correct answer was:</div>
                  <div className="text-3xl font-normal text-primary">{mockQuestion.correctAnswer}</div>
                <div className="text-center">
                  <div className="text-sm text-white mb-2">Come back tomorrow for a new question!</div>
                </div>
              </div>
            </Card>

            <Card className="p-2 bg-card border-primary/30">
              <div className="space-y-2">
                <div className="text-mm font-bold text-destructive mb-3">Today's results:</div>
                <div className="grid grid-cols-3 gap-4 text-center pb-4 border-b border-white">
                  <div>
                    <div className="text-sm text-white mb-1">Players</div>
                    <div className="text-xl font-normal text-white">105</div>
                  </div>
                  <div>
                    <div className="text-sm text-white mb-1">Avg. Score</div>
                    <div className="text-xl font-normal text-white">3.47</div>
                  </div>
                  <div>
                    <div className="text-sm text-white mb-1">My Rank</div>
                    <div className="text-xl font-normal text-destructive">14.</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {[{
                rank: 1,
                hints: 5,
                score: 11
              }, {
                rank: 2,
                hints: "?",
                score: 17,
                highlight: true
              }, {
                rank: 3,
                hints: 12,
                score: 39
              }, {
                rank: 4,
                hints: 10,
                score: 31
              }, {
                rank: 5,
                hints: 3,
                score: 7
              }].map(player => <div key={player.rank} className="flex items-center gap-4 p-2 rounded">
                      <div className="w-8 text-center font-normal">{player.rank}</div>
                      
                      <Rastvrstice
                        score={player.score}
                        highlight={player.highlight}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Button onClick={() => {
          setIsTransitioning(true);
          setTimeout(() => {
            setGameState("home");
            setIsTransitioning(false);
          }, 500);
        }} variant="outline" size="lg" className="w-full max-w-xs h-16 text-xl border-2 border-white/100 hover:border-white">
              Back to Home
            </Button>
          </div>}

        {/* Stats Screen */}
        {gameState === "stats" && <div className={`space-y-6 text-white ${isTransitioning ? "slide-out-left" : "slide-in-right"}`}>
            <div className="text-center">
              
              <h2 className="font-bold mb-2 text-xl text-red-700">Congratulations!</h2>
            </div>

            <Card className="pt-2 px-6 pb-6 bg-card border-primary/30">​<div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center pb-4 mb-2 border-b border-white items-end -my-2">
                  <div>
                    <div className="text-sm text-white mb-1">Your time</div>
                    <div className="text-xl font-normal text-white">{60 - timeRemaining}s</div>
                  </div>
                  <div>
                    <div className="text-sm text-white mb-1">Your Score</div>
                    <div className="text-xl font-normal text-white">42</div>
                  </div>
                </div>

                <div className="text-mm font-bold text-destructive mb-3">Today's results:</div>
                <div className="grid grid-cols-3 gap-4 text-center pb-4 border-b border-white">
                  <div>
                    <div className="text-sm text-white mb-1">Players</div>
                    <div className="text-xl font-normal text-white">105</div>
                  </div>
                  <div>
                    <div className="text-sm text-white mb-1">Avg. Score</div>
                    <div className="text-xl font-normal text-white">3.47</div>
                  </div>
                  <div>
                    <div className="text-sm text-white mb-1">My Rank</div>
                    <div className="text-xl font-normal text-destructive">14.</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {[{
                rank: 1,
                hints: 5,
                score: 11
              }, {
                rank: 2,
                hints: "?",
                score: 17,
                highlight: true
              }, {
                rank: 3,
                hints: 12,
                score: 39
              }, {
                rank: 4,
                hints: 10,
                score: 31
              }, {
                rank: 5,
                hints: 3,
                score: 7
              }].map(player => <div key={player.rank} className="flex items-center gap-4 p-2 rounded">
                      <div className="w-8 text-center font-normal">{player.rank}</div>
                      
                      <Rastvrstice
                        score={player.score}
                        highlight={player.highlight}
                      />
                    </div>)}
                </div>
              </div>
            </Card>

            <Button onClick={() => {
          setIsTransitioning(true);
          setTimeout(() => {
            setGameState("home");
            setIsTransitioning(false);
          }, 500);
        }} variant="outline" size="lg" className="w-full max-w-xs h-14 text-xl border-2 border-white hover:border-white">
              Back to Home
            </Button>
          </div>}
      </div>
    </div>;
};
export default Index;