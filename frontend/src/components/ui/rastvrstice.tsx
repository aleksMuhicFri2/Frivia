import { useEffect, useState } from "react";

type Props = {
  score: number;
  highlight?: boolean;
};

const MAX_SCORE = 40;
const ANIMATION_DURATION = 1000; // ms

export const Rastvrstice = ({ score, highlight }: Props) => {
  const [width, setWidth] = useState("0%");
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
  const start = performance.now();
  const step = 2; // šteje po 2: 1,3,5...

  const animate = (now: number) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

    // rast vrstice
    setWidth(`${progress * (score / MAX_SCORE) * 100}%`);

    // retro štetje: 1,3,5,7...
    const rawValue = Math.floor(progress * score);

    let steppedValue = rawValue - (rawValue % step);
    if (steppedValue === 0 && score > 0) {
      steppedValue = 1;
    }

    setDisplayScore(
      steppedValue >= score ? score : steppedValue
    );

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      setDisplayScore(score); // konec vedno točen
    }
  };

  requestAnimationFrame(animate);
}, [score]);


return (
  <div className="flex items-center h-6">
    <div className="relative h-full w-[220px]">

      {/* bar */}
      <div
        className={`h-6 ml-[4px] rounded-r-lg overflow-hidden ${
          highlight ? "bg-red-600" : "bg-neutral-200"
        }`}
        style={{
          width,
          imageRendering: "pixelated"
        }}
      >
        {/* številka na koncu */}
        <span
          className={`absolute top-1/2 -translate-y-1/2 text-sm font-bold tabular-nums ${
            highlight ? "text-red-500" : "text-neutral-200"
          }`}
          style={{
            left: `calc(${width} + 8px)`
          }}
        >
          {displayScore}
        </span>
      </div>
    </div>
  </div>
);



};
