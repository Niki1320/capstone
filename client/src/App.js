import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import TwoFileUpload from './components/TwoFileUpload';
import OneFileUpload from './components/OneFileUpload';
import MusicLibrary from './components/MusicLibrary';
import LoginPage from './components/LoginPage';
import MainPage from './components/MainPage';
import './App.css';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');

    useEffect(() => {
        const checkAuth = () => {
            const authStatus = localStorage.getItem('isAuthenticated') === 'true';
            setIsAuthenticated(authStatus);
        };

        window.addEventListener('storage', checkAuth);
        checkAuth(); // Check authentication on initial load

        return () => {
            window.removeEventListener('storage', checkAuth);
        };
    }, []);

    const handleLogout = () => {
        localStorage.setItem('isAuthenticated', 'false');
        setIsAuthenticated(false);
    };

    return (
        <div className="App">
            <Routes>
                <Route path="/signin" element={<LoginPage />} />
                <Route path="/" element={isAuthenticated ? <Navigate to="/main" /> : <Navigate to="/signin" />} />
                {isAuthenticated ? (
                    <>
                        <Route path="/two-file-upload" element={<TwoFileUpload />} />
                        <Route path="/one-file-upload" element={<OneFileUpload />} />
                        <Route path="/music-library" element={<MusicLibrary />} />
                        <Route path="/main" element={<MainPage onLogout={handleLogout} />} />
                        <Route path="*" element={<Navigate to="/main" />} />
                    </>
                ) : (
                    <Route path="*" element={<Navigate to="/signin" />} />
                )}
            </Routes>
        </div>
    );
};

const AppWithRouter = () => (
    <Router>
        <App />
    </Router>
);

export default AppWithRouter;
