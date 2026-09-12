import { Sparkles, Mic, Timer } from 'lucide-react';
import { FryingPan, CookingPot, UtensilsArt } from './ui/KitchenArt';

export default function AuthHero() {
  return (
    <div className="auth-hero">
      <div className="auth-hero-art">
        <FryingPan className="art-pan" />
        <CookingPot className="art-pot" />
        <UtensilsArt className="art-utensils" />
      </div>
      <div className="auth-hero-copy">
        <h2>Your kitchen's smartest sous-chef</h2>
        <ul className="auth-features">
          <li><Sparkles size={16} /> Scan your fridge with AI vision</li>
          <li><Mic size={16} /> Talk to your recipes hands-free</li>
          <li><Timer size={16} /> Voice-guided cooking with timers</li>
        </ul>
      </div>
    </div>
  );
}