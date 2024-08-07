import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginPage = () => {
    const [formType, setFormType] = useState('signin');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        if (path === '/signin') {
            setFormType('signin');
        } else if (path === '/signup') {
            setFormType('signup');
        } else {
            setFormType(null);
        }
    }, [location.pathname]);

    const handleSignIn = async () => {
        const email = document.getElementById('signInEmail').value;
        const password = document.getElementById('signInPassword').value;

        if (validateEmail(email) && password) {
            try {
                const response = await fetch('http://localhost:5000/signin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        localStorage.setItem('isAuthenticated', 'true');
                        navigate('/main'); // Navigate to the main page after successful login
                    } else {
                        alert('Error: ' + result.message);
                    }
                } else {
                    const errorText = await response.text();
                    alert('Error: ' + errorText);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error: ' + error.message);
            }
        } else {
            alert('Please enter a valid email and password.');
        }
    };

    const handleSignUp = async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (validateEmail(email) && password) {
            try {
                const response = await fetch('http://localhost:5000/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        navigate('/signin');
                    } else {
                        alert('Error: ' + result.message);
                    }
                } else {
                    const errorText = await response.text();
                    alert('Error: ' + errorText);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error: ' + error.message);
            }
        } else {
            alert('Please enter a valid email and password.');
        }
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const styles = {
        body: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            margin: 0,
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f4f4f4'
        },
        container: {
            textAlign: 'center'
        },
        loginOptions: {
            position: 'relative'
        },
        button: {
            display: 'block',
            padding: '15px 25px',
            margin: '10px auto',
            fontSize: '16px',
            cursor: 'pointer',
            border: 'none',
            color: '#fff',
            backgroundColor: '#007BFF',
            transition: 'all 0.3s ease'
        },
        signInButton: {
            animation: 'slideInLeft 1s forwards'
        },
        signUpButton: {
            animation: 'slideInRight 1s forwards'
        },
        formContainer: {
            display: formType ? 'flex' : 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center'
        },
        form: {
            background: '#fff',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'left'
        },
        formLabel: {
            display: 'block',
            margin: '10px 0 5px'
        },
        formInput: {
            width: 'calc(100% - 20px)',
            padding: '8px',
            marginBottom: '15px'
        },
        submitButton: {
            display: 'block',
            width: '100%',
            padding: '10px'
        }
    };

    const keyframes = `
        @keyframes slideInLeft {
            to {
                transform: translateX(0);
            }
            from {
                transform: translateX(-100%);
            }
        }
        @keyframes slideInRight {
            to {
                transform: translateX(0);
            }
            from {
                transform: translateX(100%);
            }
        }
    `;

    return (
        <div style={styles.body}>
            <style>{keyframes}</style>
            <div style={styles.container}>
                <div style={styles.loginOptions}>
                    <button
                        onClick={() => navigate('/signin')}
                        style={{ ...styles.button, ...styles.signInButton }}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => navigate('/signup')}
                        style={{ ...styles.button, ...styles.signUpButton }}
                    >
                        Sign Up
                    </button>
                </div>

                {formType === 'signup' && (
                    <div style={styles.formContainer}>
                        <div style={styles.form}>
                            <label htmlFor="email" style={styles.formLabel}>Email ID:</label>
                            <input type="email" id="email" placeholder="Enter your email" required style={styles.formInput} />
                            <label htmlFor="password" style={styles.formLabel}>Password:</label>
                            <input type="password" id="password" placeholder="Enter your password" required style={styles.formInput} />
                            <button onClick={handleSignUp} style={styles.submitButton}>Submit</button>
                        </div>
                    </div>
                )}

                {formType === 'signin' && (
                    <div style={styles.formContainer}>
                        <div style={styles.form}>
                            <label htmlFor="signInEmail" style={styles.formLabel}>Email ID:</label>
                            <input type="email" id="signInEmail" placeholder="Enter your email" required style={styles.formInput} />
                            <label htmlFor="signInPassword" style={styles.formLabel}>Password:</label>
                            <input type="password" id="signInPassword" placeholder="Enter your password" required style={styles.formInput} />
                            <button onClick={handleSignIn} style={styles.submitButton}>Submit</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
