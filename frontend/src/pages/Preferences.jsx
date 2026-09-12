import { useState, useEffect } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { preferencesApi } from '../lib/api';
import { useToast } from '../context/ToastContext';
import Input, { TagInput } from '../components/ui/Input';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';

const DIET_OPTIONS = [
  { value: 'none', label: 'No restrictions', emoji: '🍽️' },
  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
  { value: 'keto', label: 'Keto', emoji: '🥑' },
  { value: 'paleo', label: 'Paleo', emoji: '🥩' }
];

export default function Preferences() {
  const { notify } = useToast();
  const [dietType, setDietType] = useState('none');
  const [allergies, setAllergies] = useState([]);
  const [cuisine, setCuisine] = useState([]);
  const [calorieGoal, setCalorieGoal] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await preferencesApi.get();
        if (res.data) {
          setDietType(res.data.dietType || 'none');
          setAllergies(res.data.allergies || []);
          setCuisine(res.data.cuisine || []);
          setCalorieGoal(res.data.calorieGoal || '');
        }
      } catch {
        notify('Could not load preferences', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [notify]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await preferencesApi.update({
        dietType,
        allergies,
        cuisine,
        calorieGoal: Number(calorieGoal) || null
      });
      notify('Preferences saved!', 'success');
    } catch {
      notify('Failed to save preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrap">
        <div className="glass-panel">
          <Skeleton height="28px" width="50%" style={{ marginBottom: 16 }} />
          <Skeleton height="16px" width="80%" style={{ marginBottom: 24 }} />
          <Skeleton height="120px" radius="12px" style={{ marginBottom: 16 }} />
          <Skeleton height="48px" radius="12px" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <div className="glass-panel preferences-panel">
        <div className="pref-header">
          <UtensilsCrossed size={20} className="pref-icon" />
          <div>
            <h2>Long-Term Memory</h2>
            <p className="pref-subtitle">These preferences shape every recipe suggestion SmartChef makes for you.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <fieldset>
            <legend>Diet Type</legend>
            <div className="diet-cards">
              {DIET_OPTIONS.map(opt => (
                <label key={opt.value} className={`diet-card ${dietType === opt.value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="diet"
                    value={opt.value}
                    checked={dietType === opt.value}
                    onChange={() => setDietType(opt.value)}
                    className="sr-only"
                  />
                  <span className="diet-emoji">{opt.emoji}</span>
                  <span className="diet-label">{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Allergies</legend>
            <TagInput
              tags={allergies}
              onChange={setAllergies}
              placeholder="Type an allergy and press Enter (e.g. peanuts)"
            />
          </fieldset>

          <fieldset>
            <legend>Preferred Cuisines</legend>
            <TagInput
              tags={cuisine}
              onChange={setCuisine}
              placeholder="Add cuisines you love (e.g. Italian)"
            />
          </fieldset>

          <Input
            label="Calorie Goal per Meal"
            id="cal-goal"
            type="number"
            min={0}
            max={5000}
            placeholder="e.g. 600 kcal"
            value={calorieGoal}
            onChange={e => setCalorieGoal(e.target.value)}
            hint="Optional — leave empty for no limit"
          />

          <Button type="submit" loading={saving} disabled={saving} style={{ marginTop: '1rem' }}>
            Save Preferences
          </Button>
        </form>
      </div>
    </div>
  );
}