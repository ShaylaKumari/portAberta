import { useRef } from 'react';

type AnyFunction = (...args: unknown[]) => unknown;

/**
 * Creates a persistent function reference that always calls the latest version.
 * Alternative to useCallback that doesn't require dependency management.
 * 
 * @param fn - The function to persist
 * @returns A stable function reference that always calls the latest fn
 */
export function usePersistFn<T extends AnyFunction>(fn: T): T {
  const fnRef = useRef<T>(fn);
  fnRef.current = fn;

  const persistentFnRef = useRef<T | null>(null);
  
  if (!persistentFnRef.current) {
    persistentFnRef.current = function (this: unknown, ...args: unknown[]) {
      return fnRef.current.apply(this, args);
    } as T;
  }

  return persistentFnRef.current;
}
