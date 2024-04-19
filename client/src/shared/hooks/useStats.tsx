import { useRef, useEffect } from 'react';
import Stats from 'stats.js';

const useStats = (panelType: number = 0): React.RefObject<HTMLDivElement> => {
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInstance = useRef<Stats | null>(null);

  useEffect(() => {
    if (statsInstance.current === null) {
      statsInstance.current = new Stats();
      statsInstance.current.showPanel(panelType);
    }

    const currentStats = statsInstance.current;
    const currentStatsRef = statsRef.current;

    if (currentStatsRef) {
      currentStatsRef.appendChild(currentStats.dom);
    }

    const animatePanel = () => {
      currentStats.begin();
      currentStats.end();
      requestAnimationFrame(animatePanel);
    };

    requestAnimationFrame(animatePanel);

    return () => {
      if (currentStatsRef) {
        currentStatsRef.removeChild(currentStats.dom);
      }
    };
  }, [panelType]);

  return statsRef;
};

export default useStats;
