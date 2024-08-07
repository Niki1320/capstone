import React, { useEffect, useState } from 'react';
import './LoadingAnimation.css';

const LoadingAnimation = () => {
  const operations = [
    'Preprocessing...',
    'Generating Signatures...',
    'Uploading to Server...',
    'Finalizing...'
  ];
  
  const [currentOperation, setCurrentOperation] = useState(operations[0]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % operations.length);
      setCurrentOperation(operations[index]);
    }, 2000); // Change operation every 2 seconds

    return () => clearInterval(interval);
  }, [index]);

  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="operation-text">{currentOperation}</p>
    </div>
  );
};

export default LoadingAnimation;
