import React, { createContext, useContext, useState } from 'react';

const KronosAppContext = createContext();

export function KronosProvider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <KronosAppContext.Provider value={{ user, setUser }}>
      {children}
    </KronosAppContext.Provider>
  );
}

export function useKronosContext() {
  return useContext(KronosAppContext);
}
