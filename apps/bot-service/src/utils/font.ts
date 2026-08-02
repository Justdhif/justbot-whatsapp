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
    lower: 0x1D5D4,
    digits: 0x1D7EC,
  },
  smallCaps: {
    
    A: 'ᴀ', B: 'ʙ', C: 'ᴄ', D: 'ᴅ', E: 'ᴇ', F: 'ꜰ', G: 'ɢ', H: 'ʜ', I: 'ɪ', J: 'ᴊ', K: 'ᴋ', L: 'ʟ', M: 'ᴍ',
    N: 'ɴ', O: 'ᴏ', P: 'ᴘ', Q: 'ǫ', R: 'ʀ', S: 's', T: 'ᴛ', U: 'ᴜ', V: 'ᴠ', W: 'ᴡ', X: 'x', Y: 'ʏ', Z: 'ᴢ',
    a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ',
    n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
  }
} as const;

export type FontStyle = keyof typeof fonts;

export function changeFont(text: string, style: FontStyle): string {
  if (style === 'smallCaps') {
    const map = fonts.smallCaps;
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char in map) {
        result += map[char as keyof typeof map];
      } else {
        result += char;
      }
    }
    return result;
  }

  const font = fonts[style];
  if (!font || !('upper' in font)) return text;

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
        result += String.fromCodePoint(font.upper + offset);
      } else if (style === 'italic' && charCode === 104) {
        result += 'ℎ';
      } else {
        result += String.fromCodePoint(font.lower + offset);
      }
    }
    else if (charCode >= 48 && charCode <= 57 && 'digits' in font && font.digits !== null) {
      const offset = charCode - 48;
      result += String.fromCodePoint(font.digits + offset);
    }
    else {
      result += text[i];
    }
  }

  return result;
}
