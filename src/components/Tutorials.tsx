import { BookOpen, Droplet, Brush, Wind, Sparkles, AlertTriangle, Layers, Maximize } from 'lucide-react';

const PAINT_GUIDES = [
  {
    type: 'Base',
    icon: Layers,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20',
    description: 'High-pigment foundation paints designed to provide a solid, opaque coat over your primer. These are the starting point for your miniature.',
    tips: [
      'Always thin your base paints slightly with water on your palette.',
      'Two thin coats are always better than one thick coat to preserve miniature detail.',
      'You do not need to cover the entire model, just the areas intended for this color.'
    ]
  },
  {
    type: 'Layer',
    icon: Brush,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    borderColor: 'border-green-400/20',
    description: 'Slightly translucent paints with a lower pigment count than Base paints. Designed to be painted over Base paints to build up highlights and color transitions.',
    tips: [
      'Because they are translucent, they are perfect for blending colors.',
      'Use the side of your brush to catch the sharp edges for "edge highlighting".',
      'If you make a mistake, you can always clean it up with the original Base color.'
    ]
  },
  {
    type: 'Shade (Washes)',
    icon: Droplet,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/20',
    description: 'Very thin, water-like paints that naturally flow into the recesses, cracks, and textures of your model. They instantly add artificial shadows and depth.',
    tips: [
      'Do not let the wash pool too heavily on flat surfaces; wick away excess with a clean, dry brush.',
      'Apply them selectively into recesses (pin-washing) or slather them all over for a grimy look.',
      'Washes will typically darken the overall color of the paint underneath them.'
    ]
  },
  {
    type: 'Contrast / Speedpaint',
    icon: Maximize,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    borderColor: 'border-orange-400/20',
    description: 'A revolutionary formula that acts as a basecoat and shade in a single step. It flows heavily into recesses while pulling away from raised edges.',
    tips: [
      'Must be applied over a light-colored, smooth primer (like white, off-white, or light grey).',
      'Apply it heavily and push it around the model before it dries.',
      'Do not go back over an area that has started to dry, or it will tear the paint film and leave coffee-stains.'
    ]
  },
  {
    type: 'Dry',
    icon: Wind,
    color: 'text-stone-400',
    bgColor: 'bg-stone-400/10',
    borderColor: 'border-stone-400/20',
    description: 'Thick, paste-like compounds specifically formulated for the "drybrushing" technique to quickly highlight heavily textured areas like fur, chainmail, and bases.',
    tips: [
      'Load a stiff bristled brush, then wipe almost all the paint off onto a paper towel or texture palette.',
      'Lightly dust the brush back and forth over the textured area; paint will only catch the raised edges.',
      'Drybrushing is notoriously hard on brushes; use cheap makeup brushes or dedicated drybrushes.'
    ]
  },
  {
    type: 'Technical',
    icon: AlertTriangle,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    borderColor: 'border-red-400/20',
    description: 'Specialized paints that create physical textures and visual effects. This category includes crackle paints for bases, glossy blood, rust, and glowing effects.',
    tips: [
      'Crackle paints (like Agrellan Earth) need to be applied very thickly to create large cracks.',
      'Blood paints (like Blood for the Blood God) dry glossy and should be applied as the very last step.',
      'Always use an old, ruined brush for texture paints, as the grit will destroy good bristles.'
    ]
  },
  {
    type: 'Air',
    icon: Sparkles,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
    borderColor: 'border-cyan-400/20',
    description: 'Paints pre-thinned to the perfect consistency for running through an airbrush without clogging, though they can also be used with a regular brush.',
    tips: [
      'When using a regular brush, Air paints act as excellent, smooth glazes right out of the pot.',
      'Even though they are pre-thinned, you may still need a drop of airbrush thinner depending on your nozzle size.',
      'Great for achieving buttery smooth transitions on large panels (like vehicles).'
    ]
  },
  {
    type: 'Metallic',
    icon: Sparkles,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/20',
    description: 'Paints formulated with fine metallic flakes (mica or aluminum) to simulate metals like gold, silver, bronze, and steel.',
    tips: [
      'Metallic flakes can contaminate your water pot; use a separate water cup for metallics.',
      'They generally do not thin well with water; use a specialized metallic medium if thinning is needed.',
      'A black basecoat underneath silver, or a brown basecoat underneath gold, will make the metallics richer.'
    ]
  }
];

export function Tutorials() {
  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center border border-brand-primary/30">
            <BookOpen className="text-brand-primary" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">
              Paint Tutorials & Mechanics
            </h2>
            <p className="text-text-muted text-sm mt-1">
              Understand the different types of paints, their properties, and how to use them effectively.
            </p>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {PAINT_GUIDES.map((guide, index) => {
            const Icon = guide.icon;
            return (
              <div 
                key={index} 
                className={`bg-bg-surface border border-border rounded-2xl overflow-hidden hover:border-brand-primary/50 transition-colors flex flex-col`}
              >
                <div className={`p-4 flex items-center gap-3 border-b border-border ${guide.bgColor}`}>
                  <div className={`p-2 rounded-lg bg-bg-dark border ${guide.borderColor}`}>
                    <Icon size={20} className={guide.color} />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-wide">{guide.type}</h3>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-text-primary text-sm leading-relaxed mb-6">
                    {guide.description}
                  </p>
                  
                  <div className="mt-auto">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">
                      Pro Tips
                    </h4>
                    <ul className="space-y-2">
                      {guide.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-text-muted flex gap-2 items-start">
                          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-current ${guide.color}`} />
                          <span className="leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-2">The Standard Painting Workflow</h3>
          <p className="text-text-muted text-sm mb-4">While rules are made to be broken, the traditional Citadel/Warhammer painting methodology usually follows this order:</p>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center text-center">
            <div className="flex-1 bg-bg-dark p-4 rounded-xl border border-border w-full">
              <span className="text-brand-primary font-bold text-lg block mb-1">1. Prime</span>
              <span className="text-xs text-text-muted">Spray can or airbrush</span>
            </div>
            <div className="text-border hidden md:block">➔</div>
            <div className="flex-1 bg-bg-dark p-4 rounded-xl border border-border w-full">
              <span className="text-blue-400 font-bold text-lg block mb-1">2. Base</span>
              <span className="text-xs text-text-muted">Establish flat colors</span>
            </div>
            <div className="text-border hidden md:block">➔</div>
            <div className="flex-1 bg-bg-dark p-4 rounded-xl border border-border w-full">
              <span className="text-purple-400 font-bold text-lg block mb-1">3. Shade</span>
              <span className="text-xs text-text-muted">Add deep shadows</span>
            </div>
            <div className="text-border hidden md:block">➔</div>
            <div className="flex-1 bg-bg-dark p-4 rounded-xl border border-border w-full">
              <span className="text-green-400 font-bold text-lg block mb-1">4. Layer</span>
              <span className="text-xs text-text-muted">Restore highlights</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
