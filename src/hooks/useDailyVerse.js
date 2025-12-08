import { useState, useEffect } from 'react';
import { tucasaData } from '../data/tucasaData';

export const useDailyVerse = () => {
  const [verse, setVerse] = useState(tucasaData.verses[0]);

  useEffect(() => {
    // Senior Dev Algorithm: Use the Day of the Year (1-365) to pick a verse
    // This ensures everyone sees the SAME verse on the SAME day.
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Modulo operator loops through the verses array endlessly
    const verseIndex = dayOfYear % tucasaData.verses.length;
    
    setVerse(tucasaData.verses[verseIndex]);
  }, []);

  return verse;
};