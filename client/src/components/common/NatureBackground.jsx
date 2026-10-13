// client/src/components/common/NatureBackground.jsx
import React from 'react';

export const NatureBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Soft atmospheric gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#faf7ee] via-[#f5efe0] to-[#edf4ea] opacity-90" />

      {/* Sun glow halo */}
      <div className="absolute -top-32 right-1/4 w-96 h-96 rounded-full bg-amber-200/40 blur-3xl animate-pulse-glow" />

      {/* Lush green subtle hills overlay */}
      <div className="absolute -bottom-24 -left-20 w-[550px] h-[550px] rounded-full bg-emerald-600/5 blur-3xl" />
      <div className="absolute -bottom-20 right-0 w-[650px] h-[650px] rounded-full bg-green-700/5 blur-3xl" />

      {/* Stylized Farmland Contour SVGs at the bottom */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full opacity-15"
        viewBox="0 0 1440 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M0,192L48,181.3C96,171,192,149,288,160C384,171,480,213,576,224C672,235,768,213,864,186.7C960,160,1056,128,1152,133.3C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          fill="#1b4d3e"
        />
        <path
          d="M0,256L60,240C120,224,240,192,360,197.3C480,203,600,245,720,240C840,235,960,181,1080,165.3C1200,149,1320,171,1380,181.3L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          fill="#2e7d32"
          opacity="0.4"
        />
      </svg>

      {/* Floating nature leaf particles */}
      <div className="absolute left-[8%] bottom-10 leaf-particle-1 text-emerald-700/30">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3 11 0 14-14 14-14s-3.5 2-5 2z"/>
        </svg>
      </div>

      <div className="absolute left-[35%] bottom-5 leaf-particle-2 text-green-600/25">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.97-4.48-9-10-9z" opacity="0.3"/>
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3 11 0 14-14 14-14s-3.5 2-5 2z"/>
        </svg>
      </div>

      <div className="absolute right-[15%] bottom-20 leaf-particle-1 text-emerald-800/25" style={{ animationDelay: '4s' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3 11 0 14-14 14-14s-3.5 2-5 2z"/>
        </svg>
      </div>

      <div className="absolute right-[32%] bottom-8 leaf-particle-2 text-amber-700/20" style={{ animationDelay: '7s' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3 11 0 14-14 14-14s-3.5 2-5 2z"/>
        </svg>
      </div>
    </div>
  );
};
