import React, { createContext, useContext, useState, useCallback } from 'react';

interface SectionAnimationContextType {
  replayCounts: Record<string, number>;
  triggerReplay: (sectionId: string) => void;
}

const SectionAnimationContext = createContext<SectionAnimationContextType>({
  replayCounts: {},
  triggerReplay: () => {},
});

export const SectionAnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [replayCounts, setReplayCounts] = useState<Record<string, number>>({});

  const triggerReplay = useCallback((sectionId: string) => {
    setReplayCounts((prev) => ({
      ...prev,
      [sectionId]: (prev[sectionId] || 0) + 1,
    }));
  }, []);

  return (
    <SectionAnimationContext.Provider value={{ replayCounts, triggerReplay }}>
      {children}
    </SectionAnimationContext.Provider>
  );
};

export const useSectionAnimation = () => useContext(SectionAnimationContext);
