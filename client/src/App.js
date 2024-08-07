import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import TwoFileUpload from './components/TwoFileUpload';
import OneFileUpload from './components/OneFileUpload';
import MusicLibrary from './components/MusicLibrary';
import LoginPage from './components/LoginPage';
import ProfilePage from './components/ProfilePage';
import './App.css';

const App = () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userId = localStorage.getItem('userId');

    return (
        <Router>
            <div className="App">
                <Routes>
                    {!isAuthenticated ? (
                        <>
                            <Route path="/" element={<LoginPage />} />
                            <Route path="/signin" element={<LoginPage />} />
                            <Route path="/signup" element={<LoginPage />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </>
                    ) : (
                        <>
                            <Route path="/" element={<Navigate to="/main" />} />
                            <Route path="/two-file-upload" element={<TwoFileUpload userId={userId} />} />
                            <Route path="/one-file-upload" element={<OneFileUpload userId={userId} />} />
                            <Route path="/music-library" element={<MusicLibrary />} />
                            <Route path="/profile" element={<ProfilePage userId={userId} />} />
                            <Route path="/main" element={
                                <div className="main-page">
                                    <header className="section header-section">
                                        <h1>Welcome to the Plagarism Detection App</h1>
                                        <p>This is some random header text for the application.</p>
                                        <div className="profile-link">
                                            <Link to="/profile">
                                                <button>Profile</button>
                                            </Link>
                                        </div>
                                    </header>
                                    <div className="section button-section">
                                        <Link to="/music-library">
                                            <button>Music Library</button>
                                        </Link>
                                    </div>
                                    <div className="section button-section">
                                        <Link to="/two-file-upload">
                                            <button>Pair and Compare</button>
                                        </Link>
                                    </div>
                                    <div className="section button-section">
                                        <Link to="/one-file-upload">
                                            <button>Audio Signature Matching</button>
                                        </Link>
                                    </div>
                                </div>
                            } />
                            <Route path="*" element={<Navigate to="/main" />} />
                        </>
                    )}
                </Routes>
            </div>
        </Router>
    );
};

export default App;
