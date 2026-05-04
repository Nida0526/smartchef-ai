import React, { useState } from 'react';
import API from '../services/api';
import { Search, Plus, X, Utensils, Zap, Clock, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const [ingredients, setIngredients] = useState([]);
    const [currentInput, setCurrentInput] = useState('');
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const addIngredient = (e) => {
        e.preventDefault();
        if (currentInput && !ingredients.includes(currentInput)) {
            setIngredients([...ingredients, currentInput]);
            setCurrentInput('');
        }
    };

    const removeIngredient = (ing) => {
        setIngredients(ingredients.filter(i => i !== ing));
    };

    const generateRecipe = async () => {
        if (ingredients.length === 0) return;
        setLoading(true);
        setError('');
        try {
            const { data } = await API.post('/recipes/generate', { ingredients });
            setRecipe(data);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'The AI Agent is busy. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12">
            <header className="text-center space-y-4">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-bold"
                >
                    What's in your <span className="text-[#c9ff32]">Kitchen?</span>
                </motion.h1>
                <p className="text-gray-400 text-lg">Input your ingredients and let our Agentic AI craft a personalized masterpiece.</p>
            </header>

            <div className="grid lg:grid-cols-2 gap-12">
                {/* Input Section */}
                <div className="space-y-8">
                    <div className="glass p-8 space-y-6">
                        <form onSubmit={addIngredient} className="space-y-4">
                            <label className="block text-lg font-semibold">Add Ingredients</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    className="input-field pr-16" 
                                    placeholder="e.g. Tomato, Spinach, Garlic..."
                                    value={currentInput}
                                    onChange={(e) => setCurrentInput(e.target.value)}
                                />
                                <button 
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#c9ff32] text-black rounded-lg"
                                >
                                    <Plus size={24} />
                                </button>
                            </div>
                        </form>

                        <div className="flex flex-wrap gap-3 min-h-[100px] items-start">
                            <AnimatePresence>
                                {ingredients.map(ing => (
                                    <motion.span 
                                        key={ing}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm border border-white/5"
                                    >
                                        {ing}
                                        <X size={14} className="cursor-pointer hover:text-red-400" onClick={() => removeIngredient(ing)} />
                                    </motion.span>
                                ))}
                            </AnimatePresence>
                            {ingredients.length === 0 && <p className="text-gray-500 italic text-sm">No ingredients added yet...</p>}
                        </div>

                        <button 
                            onClick={generateRecipe}
                            disabled={ingredients.length === 0 || loading}
                            className={`btn-primary w-full justify-center py-4 text-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <Zap className="animate-pulse" size={24} />
                            ) : (
                                <>
                                    <Search size={24} />
                                    Ask SmartChef Agent
                                </>
                            )}
                        </button>
                    </div>

                    {error && <p className="text-red-400 text-center">{error}</p>}
                </div>

                {/* Output Section */}
                <div className="min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {recipe ? (
                            <motion.div 
                                key="recipe"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="glass p-10 space-y-8"
                            >
                                <div className="space-y-2">
                                    <span className="text-[#c9ff32] text-sm font-bold tracking-widest uppercase">Chef's Suggestion</span>
                                    <h2 className="text-4xl font-bold">{recipe.title}</h2>
                                </div>

                                <div className="flex gap-6 border-y border-white/10 py-6">
                                    <div className="flex items-center gap-2">
                                        <Flame className="text-orange-400" size={20} />
                                        <span className="text-sm font-medium">{recipe.calories} kcal</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="text-blue-400" size={20} />
                                        <span className="text-sm font-medium">Ready in 25m</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Utensils className="text-[#c9ff32]" size={20} />
                                        <span className="text-sm font-medium">Medium Skill</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold mb-3">Ingredients</h3>
                                        <ul className="grid grid-cols-2 gap-2">
                                            {recipe.ingredients.map((item, idx) => (
                                                <li key={idx} className="text-gray-400 text-sm flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#c9ff32]" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold mb-3">Instructions</h3>
                                        <ol className="space-y-4">
                                            {recipe.instructions.map((step, idx) => (
                                                <li key={idx} className="flex gap-4">
                                                    <span className="text-[#c9ff32] font-bold">0{idx + 1}</span>
                                                    <p className="text-gray-300 text-sm leading-relaxed">{step}</p>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[24px] text-gray-600 space-y-4"
                            >
                                <ChefHat size={64} strokeWidth={1} />
                                <p className="text-center px-12">Your personalized recipe will appear here once the Agent finishes reasoning.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const ChefHat = ({ size, strokeWidth }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M6 18h12a2 2 0 0 1 2 2v1H4v-1a2 2 0 0 1 2-2z" />
        <path d="M4.5 14.5c-1.5-2.5-1.5-5.5 0-8s4.5-2.5 6-2.5 4.5 0 6 2.5 1.5 5.5 0 8" />
        <path d="M10 18v-5" />
        <path d="M14 18v-5" />
    </svg>
);

export default Dashboard;
