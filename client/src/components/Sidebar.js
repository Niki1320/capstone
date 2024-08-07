// Sidebar.js
import React, { useState, useEffect } from 'react';
import './Sidebar.css';

const Sidebar = ({ email, onLogout }) => {
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await fetch(`/user-details?email=${email}`);
                const data = await response.json();
                if (data.success) {
                    setUserDetails(data.user);
                } else {
                    console.error('Failed to fetch user details');
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        fetchUserDetails();
    }, [email]);

    return (
        <div className="sidebar">
            <h2>User Info</h2>
            {userDetails ? (
                <div>
                    <p>Email: {userDetails.email}</p>
                    <h3>Plagiarism Checks</h3>
                    <ul>
                        {userDetails.plagiarismChecks.map((check, index) => (
                            <li key={index}>{check.details}</li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>Loading user details...</p>
            )}
            <button onClick={onLogout}>Logout</button>
        </div>
    );
};

export default Sidebar;
