import { createContext, useCallback, useContext, useMemo, useState } from "react";

const SectionCacheContext = createContext(null);

function shallowEqual(first, second) {
  if (Object.is(first, second)) return true;
  if (!first || !second || typeof first !== "object" || typeof second !== "object") {
    return false;
  }

  const firstKeys = Object.keys(first);
  const secondKeys = Object.keys(second);
  if (firstKeys.length !== secondKeys.length) return false;

  return firstKeys.every((key) => Object.is(first[key], second[key]));
}

export function SectionCacheProvider({ children }) {
  const [cache, setCache] = useState({});

  const setSectionCache = useCallback((key, value) => {
    setCache((current) => {
      const previousValue = current[key] ?? null;
      const nextValue = typeof value === "function" ? value(previousValue) : value;

      if (shallowEqual(previousValue, nextValue)) {
        return current;
      }

      return {
        ...current,
        [key]: nextValue,
      };
    });
  }, []);

  const clearSectionCache = useCallback((key) => {
    setCache((current) => {
      if (!Object.prototype.hasOwnProperty.call(current, key)) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ cache, clearSectionCache, setSectionCache }),
    [cache, clearSectionCache, setSectionCache],
  );

  return (
    <SectionCacheContext.Provider value={value}>
      {children}
    </SectionCacheContext.Provider>
  );
}

export function useSectionCache(key) {
  const context = useContext(SectionCacheContext);
  if (!context) {
    throw new Error("useSectionCache must be used inside SectionCacheProvider");
  }

  const cached = context.cache[key] ?? null;
  const clearCached = useCallback(
    () => context.clearSectionCache(key),
    [context.clearSectionCache, key],
  );
  const setCached = useCallback(
    (value) => context.setSectionCache(key, value),
    [context.setSectionCache, key],
  );

  return useMemo(
    () => ({ cached, clearCached, setCached }),
    [cached, clearCached, setCached],
  );
}
