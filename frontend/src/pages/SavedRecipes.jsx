import { useState, useEffect } from 'react';
import { Trash2, ChevronDown, ChefHat, Utensils } from 'lucide-react';
import { savedApi } from '../lib/api';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import CookMode from '../components/CookMode';
import { extractSteps } from '../utils/recipeSteps';
import { UtensilsArt } from '../components/ui/KitchenArt';

function RecipeCard({ recipe, onDelete, onCook }) {
  const [expanded, setExpanded] = useState(false);
  const preview = recipe.instructions?.[0] || 'No details stored.';
  const isLong = preview.length > 220;
  const display = expanded ? preview : isLong ? preview.slice(0, 220) + '…' : preview;

  return (
    <div className="recipe-card glass-panel">
      <div className="recipe-card-header">
        <div className="recipe-card-icon"><ChefHat size={20} /></div>
        <div className="recipe-card-info">
          <h3>{recipe.title}</h3>
          <span className="recipe-date">{new Date(recipe.savedAt).toLocaleDateString()}</span>
        </div>
        <button
          className="recipe-delete"
          onClick={() => onDelete(recipe._id)}
          aria-label="Delete recipe"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="recipe-card-body">
        <pre className="recipe-text">{display}</pre>
        {isLong && (
          <button className="recipe-toggle" onClick={() => setExpanded(e => !e)}>
            {expanded ? 'Show less' : 'Show full recipe'} <ChevronDown size={14} style={{ transform: expanded ? 'rotate(180deg)' : undefined }} />
          </button>
        )}
      </div>

      <div className="recipe-card-actions">
        <button className="btn-recipe" onClick={() => onCook(recipe)}>
          <Utensils size={14} /> Start Cooking
        </button>
      </div>
    </div>
  );
}

export default function SavedRecipes() {
  const { notify } = useToast();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cooking, setCooking] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await savedApi.list();
        setRecipes(res.data);
      } catch {
        notify('Could not load recipes', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [notify]);

  const handleDelete = async (id) => {
    try {
      await savedApi.remove(id);
      setRecipes(r => r.filter(x => x._id !== id));
      notify('Recipe deleted', 'success');
    } catch {
      notify('Failed to delete recipe', 'error');
    }
  };

  if (loading) {
    return (
      <div className="page-wrap">
        <h2 className="page-title">Saved Recipes</h2>
        <div className="recipe-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-panel recipe-card">
              <Skeleton height="24px" width="60%" radius="8px" style={{ marginBottom: 12 }} />
              <Skeleton height="14px" width="30%" style={{ marginBottom: 16 }} />
              <Skeleton height="100px" radius="8px" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <h2 className="page-title">Saved Recipes</h2>
      {recipes.length === 0 ? (
        <EmptyState
          icon={<UtensilsArt className="empty-art" />}
          title="No recipes saved yet"
          description="Chat with SmartChef to discover and save recipes."
        />
      ) : (
        <div className="recipe-grid">
          {recipes.map(r => (
            <RecipeCard key={r._id} recipe={r} onDelete={handleDelete} onCook={setCooking} />
          ))}
        </div>
      )}

      {cooking && (
        <CookMode
          recipe={{ title: cooking.title, steps: extractSteps(cooking.instructions?.[0]) }}
          onClose={() => setCooking(null)}
        />
      )}
    </div>
  );
}