import React from "react";
import { motion } from "framer-motion";

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
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #FF5A1F 0%, #E04810 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        color: 'white',
        overflow: 'hidden'
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}
      >
        <motion.h1
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          style={{ 
            fontSize: 'clamp(3rem, 12vw, 6rem)', 
            fontWeight: 900, 
            margin: 0,
            letterSpacing: '-0.04em',
            textShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}
        >
          Sabor Latino
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ 
            fontSize: 'clamp(1rem, 4vw, 1.5rem)', 
            fontWeight: 600, 
            opacity: 0.9,
            marginTop: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase'
          }}
        >
          Taste the Passion
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "120px" }}
        transition={{ duration: 1.5, delay: 0.5 }}
        style={{
          height: '3px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '4px',
          marginTop: '40px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <motion.div 
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          style={{
            width: '40%',
            height: '100%',
            background: 'white',
            position: 'absolute'
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
