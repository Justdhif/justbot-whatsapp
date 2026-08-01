const fonts = {
  boldSans: {
    upper: 0x1D5D4, 
    lower: 0x1D5EE, 
    digits: 0x1D7EC, 
  },
  monospace: {
    upper: 0x1D670, 
    lower: 0x1D68A, 
    digits: 0x1D7F6, 
  },
  boldSerif: {
    upper: 0x1D400, 
    lower: 0x1D41A, 
    digits: 0x1D7CE, 
  },
  italic: {
    upper: 0x1D434, 
    lower: 0x1D44E, 
    digits: null,
  },
  boldSansUppercase: {
    upper: 0x1D5D4,
    lower: 0x1D5D4, // Maps lower characters to uppercase boldSans as seen in the mockup screenshot!
    digits: 0x1D7EC,
  }
} as const;

export type FontStyle = keyof typeof fonts;

export function changeFont(text: string, style: FontStyle): string {
  const font = fonts[style];
  if (!font) return text;

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);

    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      result += text[i] + (text[i + 1] || '');
      i++;
      continue;
    }

    if (charCode >= 65 && charCode <= 90) {
      const offset = charCode - 65;
      result += String.fromCodePoint(font.upper + offset);
    }
    else if (charCode >= 97 && charCode <= 122) {
      const offset = charCode - 97;
      if (style === 'boldSansUppercase') {
        // Map lowercase directly to uppercase boldSans equivalent offset
        result += String.fromCodePoint(font.upper + offset);
      } else if (style === 'italic' && charCode === 104) {
        result += 'ℎ';
      } else {
        result += String.fromCodePoint(font.lower + offset);
      }
    }
    else if (charCode >= 48 && charCode <= 57 && font.digits !== null) {
      const offset = charCode - 48;
      result += String.fromCodePoint(font.digits + offset);
    }
    else {
      result += text[i];
    }
  }

  return result;
}
