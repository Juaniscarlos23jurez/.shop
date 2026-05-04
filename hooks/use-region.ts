import { useState, useEffect } from 'react';

export function useRegion() {
  const [isEurope, setIsEurope] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && tz.startsWith('Europe/')) {
        setIsEurope(true);
      }
    } catch (e) {
      console.warn("Region detection failed", e);
    }
  }, []);

  return { isEurope };
}
