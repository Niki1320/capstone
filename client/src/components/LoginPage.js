import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const LoginPage = () => {
  const [formType, setFormType] = useState(null);
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
            localStorage.setItem('userId', result.userId);
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
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;

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
      display: 'none',
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
    },
    slideInLeft: {
      to: {
        transform: 'translateX(0)'
      },
      from: {
        transform: 'translateX(-100%)'
      }
    },
    slideInRight: {
      to: {
        transform: 'translateX(0)'
      },
      from: {
        transform: 'translateX(100%)'
      }
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        {!formType ? (
          <div style={styles.loginOptions}>
            <Link to="/signin">
              <button style={{ ...styles.button, ...styles.signInButton }}>Sign In</button>
            </Link>
            <Link to="/signup">
              <button style={{ ...styles.button, ...styles.signUpButton }}>Sign Up</button>
            </Link>
          </div>
        ) : formType === 'signin' ? (
          <div style={{ ...styles.formContainer, display: 'flex' }}>
            <div style={styles.form}>
              <h2>Sign In</h2>
              <label htmlFor="signInEmail" style={styles.formLabel}>Email</label>
              <input type="email" id="signInEmail" placeholder="Email" style={styles.formInput} />
              <label htmlFor="signInPassword" style={styles.formLabel}>Password</label>
              <input type="password" id="signInPassword" placeholder="Password" style={styles.formInput} />
              <button style={styles.submitButton} onClick={handleSignIn}>Sign In</button>
            </div>
          </div>
        ) : formType === 'signup' ? (
          <div style={{ ...styles.formContainer, display: 'flex' }}>
            <div style={styles.form}>
              <h2>Sign Up</h2>
              <label htmlFor="signUpEmail" style={styles.formLabel}>Email</label>
              <input type="email" id="signUpEmail" placeholder="Email" style={styles.formInput} />
              <label htmlFor="signUpPassword" style={styles.formLabel}>Password</label>
              <input type="password" id="signUpPassword" placeholder="Password" style={styles.formInput} />
              <button style={styles.submitButton} onClick={handleSignUp}>Sign Up</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default LoginPage;
