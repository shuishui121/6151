import { useState, useEffect, useRef } from 'react';
import { animateValue } from '@/utils/animationUtils';

interface UseAnimatedNumberOptions {
  duration?: number;
  decimals?: number;
}

export const useAnimatedNumber = (
  targetValue: number,
  options: UseAnimatedNumberOptions = {}
): number => {
  const { duration = 600, decimals = 0 } = options;
  const [displayValue, setDisplayValue] = useState(0);
  const currentValueRef = useRef(0);
  const cancelAnimationRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (cancelAnimationRef.current) {
      cancelAnimationRef.current();
    }

    cancelAnimationRef.current = animateValue(
      currentValueRef.current,
      targetValue,
      duration,
      (value) => {
        currentValueRef.current = value;
        setDisplayValue(Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals));
      }
    );

    return () => {
      if (cancelAnimationRef.current) {
        cancelAnimationRef.current();
      }
    };
  }, [targetValue, duration, decimals]);

  return displayValue;
};
