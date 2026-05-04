import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, ChefHat, User as UserIcon, History, Search } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center glass px-8 py-3">
                <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                    <ChefHat className="text-[#c9ff32]" size={32} />
                    <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        SmartChef AI
                    </span>
                </Link>

                <div className="flex items-center gap-6">
                    {user ? (
                        <>
                            {/* Navigation Links */}
                            <div className="flex items-center gap-1">
                                <Link
                                    to="/dashboard"
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        isActive('/dashboard')
                                            ? 'bg-[#c9ff32]/10 text-[#c9ff32] border border-[#c9ff32]/20'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Search size={16} />
                                    Kitchen
                                </Link>
                                <Link
                                    to="/history"
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        isActive('/history')
                                            ? 'bg-[#c9ff32]/10 text-[#c9ff32] border border-[#c9ff32]/20'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <History size={16} />
                                    History
                                </Link>
                            </div>

                            {/* User Info */}
                            <div className="flex items-center gap-3 glass px-4 py-2 text-sm font-medium">
                                <UserIcon size={18} className="text-[#c9ff32]" />
                                <span>{user.name}</span>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
                            >
                                <LogOut size={20} />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-4">
                            <Link to="/login" className="text-gray-300 hover:text-white font-medium">Login</Link>
                            <Link to="/register" className="btn-primary py-2 px-6 text-sm">Get Started</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
