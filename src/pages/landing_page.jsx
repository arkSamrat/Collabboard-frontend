import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div style={styles.background}>
      <div style={styles.container}>
        <h1 style={styles.heading}>
          🚀 Welcome to <span style={styles.brand}>CollabBoard</span>
        </h1>
        <p style={styles.subtext}>
          A real-time collaborative Kanban board built with the MERN stack.
        </p>
        <div style={styles.buttons}>
          <Link to="/login" style={{ ...styles.button, ...styles.login }}>
            Login
          </Link>
          <Link to="/register" style={{ ...styles.button, ...styles.register }}>
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;

const styles = {
  background: {
    background: 'linear-gradient(to right, #74ebd5, #acb6e5)',
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    boxSizing: 'border-box',
  },
  container: {
    background: '#ffffff',
    padding: '40px 30px',
    borderRadius: '15px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    textAlign: 'center',
    width: '100%',
    maxWidth: '500px',
  },
  heading: {
    fontSize: '2.5rem',
    marginBottom: '20px',
    color: '#333',
    lineHeight: '1.2',
  },
  brand: {
    color: '#007bff',
  },
  subtext: {
    fontSize: '1.1rem',
    marginBottom: '30px',
    color: '#666',
  },
  buttons: {
    display: 'flex',
    flexDirection: window.innerWidth < 480 ? 'column' : 'row', // responsive buttons
    gap: '20px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  button: {
    textDecoration: 'none',
    padding: '12px 30px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    minWidth: '120px',
  },
  login: {
    background: '#007bff',
    color: '#fff',
  },
  register: {
    background: '#28a745',
    color: '#fff',
  },
};
