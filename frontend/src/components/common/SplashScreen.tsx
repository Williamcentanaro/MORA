import React from 'react';
import { motion } from 'framer-motion';

const SplashScreen: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #FF5A1F 0%, #E04810 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        color: 'white',
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.8, 
          delay: 0.2,
          ease: "easeOut" 
        }}
        style={{ textAlign: 'center' }}
      >
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontWeight: 800, 
          margin: 0, 
          letterSpacing: '-1px',
          textShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          MORA
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          marginTop: '10px', 
          opacity: 0.9,
          fontWeight: 500,
          letterSpacing: '2px',
          textTransform: 'uppercase'
        }}>
          Taste the Passion
        </p>
      </motion.div>
      
      {/* Subtle loader or accent */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 100 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        style={{
          height: '3px',
          background: 'rgba(255,255,255,0.3)',
          marginTop: '30px',
          borderRadius: 'full',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '40%',
            height: '100%',
            background: 'white'
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
