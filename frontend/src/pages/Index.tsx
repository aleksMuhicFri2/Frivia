import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Timer, Lightbulb, Play, BarChart3, Lock } from "lucide-react";
import { toast } from "sonner";
type GameState = "home" | "playing" | "correct" | "wrong" | "stats" | "gameover";
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
  const [gameState, setGameState] = useState<GameState>("home");
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [hintsAvailable, setHintsAvailable] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState<"correct" | "wrong" | null>(null);
  useEffect(() => {
    if (gameState === "playing" && timeRemaining > 0) {
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
  }, [gameState, timeRemaining]);

  // Track available hints based on timer
  useEffect(() => {
    if (gameState === "playing") {
      if (timeRemaining <= 45 && hintsAvailable < 1) {
        setHintsAvailable(1);
      } else if (timeRemaining <= 30 && hintsAvailable < 2) {
        setHintsAvailable(2);
      } else if (timeRemaining <= 15 && hintsAvailable < 3) {
        setHintsAvailable(3);
      }
    }
  }, [gameState, timeRemaining, hintsAvailable]);
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
      setHintsAvailable(0);
      setUserAnswer("");
      setShowAnswerFeedback(null);
      setIsTransitioning(false);
    }, 500);
  };
  const revealHint = (hintIndex: number) => {
    if (hintIndex < hintsAvailable && hintIndex >= hintsRevealed) {
      setHintsRevealed(hintIndex + 1);
    }
  };
  const handleSubmit = () => {
    if (!userAnswer.trim()) return;
    const isCorrect = userAnswer.trim().toLowerCase() === mockQuestion.correctAnswer.toLowerCase();
    if (isCorrect) {
      setShowAnswerFeedback("correct");
      setTimeout(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setGameState("stats");
          setIsTransitioning(false);
        }, 500);
      }, 5000);
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
  return <div className="min-h-screen flex flex-col items-center justify-start px-6 sm:px-8 md:px-12 py-4 pt-16 font-pixel text-center">
      {/* Fixed Title */}
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-glow-red mb-12 animate-pulse fixed top-4">
        FRIVIA
      </h1>

      {/* Content Area with Slide Animations */}
      <div className="w-full max-w-3xl mt-32">
        {/* Home Screen */}
        {gameState === "home" && <div className={`text-center space-y-8 ${isTransitioning ? "slide-out-left" : "slide-in-right"}`}>
            <p className="text-xl text-muted-foreground">
              Daily questions.<br />
              Limited hints.<br />
              Compete with others.
            </p>

            <div className="space-y-4">
              <Button onClick={startGame} size="lg" className="w-full max-w-xs h-16 text-xl glow-red hover:glow-red-strong transition-all">
                <Play className="mr-2 h-6 w-6" />
                PLAY
              </Button>

              <Button onClick={() => navigate("/how-to-play")} variant="outline" size="lg" className="w-full max-w-xs h-14 text-lg border-primary/50 hover:border-primary">
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

            {/* Hints */}
            <div className="space-y-3 mt-8">
            {[{
            idx: 0,
            unlockTime: 45
          }, {
            idx: 1,
            unlockTime: 30
          }, {
            idx: 2,
            unlockTime: 15
          }].map(({
            idx,
            unlockTime
          }) => <div key={idx} className="relative">
                  {hintsRevealed > idx ? <div className="p-4 bg-background border border-border rounded fade-in">
                      <p className="text-muted-foreground">{mockQuestion.hints[idx]}</p>
                    </div> : hintsAvailable > idx ? <Button onClick={() => revealHint(idx)} variant="outline" className="w-full p-4 h-auto border-primary/50 hover:border-primary">
                      <div className="flex items-center justify-between w-full">
                        <span>Unlock Hint {idx + 1}</span>
                        <Lock className="h-5 w-5" />
                      </div>
                    </Button> : <div className="w-full p-4 bg-card border border-border rounded relative overflow-hidden opacity-50">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Hint {idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Available at {unlockTime}s</span>
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>}
                </div>)}
            </div>
          </div>}

        {/* Game Over Screen */}
        {gameState === "gameover" && <div className={`space-y-6 ${isTransitioning ? "slide-out-left" : "slide-in-right"}`}>
            <div className="text-center">
              <div className="text-6xl mb-4">​</div>
              <h2 className="text-4xl font-bold mb-2 text-destructive">TIME'S UP!</h2>
              <p className="text-xl text-muted-foreground mb-8">Better luck next time!</p>
            </div>

            <Card className="p-6 bg-card border-destructive/30">
              <div className="space-y-4">
                <div className="text-center pb-4 border-b border-border">
                  <div className="text-sm text-muted-foreground mb-1">The correct answer was:</div>
                  <div className="text-3xl font-bold text-primary">{mockQuestion.correctAnswer}</div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Come back tomorrow for a new question!</div>
                </div>
              </div>
            </Card>

            <Button onClick={() => {
          setIsTransitioning(true);
          setTimeout(() => {
            setGameState("home");
            setIsTransitioning(false);
          }, 500);
        }} variant="outline" size="lg" className="w-full h-12 border-primary/50 hover:border-primary">
              Back to Home
            </Button>
          </div>}

        {/* Stats Screen */}
        {gameState === "stats" && <div className={`space-y-6 ${isTransitioning ? "slide-out-left" : "slide-in-right"}`}>
            <div className="text-center">
              
              <h2 className="font-bold mb-2 text-xl text-red-700">Congratulations!</h2>
              <p className="text-xl text-muted-foreground mb-8">Your stats:</p>
            </div>

            <Card className="p-6 bg-card border-primary/30">​<div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center pb-4 mb-4 border-b border-border items-end my-0">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Games</div>
                    <div className="text-2xl font-bold">13</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Avg. Score</div>
                    <div className="text-xl font-bold">3.35</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Avg. Time</div>
                    <div className="text-xl font-bold">17.5s</div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground mb-2">Today's results:</div>
                <div className="grid grid-cols-3 gap-4 text-center pb-4 border-b border-border">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Players</div>
                    <div className="text-xl font-bold my-[25px]">105</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Avg. Score</div>
                    <div className="text-xl font-bold">3.47</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">My Rank</div>
                    <div className="text-xl font-bold text-primary">14.</div>
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
              }].map(player => <div key={player.rank} className={`flex items-center gap-4 p-2 rounded ${player.highlight ? "bg-primary/20 border border-primary" : ""}`}>
                      <div className="w-8 text-center font-bold">{player.rank}</div>
                      <div className="flex-1 h-8 bg-background border border-border rounded overflow-hidden">
                        <div className={`h-full ${player.highlight ? "bg-primary" : "bg-muted"}`} style={{
                    width: `${player.rank === 2 ? 30 : Math.random() * 60 + 20}%`
                  }} />
                      </div>
                      <div className="w-12 text-right font-bold">{player.score}</div>
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
        }} variant="outline" size="lg" className="w-full h-12 border-primary/50 hover:border-primary">
              Back to Home
            </Button>
          </div>}
      </div>
    </div>;
};
export default Index;