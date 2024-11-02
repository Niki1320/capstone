import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import TwoFileUpload from './components/TwoFileUpload';
import OneFileUpload from './components/OneFileUpload';
import MusicLibrary from './components/MusicLibrary';
import LoginPage from './components/LoginPage';
import ProfilePage from './components/ProfilePage';
import MainPage from './components/MainPage'; // Import your new MainPage component
import './App.css';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
    const userId = localStorage.getItem('userId');

    return (
        <Router>
            <div className="App">
                <Routes>
                    {!isAuthenticated ? (
                        <>
                            <Route path="/" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
                            <Route path="/signin" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
                            <Route path="/signup" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </>
                    ) : (
                        <>
                            <Route path="/" element={<Navigate to="/main" />} />
                            <Route path="/two-file-upload" element={<TwoFileUpload userId={userId} />} />
                            <Route path="/one-file-upload" element={<OneFileUpload userId={userId} />} />
                            <Route path="/music-library" element={<MusicLibrary />} />
                            <Route path="/profile" element={<ProfilePage userId={userId} setIsAuthenticated={setIsAuthenticated} />} />
                            <Route path="/main" element={<MainPage />} />
                            <Route path="*" element={<Navigate to="/main" />} />
                        </>
                    )}
                </Routes>
            </div>
        </Router>
    );
};

export default App;
