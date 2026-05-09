import { useMemo, useState } from 'react';
import { usePaintStore } from '../store/usePaintStore';
import { PaintCard } from './PaintCard';

const WHEEL_COLORS = [
  { name: 'Red', hex: '#FF0000', angle: 0 },
  { name: 'Red-Orange', hex: '#FF4500', angle: 30 },
  { name: 'Orange', hex: '#FFA500', angle: 60 },
  { name: 'Yellow-Orange', hex: '#FFD700', angle: 90 },
  { name: 'Yellow', hex: '#FFFF00', angle: 120 },
  { name: 'Yellow-Green', hex: '#ADFF2F', angle: 150 },
  { name: 'Green', hex: '#008000', angle: 180 },
  { name: 'Blue-Green', hex: '#00CED1', angle: 210 },
  { name: 'Blue', hex: '#0000FF', angle: 240 },
  { name: 'Blue-Violet', hex: '#8A2BE2', angle: 270 },
  { name: 'Violet', hex: '#EE82EE', angle: 300 },
  { name: 'Red-Violet', hex: '#C71585', angle: 330 },
];

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function colorDistance(hex1: string, hex2: string) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
}

type HarmonyMode = 'complementary' | 'triadic' | 'analogous' | 'split' | 'square' | 'tetradic' | 'clash' | 'diadic' | 'hexadic';

export function ColorWheel() {
  const { paints } = usePaintStore();
  const [selectedColor, setSelectedColor] = useState(WHEEL_COLORS[0]);
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>('complementary');

  const matches = useMemo(() => {
    return [...paints]
      .sort((a, b) => colorDistance(a.hex, selectedColor.hex) - colorDistance(b.hex, selectedColor.hex))
      .slice(0, 6);
  }, [paints, selectedColor]);

  const harmonyColors = useMemo(() => {
    const angles = {
      complementary: [180],
      triadic: [120, 240],
      analogous: [-30, 30],
      split: [150, 210],
      square: [90, 180, 270],
      tetradic: [60, 180, 240],
      clash: [90],
      diadic: [60],
      hexadic: [60, 120, 180, 240, 300],
    };

    return angles[harmonyMode].map(offset => {
      const targetAngle = (selectedColor.angle + offset + 360) % 360;
      return WHEEL_COLORS.find(c => c.angle === targetAngle) || WHEEL_COLORS[0];
    });
  }, [selectedColor, harmonyMode]);

  const harmonyMatches = useMemo(() => {
    return harmonyColors.map(color => ({
      color,
      paints: [...paints]
        .sort((a, b) => colorDistance(a.hex, color.hex) - colorDistance(b.hex, color.hex))
        .slice(0, 6)
    }));
  }, [paints, harmonyColors]);

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Strategic Color Theory</h2>
        <p className="text-text-muted text-sm mt-1">Master the spectrum. Select a base color and a harmony theory to unlock perfect schemes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Wheel Side */}
        <div className="flex flex-col items-center p-8 bg-bg-surface rounded-2xl border border-border relative overflow-hidden h-fit">
           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--color-brand-primary)_0%,_transparent_70%)] pointer-events-none" />
           
           <div className="mb-8 flex flex-wrap justify-center gap-2 relative z-10">
            {(['complementary', 'triadic', 'analogous', 'split', 'square', 'tetradic', 'clash', 'diadic', 'hexadic'] as HarmonyMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setHarmonyMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                  harmonyMode === mode 
                    ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20' 
                    : 'bg-white/5 text-text-muted border-white/10 hover:bg-white/10'
                }`}
              >
                {mode}
              </button>
            ))}
           </div>

           <svg width="340" height="340" viewBox="0 0 400 400" className="relative z-10 drop-shadow-2xl">
            {WHEEL_COLORS.map((color, i) => {
              const startAngle = (color.angle - 15) * (Math.PI / 180);
              const endAngle = (color.angle + 15) * (Math.PI / 180);
              const x1 = 200 + 150 * Math.cos(startAngle);
              const y1 = 200 + 150 * Math.sin(startAngle);
              const x2 = 200 + 150 * Math.cos(endAngle);
              const y2 = 200 + 150 * Math.sin(endAngle);
              
              const isSelected = selectedColor.angle === color.angle;
              const isHarmony = harmonyColors.some(hc => hc.angle === color.angle);

              return (
                <path
                  key={color.name}
                  d={`M 200 200 L ${x1} ${y1} A 150 150 0 0 1 ${x2} ${y2} Z`}
                  fill={color.hex}
                  stroke={isSelected ? 'white' : isHarmony ? 'white' : 'transparent'}
                  strokeWidth={isSelected ? 4 : isHarmony ? 2 : 0}
                  strokeDasharray={isHarmony ? "4 2" : "0"}
                  className="cursor-pointer hover:scale-105 origin-center transition-all duration-300"
                  onClick={() => setSelectedColor(color)}
                />
              );
            })}
            <circle cx="200" cy="200" r="65" fill="var(--color-bg-surface)" className="shadow-inner" />
            <text x="200" y="195" textAnchor="middle" dy=".3em" fill="white" className="text-xs font-black uppercase tracking-widest italic">
              {selectedColor.name}
            </text>
            <text x="200" y="215" textAnchor="middle" dy=".3em" fill="var(--color-text-muted)" className="text-[8px] uppercase tracking-[0.2em]">
              Primary
            </text>
          </svg>

          <div className="mt-8 flex gap-3 w-full">
            <div className="flex-1 p-3 rounded-xl border border-white/5 bg-white/5 text-center">
              <span className="text-[8px] uppercase tracking-widest text-text-muted block mb-1.5">Base</span>
              <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: selectedColor.hex }} />
            </div>
            {harmonyColors.map((hc, idx) => (
              <div key={idx} className="flex-1 p-3 rounded-xl border border-white/5 bg-white/5 text-center">
                <span className="text-[8px] uppercase tracking-widest text-text-muted block mb-1.5">Harmonic</span>
                <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: hc.hex }} />
              </div>
            ))}
          </div>
        </div>

        {/* Results Side */}
        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-3 mb-6">
               <div className="w-1.5 h-6 bg-brand-primary rounded-full shadow-[0_0_10px_var(--color-brand-primary)]" />
               <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">Base Matches</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {matches.map(paint => (
                <PaintCard key={paint.id} paint={paint} />
              ))}
            </div>
          </section>

          {harmonyMatches.map((hm, idx) => (
            <section key={idx} className="animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-1.5 h-6 bg-brand-accent rounded-full shadow-[0_0_10px_var(--color-brand-accent)]" />
                 <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">
                   {harmonyMode} {idx + 1} ({hm.color.name})
                 </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {hm.paints.map(paint => (
                  <PaintCard key={paint.id} paint={paint} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
