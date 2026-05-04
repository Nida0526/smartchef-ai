import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Clock, Flame, Utensils, Trash2, ChefHat, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data } = await API.get('/recipes/history');
            setHistory(data);
        } catch (err) {
            console.error('Failed to fetch history:', err);
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (id) => {
        try {
            await API.delete(`/recipes/history/${id}`);
            setHistory(history.filter(item => item.id !== id));
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-gray-400 text-lg">Loading history...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold"
                    >
                        Recipe <span className="text-[#c9ff32]">History</span>
                    </motion.h1>
                    <p className="text-gray-400 mt-2">Your past AI-generated recipes and cooking sessions</p>
                </div>
                <Link
                    to="/dashboard"
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors glass px-4 py-2"
                >
                    <ArrowLeft size={18} />
                    Back to Kitchen
                </Link>
            </div>

            {/* History List */}
            {history.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-white/5 rounded-[24px] text-gray-500 space-y-4"
                >
                    <ChefHat size={64} strokeWidth={1} />
                    <p className="text-center px-12 text-lg">No recipes yet! Go to the Dashboard and ask SmartChef to cook something.</p>
                    <Link to="/dashboard" className="btn-primary mt-4">
                        Start Cooking
                    </Link>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {history.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass overflow-hidden"
                            >
                                {/* Card Header - always visible */}
                                <div
                                    className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/[0.02] transition-colors"
                                    onClick={() => toggleExpand(item.id)}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-xl bg-[#c9ff32]/10 flex items-center justify-center">
                                            <Utensils size={22} className="text-[#c9ff32]" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold">{item.recipe.title}</h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {formatDate(item.timestamp)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Flame size={14} className="text-orange-400" />
                                                    {item.recipe.calories} kcal
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-2">
                                            {item.ingredients.slice(0, 3).map((ing, i) => (
                                                <span key={i} className="text-xs bg-white/5 px-3 py-1 rounded-full text-gray-300 border border-white/5">
                                                    {ing}
                                                </span>
                                            ))}
                                            {item.ingredients.length > 3 && (
                                                <span className="text-xs bg-white/5 px-3 py-1 rounded-full text-gray-500">
                                                    +{item.ingredients.length - 3}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                            title="Delete recipe"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {expandedId === item.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-5">
                                                {item.recipe.description && (
                                                    <p className="text-gray-400 text-sm italic">{item.recipe.description}</p>
                                                )}

                                                <div>
                                                    <h4 className="text-sm font-bold text-[#c9ff32] uppercase tracking-wider mb-3">Ingredients</h4>
                                                    <ul className="grid grid-cols-2 gap-2">
                                                        {item.recipe.ingredients.map((ing, i) => (
                                                            <li key={i} className="text-gray-300 text-sm flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-[#c9ff32]" />
                                                                {ing}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-bold text-[#c9ff32] uppercase tracking-wider mb-3">Instructions</h4>
                                                    <ol className="space-y-3">
                                                        {item.recipe.instructions.map((step, i) => (
                                                            <li key={i} className="flex gap-3">
                                                                <span className="text-[#c9ff32] font-bold text-sm min-w-[24px]">0{i + 1}</span>
                                                                <p className="text-gray-300 text-sm leading-relaxed">{step}</p>
                                                            </li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

const ChefHatIcon = ({ size, strokeWidth }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 18h12a2 2 0 0 1 2 2v1H4v-1a2 2 0 0 1 2-2z" />
        <path d="M4.5 14.5c-1.5-2.5-1.5-5.5 0-8s4.5-2.5 6-2.5 4.5 0 6 2.5 1.5 5.5 0 8" />
    </svg>
);

export default History;
