import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { motion } from 'framer-motion';
import './LoginPage.css';

const LoginPage = ({ setIsAuthenticated }) => {
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('userId', result.userId);
                    setIsAuthenticated(true); // Update global authentication state
                    navigate('/main'); // Redirect to main page
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
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

  return (
    <div className="login-page">
      {/* Welcome Section */}
      <section className="welcome-section text-center">
        <h1>Welcome to Spectral Inspector</h1>
        <h3>Your go-to solution for advanced music plagiarism detection</h3>
      </section>

      {/* New Information Section with Animation */}
      <motion.section
        className="safety-section text-center"
        initial={{ opacity: 0, y: 50 }} // Initial state
        whileInView={{ opacity: 1, y: 0 }} // Animate to this state when in view
        transition={{ duration: 0.5 }}
        viewport={{ once: false }} // Allows it to animate each time it comes into view
      >
        <p>Want to be safe from accidental plagiarism before releasing your music? We got your back!</p>
        <p>Found someone copying your music and want to verify? We got your back!</p>
        <p>Go ahead and delve into our world where AI will be your Inspector.</p>
      </motion.section>

      {/* About Us Section with Animation */}
      <motion.section
        className="about-section"
        initial={{ opacity: 0, y: 50 }} // Initial state
        whileInView={{ opacity: 1, y: 0 }} // Animate to this state when in view
        transition={{ duration: 0.5 }}
        viewport={{ once: false }} // Allows it to animate each time it comes into view
      >
        <div className="about-content">
          <h2>About Us</h2>
          <p>
            Spectral Inspector uses cutting-edge AI to analyze music structure, rhythm, melody and much more, helping musicians to protect their intellectual property. Plagiarism reports are generated for each check and will be stored with us for you to view anytime that you want. Currently, we support only MP3 inputs, and guess what? it is completely free to use!! So Help us to enhance and embrace the creative spirit of music.
          </p>
        </div>
        <img className="about-image" src="https://cdn-icons-png.flaticon.com/512/3844/3844724.png" alt="About Us" />
      </motion.section>

      {/* Services Carousel */}
      <section className="services-section">
        <h2 className="text-center">Our Services</h2>
        <br />
        <div className="carousel-container">
          <Carousel
            showDots
            infinite
            autoPlay
            autoPlaySpeed={3000}
            responsive={{
              desktop: { breakpoint: { max: 3000, min: 1024 }, items: 2 },
              tablet: { breakpoint: { max: 1024, min: 464 }, items: 2 },
              mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
            }}
          >
            <div className="card m-2 p-3">
              <h4>Music Library</h4>
              <p>View a demo of the working of our model with the help of a curated library of songs across various genres.</p>
              <img src="https://img.freepik.com/premium-vector/abstract-music-note-logo-icon-vector-design-template_612390-506.jpg" alt="Music Library" className="card-image" />
            </div>
            <div className="card m-2 p-3">
              <h4>Audio Signature Matching</h4>
              <p>Helps to prevent accidental plagiarism by converting your MP3 clip into a signature to be compared with our database.</p>
              <img src="https://st4.depositphotos.com/6489488/21537/v/450/depositphotos_215379394-stock-illustration-sound-web-icon-design.jpg" alt="Audio Signature Matching" className="card-image" />
            </div>
            <div className="card m-2 p-3">
              <h4>Pair Compare</h4>
              <p>Checks if two given MP3 clips are similar. Requires both clips as input.</p>
              <br />
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTu9xSrKP_l-cY0lYVQqDWZ5kDvvlXchzSNNgrLM5oEWKvNdu2" alt="Pair Compare" className="card-image" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* Login Form */}
      <div className="d-flex justify-content-center">
        <div className="card p-4 form-container">
          {formType === 'signin' ? (
            <>
              <h3 className="text-center">Sign In</h3>
              <label htmlFor="signInEmail">Email</label>
              <input type="email" id="signInEmail" className="form-control mb-3" placeholder="Email" />
              <label htmlFor="signInPassword">Password</label>
              <input type="password" id="signInPassword" className="form-control mb-3" placeholder="Password" />
              <button className="btn btn-signin w-100" onClick={handleSignIn}>Sign In</button>
            </>
          ) : formType === 'signup' ? (
            <>
              <h3 className="text-center">Sign Up</h3>
              <label htmlFor="signUpEmail">Email</label>
              <input type="email" id="signUpEmail" className="form-control mb-3" placeholder="Email" />
              <label htmlFor="signUpPassword">Password</label>
              <input type="password" id="signUpPassword" className="form-control mb-3" placeholder="Password" />
              <button className="btn btn-signup w-100" onClick={handleSignUp}>Sign Up</button>
            </>
          ) : (
            <div className="text-center">
              <Link to="/signin" className="btn btn-signin me-2">Sign In</Link>
              <Link to="/signup" className="btn btn-signup">Sign Up</Link>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default LoginPage;
