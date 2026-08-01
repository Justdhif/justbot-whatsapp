const fonts = {
  boldSans: {
    upper: 0x1D5D4, // 𝗔
    lower: 0x1D5EE, // 𝗮
    digits: 0x1D7EC, // 𝟬
  },
  monospace: {
    upper: 0x1D670, // 𝙰
    lower: 0x1D68A, // 𝚊
    digits: 0x1D7F6, // 𝟶
  },
  boldSerif: {
    upper: 0x1D400, // 𝐀
    lower: 0x1D41A, // 𝐚
    digits: 0x1D7CE, // 𝟎
  },
  italic: {
    upper: 0x1D434, // 𝐴
    lower: 0x1D44E, // 𝑎
    digits: null,
  }
} as const;

export type FontStyle = keyof typeof fonts;

/**
 * Converts normal text into stylized Unicode characters (Math Alphanumeric Symbols).
 * Useful for changing fonts in WhatsApp messages.
 */
export function changeFont(text: string, style: FontStyle): string {
  const font = fonts[style];
  if (!font) return text;

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);

    // Handle high surrogate pairs if any (to avoid breaking existing unicode)
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      result += text[i] + (text[i + 1] || '');
      i++;
      continue;
    }

    // A-Z
    if (charCode >= 65 && charCode <= 90) {
      const offset = charCode - 65;
      result += String.fromCodePoint(font.upper + offset);
    }
    // a-z
    else if (charCode >= 97 && charCode <= 122) {
      const offset = charCode - 97;
      // Special case: Unicode italic lower 'h' is U+210E (ℎ) instead of mathematical italic h
      if (style === 'italic' && charCode === 104) {
        result += 'ℎ';
      } else {
        result += String.fromCodePoint(font.lower + offset);
      }
    }
    // 0-9
    else if (charCode >= 48 && charCode <= 57 && font.digits !== null) {
      const offset = charCode - 48;
      result += String.fromCodePoint(font.digits + offset);
    }
    // Other characters remain unchanged
    else {
      result += text[i];
    }
  }

  return result;
}
