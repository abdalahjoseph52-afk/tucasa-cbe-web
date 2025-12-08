import { useState, useEffect } from 'react';
import { tucasaData } from '../data/tucasaData';

export const useCurrentProgram = () => {
  const [todaysProgram, setTodaysProgram] = useState(null);
  const [isProgramLive, setIsProgramLive] = useState(false);

  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const dayIndex = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const hour = now.getHours();

      // Map JS getDay() to your Data's day names
      const daysMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Sabbath"];
      const currentDayName = daysMap[dayIndex];

      // Find the program in your data
      const program = tucasaData.programs.find(p => p.day === currentDayName);

      setTodaysProgram(program || null);

      // Check if it is currently between 20:00 and 21:00
      if (program && hour >= 20 && hour < 21) {
        setIsProgramLive(true);
      } else {
        setIsProgramLive(false);
      }
    };

    checkSchedule();
    // Update every minute to keep it accurate
    const interval = setInterval(checkSchedule, 60000);
    return () => clearInterval(interval);
  }, []);

  return { todaysProgram, isProgramLive };
};