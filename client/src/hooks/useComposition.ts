import { useRef } from 'react';
import { usePersistFn } from './usePersistFn';

type InputElement = HTMLInputElement | HTMLTextAreaElement;
type CompositionHandler<T> = React.CompositionEventHandler<T>;
type KeyboardHandler<T> = React.KeyboardEventHandler<T>;

interface CompositionOptions<T extends InputElement> {
  onKeyDown?: KeyboardHandler<T>;
  onCompositionStart?: CompositionHandler<T>;
  onCompositionEnd?: CompositionHandler<T>;
}

interface CompositionHandlers<T extends InputElement> {
  onCompositionStart: CompositionHandler<T>;
  onCompositionEnd: CompositionHandler<T>;
  onKeyDown: KeyboardHandler<T>;
  isComposing: () => boolean;
}

export function useComposition<T extends InputElement = HTMLInputElement>(
  options: CompositionOptions<T> = {}
): CompositionHandlers<T> {
  const {
    onKeyDown: originalOnKeyDown,
    onCompositionStart: originalOnCompositionStart,
    onCompositionEnd: originalOnCompositionEnd,
  } = options;

  const isComposingRef = useRef(false);
  const compositionEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const compositionResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (compositionEndTimer.current) {
      clearTimeout(compositionEndTimer.current);
      compositionEndTimer.current = null;
    }
    if (compositionResetTimer.current) {
      clearTimeout(compositionResetTimer.current);
      compositionResetTimer.current = null;
    }
  };

  const onCompositionStart = usePersistFn((event: React.CompositionEvent<T>) => {
    clearTimers();
    isComposingRef.current = true;
    originalOnCompositionStart?.(event);
  });

  const onCompositionEnd = usePersistFn((event: React.CompositionEvent<T>) => {
    compositionEndTimer.current = setTimeout(() => {
      compositionResetTimer.current = setTimeout(() => {
        isComposingRef.current = false;
      });
    });
    originalOnCompositionEnd?.(event);
  });

  const onKeyDown = usePersistFn((event: React.KeyboardEvent<T>) => {
    const shouldBlockKey = isComposingRef.current && 
      (event.key === 'Escape' || (event.key === 'Enter' && !event.shiftKey));

    if (shouldBlockKey) {
      event.stopPropagation();
      return;
    }

    originalOnKeyDown?.(event);
  });

  const isComposing = usePersistFn(() => isComposingRef.current);

  return {
    onCompositionStart,
    onCompositionEnd,
    onKeyDown,
    isComposing,
  };
}
