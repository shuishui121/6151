export const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

export const animateValue = (
  from: number,
  to: number,
  duration: number,
  onUpdate: (value: number) => void,
  onComplete?: () => void
): (() => void) => {
  const startTime = performance.now();
  let animationId: number | null = null;

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutCubic(progress);
    const currentValue = lerp(from, to, easedProgress);

    onUpdate(currentValue);

    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    } else {
      onComplete?.();
    }
  };

  animationId = requestAnimationFrame(animate);

  return () => {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
    }
  };
};

export const staggerDelay = (index: number, baseDelay: number = 100): number => {
  return index * baseDelay;
};
