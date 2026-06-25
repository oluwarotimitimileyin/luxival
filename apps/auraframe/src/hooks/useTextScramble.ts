import { useState, useEffect } from 'react';

export function useTextScramble(targetText: string, isAnimating: boolean): string {
  const [displayText, setDisplayText] = useState('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

  useEffect(() => {
    if (!isAnimating) {
      setDisplayText(targetText);
      return;
    }

    let iteration = 0;
    const interval = setInterval(() => {
      const newText = targetText
        .split('')
        .map((_char, index) => {
          if (index < iteration) {
            return targetText[index];
          }
          return chars[Math.floor(Math.random() * 36)];
        })
        .join('');

      setDisplayText(newText);
      iteration += 1 / 3;

      if (iteration >= targetText.length) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [targetText, isAnimating]);

  return displayText;
}
