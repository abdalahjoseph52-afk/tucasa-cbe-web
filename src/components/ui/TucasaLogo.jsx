import React from 'react';
// IMPORT YOUR LOGO HERE
// Make sure the filename matches exactly what you put in the folder!
import logoImage from '../../assets/logo.png'; 

const TucasaLogo = ({ className = "h-12 w-auto", isFooter = false }) => {
  
  return (
    <div className={`flex flex-col items-center justify-center leading-none ${className}`}>
      {/* THE IMAGE LOGO */}
      <img 
        src={logoImage} 
        alt="TUCASA CBE Logo" 
        className="h-full w-auto object-contain" 
      />
    </div>
  );
};

export default TucasaLogo;