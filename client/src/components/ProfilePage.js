import React, { useEffect, useState } from 'react';

const ProfilePage = ({ userId }) => {
  const [userEmail, setUserEmail] = useState('');
  const [userReports, setUserReports] = useState([]);

  useEffect(() => {
    fetchUserData(userId);
    fetchUserReports(userId);
  }, [userId]);

  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/user/${userId}`);
      const userData = await response.json();
      setUserEmail(userData.email);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUserReports = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/user-reports/${userId}`);
      const reportData = await response.json();
      setUserReports(reportData);
    } catch (error) {
      console.error('Error fetching report history:', error);
    }
  };

  return (
    <div>
      <h1>Profile Page</h1>
      <p>Email: {userEmail}</p>
      <h2>Report History</h2>
      <ul>
        {userReports.map(report => (
          <li key={report.id}>
            <a href={report.reportUrl} target="_blank" rel="noopener noreferrer">
              {report.fileName} (Uploaded on: {new Date(report.date).toLocaleDateString()})
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfilePage;
