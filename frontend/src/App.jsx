import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import ToastProvider from './components/ui/ToastProvider';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Preferences from './pages/Preferences';
import SavedRecipes from './pages/SavedRecipes';
import Generator from './pages/Generator';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [token]);

  return (
    <Router>
      <ToastProvider>
        <ErrorBoundary>
          {token && <Navbar setToken={setToken} />}
          <Routes>
            <Route path="/login" element={token ? <Navigate to="/" /> : <Login setToken={setToken} />} />
            <Route path="/register" element={token ? <Navigate to="/" /> : <Register setToken={setToken} />} />
            <Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/generator" element={token ? <Generator /> : <Navigate to="/login" />} />
            <Route path="/preferences" element={token ? <Preferences /> : <Navigate to="/login" />} />
            <Route path="/saved" element={token ? <SavedRecipes /> : <Navigate to="/login" />} />
          </Routes>
        </ErrorBoundary>
      </ToastProvider>
    </Router>
  );
}

export default App;