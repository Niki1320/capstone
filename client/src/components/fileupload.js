import React, { useState } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import './fileupload.css';

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    setLoading(true);

    try {
      // Simulate a 2-second loading time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(response.data.message);
      setFiles([]); // Clear files after successful upload
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>File Upload</h1>

      <div className="file-input">
        <label>
          <input type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
          <button onClick={() => document.querySelector('input[type="file"]').click()}>Select Two Files</button>
        </label>
      </div>

      <div className="file-input">
        <label>
          <input type="file" onChange={handleFileChange} style={{ display: 'none' }} />
          <button onClick={() => document.querySelector('input[type="file"]').click()}>Select One File</button>
        </label>
      </div>

      <div>
        <button onClick={handleUpload}>Upload Files</button>
      </div>

      {loading && (
        <div id="loading">
          <ClipLoader size={80} color="#4fa94d" loading={loading} />
        </div>
      )}

      <div id="selected-files" className={files.length > 0 ? '' : 'hidden'}>
        <h3>Selected Files:</h3>
        <ul id="file-list">
          {files.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;