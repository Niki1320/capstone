import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import './MainPage.css';

const MainPage = () => {
    return (
        <div className="main-page">
            <header className="header-section">
                <h1>Spectral Inspector</h1>
                <p>Your gateway to audio analysis and comparison.</p>
                <Link to="/profile" className="profile-icon">
                    <FaUserCircle size={40} />
                </Link>
            </header>
            <div className="section-container">
                <div className="section music-library-section left-aligned">
                    <div className="text-content">
                        <h2>Music Library</h2>
                        <p>Want a demo tour into how this works? Check out our curated library!</p>
                    </div>
                    <div className="button-content">
                        <Link to="/music-library">
                            <button className="main-button">Go to Music Library</button>
                        </Link>
                    </div>
                </div>
                <div className="section audio-signature-section right-aligned">
                    <div className="button-content">
                        <Link to="/one-file-upload">
                            <button className="main-button">Start Matching</button>
                        </Link>
                    </div>
                    <div className="text-content">
                        <h2>Audio Signature Matching</h2>
                        <p>Enter an MP3 clip to check for accidental plagiarism</p>
                    </div>
                </div>
                <div className="section pair-compare-section left-aligned">
                    <div className="text-content">
                        <h2>Pair Compare</h2>
                        <p>Enter two MP3 clips to compare their similarity</p>
                    </div>
                    <div className="button-content">
                        <Link to="/two-file-upload">
                            <button className="main-button">Compare Now</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;
