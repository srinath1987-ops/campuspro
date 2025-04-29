
import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to animate counting from one value to another
 * @param value The value to animate to (can be number or string)
 * @param duration Animation duration in ms
 * @returns Animated value as string
 */
export function useCountAnimate(value: string | number, duration: number = 800): string {
  const [animatedValue, setAnimatedValue] = useState<string>(String(value));
  const previousValue = useRef<string | number>(value);
  
  useEffect(() => {
    // Don't animate if it's not a number
    const isNumeric = !isNaN(Number(value));
    if (!isNumeric || value === previousValue.current) {
      setAnimatedValue(String(value));
      return;
    }
    
    const startValue = Number(previousValue.current) || 0;
    const endValue = Number(value);
    const difference = endValue - startValue;
    const startTime = performance.now();
    
    // If the values are the same, skip animation
    if (startValue === endValue) {
      setAnimatedValue(String(value));
      return;
    }
    
    // Easy ease-out animation
    const animateCount = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      
      if (elapsedTime >= duration) {
        setAnimatedValue(String(value));
        previousValue.current = value;
        return;
      }
      
      const progress = elapsedTime / duration;
      // Ease-out cubic function: progress => 1 - (1 - progress) ^ 3
      const easing = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + difference * easing);
      
      setAnimatedValue(String(currentValue));
      requestAnimationFrame(animateCount);
    };
    
    requestAnimationFrame(animateCount);
    
    return () => {
      previousValue.current = value;
    };
  }, [value, duration]);
  
  return animatedValue;
}
