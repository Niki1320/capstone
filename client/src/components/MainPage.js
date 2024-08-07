// MainPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainPage = ({ onLogout }) => {
    const email = localStorage.getItem('userEmail'); // Assuming you store the email in local storage upon login

    return (
        <div className="main-page">
            <Sidebar email={email} onLogout={onLogout} />
            <div className="content">
                <header className="section header-section">
                    <h1>Welcome to the File Upload App</h1>
                    <p>This is some random header text for the application.</p>
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
        </div>
    );
};

export default MainPage;
