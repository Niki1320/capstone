import React, { useState } from 'react';
import axios from 'axios';
import './TwoFileUpload.css';
import jsPDF from 'jspdf';

const TwoFileUpload = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [similarSongs, setSimilarSongs] = useState([]);

  const handleFileChange = (event) => {
    setFiles([...event.target.files]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    setLoading(true);
    setStage(1);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStage(2);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStage(3);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStage(4);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStage(5);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setLoading(false);
      setReportGenerated(true);
      setSimilarSongs([
        { name: "Song C", similarity: "80%", path: "songA.mp3" },
        { name: "Song D", similarity: "75%", path: "songB.mp3" },
      ]);
    } catch (error) {
      console.error('Error uploading files:', error);
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    const doc = new jsPDF();
    doc.text('Audio Signature Matching Report', 10, 10);
    similarSongs.forEach((song, index) => {
      doc.text(`${index + 1}. ${song.name} - ${song.similarity}`, 10, 20 + (index * 10));
    });
    doc.save('report.pdf');
  };

  return (
    <div className="container">
      <h1>Pair and Compare</h1>
      <div className="file-input">
        <label>
          <input type="file" accept=".mp3" multiple onChange={handleFileChange} style={{ display: 'none' }} />
          <button onClick={() => document.querySelector('input[type="file"]').click()}>Select Files</button>
        </label>
      </div>
      {files.length > 0 && (
        <p>Selected files: {files.map((file) => file.name).join(', ')}</p>
      )}
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
              <div className="loading-bar"></div>
              <p>Comparing...</p>
            </div>
          )}
          {stage === 3 && (
            <div className="stage">
              <div className="hash-animation"></div>
              <p>Our Models Analyzing...</p>
            </div>
          )}
          {stage === 4 && (
            <div className="stage">
              <div className="drum-animation"></div>
              <p>Almost Done...</p>
            </div>
          )}
        </div>
      )}
      {!loading && reportGenerated && (
        <div>
          <h2>Similar Songs</h2>
          {similarSongs.map((song, index) => (
            <div key={index} className="song">
              <p>{song.name} - {song.similarity}</p>
              <audio controls>
                <source src={song.path} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
            </div>
          ))}
          <button onClick={handleGenerateReport}>View Report</button>
        </div>
      )}
    </div>
  );
};

export default TwoFileUpload;
