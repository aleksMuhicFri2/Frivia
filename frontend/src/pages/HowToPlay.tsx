import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Timer, Lock, Trophy } from "lucide-react";
const HowToPlay = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-background text-foreground p-6 font-pixel">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-foreground hover:text-primary hover:bg-transparent">
            <ArrowLeft className="mr-2" />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl text-glow-red text-right flex-1">HOW TO PLAY</h1>
        </div>

        <div className="space-y-8 fade-in">
          {/* Objective */}
          <section className="border-2 border-primary p-6 rounded-lg bg-card">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="text-primary" size={32} />
              <h2 className="text-xl text-primary">OBJECTIVE</h2>
            </div>
            <p className="text-sm leading-relaxed">
              Answer daily computer science questions correctly as fast as possible. 
              Compete with other FRI students on the leaderboard and prove your knowledge!
            </p>
          </section>

          {/* Game Rules */}
          <section className="border-2 border-primary p-6 rounded-lg bg-card">
            <h2 className="text-xl text-primary mb-4">GAME RULES</h2>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">1.</span>
                <span>You get <strong>ONE question per day</strong>. Make it count!</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">2.</span>
                <span>You have <strong>60 seconds</strong> to answer each question.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">3.</span>
                <span>Type your answer in the text field and press Enter or click Submit.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">4.</span>
                <span>Answers are <strong>case-insensitive</strong> but spelling matters!</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">5.</span>
                <span>Your score is based on <strong>speed</strong> - faster answers = higher score!</span>
              </li>
            </ul>
          </section>

          {/* Timer System */}
          <section className="border-2 border-primary p-6 rounded-lg bg-card">
            <div className="flex items-center gap-3 mb-4">
              <Timer className="text-primary" size={32} />
              <h2 className="text-xl text-primary">TIMER</h2>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              The timer starts as soon as the question appears on screen. You have 60 seconds to answer.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="border border-success p-3 rounded">
                <p className="text-success font-bold text-xs">45-60s</p>
                <p className="text-xs mt-1">Max Pts</p>
              </div>
              <div className="border border-warning p-3 rounded">
                <p className="text-warning font-bold text-xs">20-44s</p>
                <p className="text-xs mt-1">Good Pts</p>
              </div>
              <div className="border border-destructive p-3 rounded">
                <p className="text-destructive font-bold text-xs">0-19s</p>
                <p className="text-xs mt-1">​Low Pts </p>
              </div>
            </div>
          </section>

          {/* Hint System */}
          <section className="border-2 border-primary p-6 rounded-lg bg-card">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="text-primary" size={32} />
              <h2 className="text-xl text-primary">HINTS</h2>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Each question comes with <strong>3 hints</strong> that you can reveal at any time by clicking the "Reveal" button. Using a hint will lower your potential score, so use them wisely.
            </p>
            
            <div className="space-y-4">
              {/* Hint 1 Example */}
              <div className="border border-border p-4 rounded-lg bg-background/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-primary text-xs">HINT 1</span>
                  <span className="text-xs text-muted-foreground">Reveal anytime</span>
                </div>
                <div className="p-3 bg-card border border-success rounded">
                  <p className="text-success text-xs">This data structure uses LIFO principle</p>
                </div>
              </div>

              {/* Hint 2 Example */}
              <div className="border border-border p-4 rounded-lg bg-background/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-primary text-xs">HINT 2</span>
                  <span className="text-xs text-muted-foreground">Reveal anytime</span>
                </div>
                <div className="p-3 bg-card border border-warning rounded">
                  <p className="text-warning text-xs">Think about plates stacked on top</p>
                </div>
              </div>

              {/* Hint 3 Example */}
              <div className="border border-border p-4 rounded-lg bg-background/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-primary text-xs">HINT 3</span>
                  <span className="text-xs text-muted-foreground">Reveal anytime</span>
                </div>
                <div className="p-3 bg-card border border-destructive rounded">
                  <p className="text-destructive text-xs">push() and pop() operations</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/20 rounded border border-muted">
                <p className="text-xs text-muted-foreground">
                💡 <strong>Pro Tip:</strong> Hints reduce your potential score, so try to answer before revealing them!
              </p>
            </div>
          </section>

          {/* Scoring */}
          <section className="border-2 border-primary p-6 rounded-lg bg-card">
            <h2 className="text-xl text-primary mb-4">SCORING</h2>
            <p className="text-sm leading-relaxed mb-4">
              Your score is calculated based on:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-primary">•</span>
                <span><strong>Time remaining</strong> when you answer</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">•</span>
                <span><strong>Number of hints used</strong> (fewer is better)</span>
              </li>
            </ul>
          </section>

          {/* Ready Button */}
          <div className="text-center pt-4 pb-8">
            <Button onClick={() => navigate("/", { state: { autoStart: true } })} size="lg" className="text-sm px-8 glow-red hover:glow-red-strong">
              READY TO PLAY
            </Button>
          </div>
        </div>
      </div>
    </div>;
};
export default HowToPlay;