import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = ({ userId, setIsAuthenticated }) => {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]); 
  const [pairReports, setPairReports] = useState([]);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/user/${userId}`);
        setUser(response.data);
      } catch (err) {
        setError('Failed to fetch user details.');
      }
    };

    const fetchUserReports = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/user-reports/${userId}`);
        if (Array.isArray(response.data.reports)) {
          setReports(response.data.reports);
        } else {
          setError('Unexpected response format for user reports.');
        }
      } catch (err) {
        setError('Failed to fetch report history.');
      }
    };

    const fetchPairReports = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/user-reports/${userId}`);
        if (response.data && Array.isArray(response.data.pairReports)) {
          setPairReports(response.data.pairReports);
        } else {
          setError('Unexpected response format for pair comparison reports.');
        }
      } catch (err) {
        setError('Failed to fetch pair comparison reports.');
      }
    };

    fetchUserDetails();
    fetchUserReports();
    fetchPairReports();
  }, [userId]);

  const handleSignOut = () => {
    try {
      // Clear tokens and authentication flags
      localStorage.removeItem('userToken');
      localStorage.removeItem('isAuthenticated');
      sessionStorage.clear();

      // Clear cookies
      document.cookie.split(";").forEach((cookie) => {
        document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/");
      });

      setIsAuthenticated(false); // Update the authentication state
      navigate('/'); // Redirect to login page
    } catch (error) {
      console.error("Failed to sign out, please try again.", error);
      setError("Failed to sign out, please try again.");
    }
  };

  if (error) {
    return <div className="profile-page__error">{error}</div>;
  }

  if (!user) {
    return <div className="profile-page__loading">Loading user details...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-page__details">
        <h2>User Profile</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <button className="sign-out-button" onClick={handleSignOut}>Sign Out</button>
      </div>

      <div className="profile-page__report-columns">
        <div className="profile-page__report-history">
          <h3>Signature Matching Reports</h3>
          <ul>
            {reports.length > 0 ? reports.map((report) => (
              <li key={report.id}>
                <a href={report.reportUrl} target="_blank" rel="noopener noreferrer">
                  {report.fileName} - {new Date(report.date).toLocaleString()}
                </a>
              </li>
            )) : <li>No reports available.</li>}
          </ul>
        </div>

        <div className="profile-page__report-history">
          <h3>Pair Comparison Reports</h3>
          <ul>
            {pairReports.length > 0 ? pairReports.map((report) => (
              <li key={report.id}>
                <a href={report.reportUrl} target="_blank" rel="noopener noreferrer">
                  {report.fileName} - {new Date(report.date).toLocaleString()}
                </a>
              </li>
            )) : <li>No pair comparison reports available.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
