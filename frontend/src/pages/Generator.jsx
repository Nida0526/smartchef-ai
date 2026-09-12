import { useRef, useState } from 'react';
import { Camera, Sparkles, Minus, Plus, UploadCloud, ImageOff, RefreshCcw, ChefHat, Clock, Flame, Dumbbell, Carrot, Droplet, Utensils } from 'lucide-react';
import { recipeApi, savedApi } from '../lib/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import { TagInput } from '../components/ui/Input';
import Skeleton from '../components/ui/Skeleton';
import CookMode from '../components/CookMode';
import { UtensilsArt } from '../components/ui/KitchenArt';

const DIET_OPTIONS = ['Vegetarian', 'Vegan', 'Keto', 'Pescatarian', 'Gluten-Free', 'Low-Carb'];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const comma = result.indexOf(',');
      resolve({ base64: result.slice(comma + 1), mimeType: file.type || 'image/jpeg' });
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

function VisionScan({ onDetect }) {
  const { notify } = useToast();
  const inputRef = useRef(null);
  const [image, setImage] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('Please choose an image file', 'error');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      notify('Image must be under 8 MB', 'error');
      return;
    }
    setResult(null);
    const { base64, mimeType } = await readFileAsBase64(file);
    setImage({ base64, mimeType, preview: URL.createObjectURL(file), name: file.name });
  };

  const analyze = async () => {
    if (!image || analyzing) return;
    setAnalyzing(true);
    try {
      const res = await recipeApi.vision(image.base64, image.mimeType);
      setResult(res.data?.data || null);
    } catch {
      notify('Failed to analyze image', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <section className="gen-section glass-panel">
      <div className="gen-section-head">
        <span className="gen-icon"><Camera size={18} /></span>
        <div>
          <h3>Scan your fridge</h3>
          <p className="gen-subtitle">Take a photo of your fridge, pantry, or ingredients — SmartChef will detect them.</p>
        </div>
      </div>

      {!image ? (
        <div
          className={`dropzone ${dragging ? 'dropzone-over' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        >
          <UploadCloud size={34} />
          <p><strong>Drop an image here</strong> or click to browse</p>
          <span className="dropzone-hint">JPG, PNG, WEBP · max 8 MB</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={e => handleFile(e.target.files?.[0])}
          />
        </div>
      ) : (
        <div className="vision-preview">
          <div className="vision-thumb">
            <img src={image.preview} alt="Fridge preview" />
            <button className="vision-reset" onClick={reset} aria-label="Remove image">
              <ImageOff size={16} />
            </button>
          </div>

          {!result ? (
            <div className="vision-actions">
              <span className="vision-filename">{image.name}</span>
              <div className="vision-btns">
                <Button variant="ghost" size="sm" onClick={reset}>Remove</Button>
                <Button size="sm" onClick={analyze} loading={analyzing} disabled={analyzing}>
                  {!analyzing && <Sparkles size={14} />} Analyze
                </Button>
              </div>
            </div>
          ) : (
            <div className="vision-result">
              <div className="vision-result-head">
                <h4>Detected ingredients</h4>
                <Button variant="ghost" size="sm" onClick={analyze} loading={analyzing} disabled={analyzing}>
                  {!analyzing && <RefreshCcw size={13} />} Re-analyze
                </Button>
              </div>
              <div className="ing-chips">
                {(result.detectedIngredients || []).map(ing => (
                  <div key={ing.name} className="ing-tile">
                    <span className="ing-name">{ing.name}</span>
                    {ing.estimatedQuantity && <span className="ing-meta">{ing.estimatedQuantity}</span>}
                    {ing.freshness && <span className={`ing-fresh ing-fresh-${(ing.freshness || '').toLowerCase().includes('soon') ? 'soon' : 'ok'}`}>{ing.freshness}</span>}
                  </div>
                ))}
              </div>
              {(result.suggestedCuisines || []).length > 0 && (
                <div className="cuisine-row">
                  <span className="cuisine-label">Suggested cuisines:</span>
                  <div className="chip-toggle-wrap">
                    {result.suggestedCuisines.map(c => (
                      <span key={c} className="chip-toggle chip-toggle-static">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              <Button
                size="sm"
                className="gen-seed"
                onClick={() => onDetect((result.detectedIngredients || []).map(i => i.name))}
              >
                <Sparkles size={14} /> Generate recipes with these
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function RecipeCard({ recipe, onCook }) {
  const { notify } = useToast();
  const [saving, setSaving] = useState(false);

  const difficultyClass = {
    Easy: 'diff-easy',
    Medium: 'diff-medium',
    Hard: 'diff-hard'
  }[recipe.difficulty] || 'diff-medium';

  const handleSave = async () => {
    setSaving(true);
    try {
      const text = [
        `### ${recipe.title}`,
        recipe.description,
        `Prep: ${recipe.prepTime} · Cook: ${recipe.cookTime}`,
        '',
        '**Ingredients**',
        ...recipe.usedIngredients.map(i => `- ${i}`),
        ...(recipe.pantryStaplesNeeded || []).map(i => `- ${i} (pantry staple)`),
        '',
        '**Instructions**',
        ...(recipe.instructions || []).map((s, i) => `${i + 1}. ${s}`)
      ].join('\n');
      await savedApi.create({ title: recipe.title, ingredients: recipe.usedIngredients, instructions: [text] });
      notify('Recipe saved!', 'success');
    } catch {
      notify('Failed to save recipe', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="recipe-result-card">
      <div className="recipe-result-top">
        <span className={`difficulty-badge ${difficultyClass}`}>{recipe.difficulty}</span>
        <h4>{recipe.title}</h4>
        <p className="recipe-result-desc">{recipe.description}</p>
        <div className="recipe-times">
          <span><Clock size={13} /> Prep {recipe.prepTime}</span>
          <span><Flame size={13} /> Cook {recipe.cookTime}</span>
        </div>
      </div>

      {recipe.macros && (
        <div className="macro-grid">
          <div className="macro-item"><Flame size={15} /><span>{recipe.macros.calories ?? '—'}</span><em>cal</em></div>
          <div className="macro-item"><Dumbbell size={15} /><span>{recipe.macros.proteinGrams ?? '—'}g</span><em>protein</em></div>
          <div className="macro-item"><Carrot size={15} /><span>{recipe.macros.carbsGrams ?? '—'}g</span><em>carbs</em></div>
          <div className="macro-item"><Droplet size={15} /><span>{recipe.macros.fatGrams ?? '—'}g</span><em>fat</em></div>
        </div>
      )}

      <div className="recipe-result-body">
        {recipe.usedIngredients?.length > 0 && (
          <div className="chip-group">
            <span className="chip-group-label">Ingredients used</span>
            <div className="chip-toggle-wrap">
              {recipe.usedIngredients.map(i => <span key={i} className="chip-toggle chip-toggle-static">{i}</span>)}
            </div>
          </div>
        )}
        {recipe.pantryStaplesNeeded?.length > 0 && (
          <div className="chip-group">
            <span className="chip-group-label">Pantry staples</span>
            <div className="chip-toggle-wrap">
              {recipe.pantryStaplesNeeded.map(i => <span key={i} className="chip-toggle chip-toggle-static chip-muted">{i}</span>)}
            </div>
          </div>
        )}
        {recipe.instructions?.length > 0 && (
          <ol className="instructions-list">
            {recipe.instructions.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        )}
      </div>

      <div className="recipe-result-actions">
        <Button variant="ghost" size="sm" onClick={handleSave} loading={saving} disabled={saving}>
          {!saving && <ChefHat size={14} />} Save Recipe
        </Button>
        <Button size="sm" onClick={() => onCook(recipe)}>
          <Utensils size={14} /> Start Cooking
        </Button>
      </div>
    </article>
  );
}

export default function Generator() {
  const { notify } = useToast();
  const [ingredients, setIngredients] = useState([]);
  const [diets, setDiets] = useState([]);
  const [prepTime, setPrepTime] = useState(20);
  const [servings, setServings] = useState(2);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState(null);
  const [cooking, setCooking] = useState(null);
  const resultsRef = useRef(null);

  const toggleDiet = (d) => {
    setDiets(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const seedIngredients = (names) => {
    const merged = Array.from(new Set([...ingredients, ...names]));
    setIngredients(merged);
    notify('Ingredients added — review & generate!', 'success');
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const generate = async () => {
    if (ingredients.length === 0) {
      notify('Add at least one ingredient', 'error');
      return;
    }
    setGenerating(true);
    setResults(null);
    try {
      const res = await recipeApi.generate({
        ingredients,
        dietaryRestrictions: diets,
        maxPrepTimeMinutes: prepTime,
        servings,
        recipeCount: 2
      });
      setResults(res.data?.data?.recipes || []);
    } catch {
      notify('Failed to generate recipes', 'error');
    } finally {
      setGenerating(false);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  };

  return (
    <div className="page-wrap gen-wrap">
      <VisionScan onDetect={seedIngredients} />

      <section className="gen-section glass-panel" ref={resultsRef}>
        <div className="gen-section-head">
          <span className="gen-icon"><Sparkles size={18} /></span>
          <div>
            <h3>Recipe Generator</h3>
            <p className="gen-subtitle">Pick your ingredients and constraints — get two tailored recipes instantly.</p>
          </div>
        </div>

        <div className="gen-form">
          <div className="gen-field">
            <label>Ingredients</label>
            <TagInput
              tags={ingredients}
              onChange={setIngredients}
              placeholder="Type an ingredient and press Enter (e.g. chicken)"
            />
          </div>

          <div className="gen-field">
            <label>Dietary restrictions</label>
            <div className="chip-toggle-wrap">
              {DIET_OPTIONS.map(d => (
                <button
                  key={d}
                  type="button"
                  className={`chip-toggle ${diets.includes(d) ? 'active' : ''}`}
                  onClick={() => toggleDiet(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="gen-field-row">
            <div className="gen-field gen-slider-field">
              <label>Max prep time <strong>{prepTime} min</strong></label>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={prepTime}
                onChange={e => setPrepTime(Number(e.target.value))}
                className="slider"
              />
              <div className="slider-labels"><span>5</span><span>60 min</span></div>
            </div>

            <div className="gen-field gen-servings-field">
              <label>Servings</label>
              <div className="stepper">
                <button type="button" onClick={() => setServings(s => Math.max(1, s - 1))} aria-label="Decrease servings">
                  <Minus size={15} />
                </button>
                <span>{servings}</span>
                <button type="button" onClick={() => setServings(s => Math.min(12, s + 1))} aria-label="Increase servings">
                  <Plus size={15} />
                </button>
              </div>
            </div>
          </div>

          <Button onClick={generate} loading={generating} disabled={generating} className="gen-generate">
            {!generating && <Sparkles size={16} />} Generate Recipes
          </Button>
        </div>
      </section>

      {(generating || results) ? (
        <section className="gen-results">
          {generating ? (
            <>
              <Skeleton height="240px" radius="16px" />
              <Skeleton height="240px" radius="16px" />
            </>
          ) : (
            <div className="result-grid">
              {results.map((r, i) => <RecipeCard key={`${r.title}-${i}`} recipe={r} onCook={setCooking} />)}
            </div>
          )}
        </section>
      ) : (
        <section className="gen-placeholder glass-panel">
          <UtensilsArt className="gen-placeholder-art" />
          <p>Add ingredients above and hit <strong>Generate Recipes</strong> — your tailored options will appear here.</p>
        </section>
      )}

      {cooking && (
        <CookMode
          recipe={{ title: cooking.title, steps: cooking.instructions || [] }}
          onClose={() => setCooking(null)}
        />
      )}
    </div>
  );
}