type HotkeyHandlers = {
  onToggle: () => void;
  onClose: () => void;
  onNextChat: () => void;
  onPreviousChat: () => void;
  onFocusInput: () => void;
};

export function registerGlobalHotkeys({
  onToggle,
  onClose,
  onNextChat,
  onPreviousChat,
  onFocusInput,
}: HotkeyHandlers) {
  const onKeyDown = (event: KeyboardEvent) => {
    const hasModifier = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();

    if (hasModifier && key === "k") {
      event.preventDefault();
      event.stopPropagation();
      onToggle();
      return;
    }

    if (hasModifier && event.key === "]") {
      event.preventDefault();
      event.stopPropagation();
      onNextChat();
      return;
    }

    if (hasModifier && event.key === "[") {
      event.preventDefault();
      event.stopPropagation();
      onPreviousChat();
      return;
    }

    if (hasModifier && event.shiftKey && key === "l") {
      event.preventDefault();
      event.stopPropagation();
      onFocusInput();
      return;
    }

    if (event.key === "Escape") {
      onClose();
    }
  };

  window.addEventListener("keydown", onKeyDown, true);

  return () => {
    window.removeEventListener("keydown", onKeyDown, true);
  };
}
