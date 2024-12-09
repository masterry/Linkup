import React from 'react';
import { useNavigate } from 'react-router-dom';
import './landingPage.css'; // Assuming you have the styles in a separate file

const LandingPage = () => {
  const navigate = useNavigate();

  const redirectToSignUp = () => {
    navigate('/signup');
  };

  const redirectToSignIn = () => {
    navigate('/signin');
  };

  return (
    <div>
      <header>
        <nav className="navbar landing-page-navbar">
          <div className="logo"></div>
          <button className="cta-button" onClick={redirectToSignUp}>
            Sign Up
          </button>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <h1>Find Meaningful Connections</h1>
            <p>Your journey to love begins here. Join LinkUp today!</p>
            <button className="cta-button" onClick={redirectToSignIn}>
              Get Started
            </button>
          </div>
        </section>

        <section className="features">
          <div className="feature">
            <h2>Connect with People Nearby</h2>
            <p>Swipe, match, and chat with people near you.</p>
          </div>
          <div className="feature">
            <h2>Personalized Experience</h2>
            <p>LinkUp gives you the best matches based on your preferences.</p>
          </div>
          <div className="feature">
            <h2>Safe and Secure</h2>
            <p>Your privacy and safety are our top priority.</p>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-content">
          <div className="about-linkup">
            <h3>About LinkUp</h3>
            <p>
              LinkUp was inspired by the challenge of creating meaningful
              connections in a fast-paced world. As a project developed at
              Holberton School, we wanted to build a platform that prioritizes
              user preferences to foster genuine relationships.
            </p>
            <p>
              LinkUp is a Portfolio Project developed by Therese Khoury and
              Marilynn Yammine, Full-Stack Developers in training. Learn more
              about us and our work through our profiles below.
            </p>
          </div>

          <div className="team-members">
            <div className="team-member">
              <h4>Therese Khoury</h4>
              <ul>
                <li>
                  <a href="https://www.linkedin.com/">LinkedIn</a>
                </li>
                <li>
                  <a href="https://github.com/masterry">GitHub</a>
                </li>
                <li>
                  <a href="https://twitter.com/">Twitter</a>
                </li>
              </ul>
            </div>
            <div className="team-member">
              <h4>Marilynn Yammine</h4>
              <ul>
                <li>
                  <a href="https://www.linkedin.com/">LinkedIn</a>
                </li>
                <li>
                  <a href="https://github.com/maliluu">GitHub</a>
                </li>
                <li>
                  <a href="https://twitter.com/">Twitter</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="github-repository">
            <h4>GitHub Repository</h4>
            <a href="https://github.com/masterry/Linkup" target="_blank" rel="noopener noreferrer">
              View the GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
