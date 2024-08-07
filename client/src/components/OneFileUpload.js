import React, { useState } from 'react';
import axios from 'axios';
import './OneFileUpload.css';
import jsPDF from 'jspdf';

const OneFileUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [similarSongs, setSimilarSongs] = useState([]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
  
    const formData = new FormData();
    formData.append('file', file);
  
    setLoading(true);
    setStage(1); // Preprocessing...
  
    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      // Update state with the response data
      setSimilarSongs(response.data.similarClips);
      setStage(3); // Comparing with Database...
      setLoading(false);
      setReportGenerated(true);
    } catch (error) {
      console.error('Error uploading file:', error);
      setLoading(false);
    }
  };
  

  const handleGenerateReport = () => {
    const doc = new jsPDF();
    doc.text('Audio Signature Matching Report', 10, 10);
    similarSongs.forEach((song, index) => {
      doc.text(`${index + 1}. ${song.song_name} - ${song.artist} - ${song.album} - ${song.similarity_score}`, 10, 20 + (index * 10));
    });
    doc.save('report.pdf');
  };

  return (
    <div className="container">
      <h1>Audio Signature Matching</h1>
      <div className="file-input">
        <label>
          <input type="file" accept=".mp3" onChange={handleFileChange} style={{ display: 'none' }} />
          <button onClick={() => document.querySelector('input[type="file"]').click()}>Select File</button>
        </label>
      </div>
      {file && <p>Selected file: {file.name}</p>}
      <div>
        <button onClick={handleUpload}>Check Plagiarism</button>
      </div>
      {loading && (
        <div className="loading-stages">
          {stage === 1 && (
            <div className="stage">
              <div className="loading-bar"></div>
              <p>Preprocessing...</p>
            </div>
          )}
          {stage === 2 && (
            <div className="stage">
              <div className="hash-animation"></div>
              <p>Generating Signature...</p>
            </div>
          )}
          {stage === 3 && (
            <div className="stage">
              <div className="drum-animation"></div>
              <p>Comparing with Database...</p>
            </div>
          )}
        </div>
      )}
      {!loading && reportGenerated && (
        <div className="results">
          <h2>Similar Songs</h2>
          {similarSongs.map((song, index) => (
            <div key={index} className="song">
              <div className="song-info">
                <p className="song-title">{song.song_name} - {song.artist} - {song.album}</p>
                <p className="similarity-score">Similarity Score: {song.similarity_score}</p>
              </div>
              <audio controls>
                <source src={song.path} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
            </div>
          ))}
          <button onClick={handleGenerateReport}>Generate Report</button>
        </div>
      )}
    </div>
  );
};

export default OneFileUpload;
