import React from 'react';
import { Helmet } from 'react-helmet-async';
import { tucasaData } from '../../data/tucasaData'; // Tunavuta data hapa

const Seo = ({ title, description }) => {
  // 1. Pata data za msingi kutoka tucasaData
  // Tunatumia "OR" (||) ili kama data haipo isilete error
  const orgName = tucasaData.organization || "TUCASA CBE";
  const orgTagline = tucasaData.tagline || "Educating for Eternity";

  // 2. Tunga Title na Description
  // Kama ukurasa umetuma 'title' (mfano "Events"), itakuwa: "Events | TUCASA CBE"
  // Kama hakuna title (Home Page), itakuwa: "TUCASA CBE - Educating for Eternity"
  const finalTitle = title 
    ? `${title} | ${orgName}` 
    : `${orgName} - ${orgTagline}`;
  
  const finalDesc = description || `Official website of ${orgName}. ${orgTagline}`;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      
      {/* Open Graph / Facebook / WhatsApp Preview */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
    </Helmet>
  );
};

export default Seo;