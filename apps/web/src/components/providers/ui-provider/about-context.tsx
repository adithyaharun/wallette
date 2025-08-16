import { createContext, useContext, useState } from "react";

type AboutProviderProps = {
  children: React.ReactNode;
};

type AboutContextType = {
  isAboutOpen: boolean;
  setAboutOpen: (open: boolean) => void;
};

const AboutContext = createContext<AboutContextType>({
  isAboutOpen: false,
  setAboutOpen: () => {},
});

export function AboutProvider({ children }: AboutProviderProps) {
  const [isAboutOpen, setAboutOpen] = useState(false);

  return (
    <AboutContext.Provider
      value={{
        isAboutOpen,
        setAboutOpen,
      }}
    >
      {children}
    </AboutContext.Provider>
  );
}

export function useAbout() {
  const context = useContext(AboutContext);
  if (!context) {
    throw new Error("useAbout must be used within a AboutProvider");
  }
  return context;
}
