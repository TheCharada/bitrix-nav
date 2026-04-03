function placeCursorAtEnd(textarea: HTMLTextAreaElement) {
  const length = textarea.value.length;

  try {
    textarea.setSelectionRange(length, length);
  } catch {}
}

export function focusMessageInput() {
  const input =
    document.querySelector<HTMLTextAreaElement>(
      'textarea.bx-im-textarea__element',
    ) ??
    document.querySelector<HTMLTextAreaElement>(
      'textarea[placeholder*="Digite @ ou +"]',
    );

  if (!input) {
    return false;
  }

  input.focus();
  placeCursorAtEnd(input);

  return true;
}