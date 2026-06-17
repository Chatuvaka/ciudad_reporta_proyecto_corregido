// Validator for ubicacion field (backend)
// Exporta validarUbicacionBasicaBackend(ubicacion) -> { valid: boolean, message: string }

function normalizeText(s) {
  return (s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

function containsAny(text, arr) {
  for (const a of arr) if (text.includes(a)) return true;
  return false;
}

function hasCoordinateValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function isInsideSanLuisRioColorado(lat, lng) {
  const latitude = Number(lat);
  const longitude = Number(lng);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;

  return latitude >= 31.95
    && latitude <= 32.85
    && longitude >= -115.25
    && longitude <= -114.25;
}

function sanitizeText(value = '') {
  return String(value || '')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasHtmlOrScript(value = '') {
  return /<\s*(script|img|iframe|svg|a|video|audio|body|html|meta|link|style|object|embed|input|button|form|textarea)\b|on\w+\s*=|javascript:|data:\s*image\//i.test(value);
}

function hasSqlInjection(value = '') {
  const raw = normalizeText(value);
  return /('.*--|--|\b(or|and)\b\s+\d+=\d+|\bunion\b\s+select|\bdrop\b\s+table|\binsert\b\s+into|\bdelete\b\s+from|\bupdate\b\s+\w+|\btruncate\b|\balter\b\s+table)/i.test(raw);
}

function hasCommandInjection(value = '') {
  return /(\brm\b|\bcp\b|\bmv\b|\bchmod\b|\bchown\b|\bexec\b|\bsh\b|\bbash\b|\bcat\b|\bgrep\b|&&|\|\||\||;|`|\$\()/i.test(value);
}

function hasPathTraversal(value = '') {
  return /(?:\.\.\/|\.\.\\|\/etc\/|\\etc\\)/i.test(value);
}

function hasUrl(value = '') {
  return /\b(?:https?:\/\/|www\.|ftp:\/\/|mailto:)/i.test(value) || /\b[\w.-]+@[\w.-]+\.\w{2,}\b/.test(value);
}

function hasTooManySymbols(value = '') {
  const cleaned = String(value || '').replace(/\s+/g, '');
  const symbols = cleaned.replace(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]/g, '');
  return cleaned.length > 0 && symbols.length / cleaned.length > 0.3;
}

function hasTooManyUppercase(value = '') {
  const letters = String(value || '').replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '');
  const uppercase = letters.replace(/[^A-ZÁÉÍÓÚÜÑ]/g, '');
  return letters.length >= 8 && uppercase.length / letters.length > 0.65;
}

function hasRepeatedCharacters(value = '') {
  return /(.)\1{8,}/.test(value) || /(\b[a-záéíóúñ])\1{5,}\b/i.test(value);
}

function hasRepeatedWords(value = '') {
  const words = String(value || '')
    .toLowerCase()
    .replace(/[.,;:!?()\[\]"'“”‘’]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  const counts = {};
  for (const word of words) {
    if (word.length < 3) continue;
    counts[word] = (counts[word] || 0) + 1;
    if (counts[word] >= 4) return true;
  }

  return /(\b[\w]{3,}\b)[\s\S]*\1[\s\S]*\1/i.test(String(value || '').toLowerCase());
}

function hasLowVowelRatio(value = '') {
  const letters = String(value || '').replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '');
  const vowels = letters.match(/[aeiouáéíóúü]/gi) || [];
  return letters.length >= 12 && vowels.length / letters.length < 0.32;
}

function isGenericNoise(value = '') {
  const raw = normalizeText(value);
  const banned = [
    'ejemplo', 'test', 'prueba', 'asdf', 'asdfgh', 'qwerty', 'no se', 'nose', 'sin ubicacion',
    'sin ubic', 'ninguna', 'algun lugar', 'por aqui', 'por aquí', 'algo', 'nada', 'texto aleatorio'
  ];
  return banned.some((term) => raw.includes(term));
}

function checkMaliciousContent(raw = '') {
  if (hasHtmlOrScript(raw)) return 'No se permiten etiquetas HTML, scripts ni comandos.';
  if (hasSqlInjection(raw)) return 'No se permiten intentos de inyección SQL ni comandos maliciosos.';
  if (hasCommandInjection(raw)) return 'No se permiten comandos ni operadores peligrosos.';
  if (hasPathTraversal(raw)) return 'No se permiten rutas o accesos tipo ../ en este campo.';
  if (hasUrl(raw)) return 'No se permiten enlaces, URLs ni direcciones de correo electrónico.';
  if (hasTooManySymbols(raw)) return 'Evita usar símbolos o caracteres extraños en exceso.';
  if (hasTooManyUppercase(raw)) return 'Evita escribir demasiado en mayúsculas.';
  if (hasRepeatedCharacters(raw) || hasRepeatedWords(raw)) return 'El texto parece repetido o generado automáticamente.';
  if (hasLowVowelRatio(raw)) return 'El texto parece no tener estructura natural. Usa palabras completas.';
  return '';
}

function validarReferenciaLugarBackend(referencia = '') {
  const raw = sanitizeText(referencia);

  if (!raw) {
    return { valid: false, message: 'Agrega una referencia visible, por ejemplo: frente a una tienda o escuela.' };
  }
  if (raw.length < 20) {
    return { valid: false, message: 'La referencia es muy corta. Describe mejor el punto de referencia.' };
  }
  if (raw.length > 200) {
    return { valid: false, message: 'La referencia es demasiado larga. Sé directo y claro.' };
  }

  const unsafeMessage = checkMaliciousContent(raw);
  if (unsafeMessage) return { valid: false, message: unsafeMessage };
  if (isGenericNoise(raw)) {
    return { valid: false, message: 'Las señas deben indicar un lugar real, no texto genérico.' };
  }

  const locationHint = /\b(frente a|frente|esquina|entre calles?|cruce con|cruce de|cerca de|al lado de|junto a|a un lado de|del lado de|referencia|ref\.?|parque|plaza|escuela|iglesia|hospital|tienda|gasolinera|mercado|semáforo|semaforo)\b/i;
  if (!locationHint.test(raw)) {
    return { valid: false, message: 'Agrega una referencia visible, por ejemplo: frente a una tienda, escuela o parque.' };
  }

  if (hasRepeatedWords(raw)) {
    return { valid: false, message: 'La referencia parece repetida. Explica el lugar con tus propias palabras.' };
  }

  return { valid: true, message: '' };
}

function validarDescripcionProblemaBackend(descripcion = '') {
  const raw = sanitizeText(descripcion);

  if (!raw) {
    return { valid: false, message: 'Describe el problema con claridad.' };
  }
  if (raw.length < 30) {
    return { valid: false, message: 'La descripción es muy breve. Añade más detalles sobre lo que ocurre.' };
  }
  if (raw.length > 1200) {
    return { valid: false, message: 'La descripción es demasiado larga. Resume el problema en menos de 1200 caracteres.' };
  }

  const unsafeMessage = checkMaliciousContent(raw);
  if (unsafeMessage) return { valid: false, message: unsafeMessage };
  if (isGenericNoise(raw)) {
    return { valid: false, message: 'La descripción debe ser específica y coherente, no un texto de prueba.' };
  }

  const problematicWords = /\b(bache|baches|luminaria|luz|fuga|agua|basura|señal|señalización|árbol|arbol|poste|banqueta|calle|inundación|inundacion|socavón|socavon|accidente|hoyo|hueco|desnivel|rotura|derrame|obstrucción|obstruccion|peligro|mal olor|ruido|vandalismo|hundimiento|filtración|filtracion|grieta|desbordamiento|charco|encharcamiento)\b/i;
  if (!problematicWords.test(raw)) {
    return { valid: false, message: 'La descripción debe mencionar claramente el problema y sus consecuencias.' };
  }

  const words = raw.split(/\s+/).filter(Boolean);
  if (words.length < 8) {
    return { valid: false, message: 'Añade más palabras para que la descripción sea coherente y útil.' };
  }

  if (hasRepeatedWords(raw)) {
    return { valid: false, message: 'La descripción parece repetida. Explica el problema con tus propias palabras.' };
  }

  return { valid: true, message: '' };
}

function validateCoordinates(lat, lng) {
  if (!hasCoordinateValue(lat) && !hasCoordinateValue(lng)) return { valid: true, message: '' };
  if (!hasCoordinateValue(lat) || !hasCoordinateValue(lng)) {
    return { valid: false, message: 'La ubicación por coordenadas está incompleta.' };
  }

  if (!isInsideSanLuisRioColorado(lat, lng)) {
    return { valid: false, message: 'Solo se permiten reportes dentro de San Luis Río Colorado, Sonora.' };
  }

  return { valid: true, message: '' };
}

function validarUbicacionBasicaBackend(ubicacion) {
  const raw = (ubicacion || '').trim();
  const normalized = normalizeText(raw);

  if (!raw) return { valid: false, message: 'La ubicación es obligatoria.' };
  if (raw.length < 15) return { valid: false, message: 'La ubicación es demasiado corta. Agrega calle, número, colonia o referencia.' };

  const bannedPhrases = ['sin ubicacion', 'sin ubic', 'sin ubicaci', 'no se', 'nose', 'ninguna', 'calle falsa', 'domicilio falso'];
  if (containsAny(normalized, bannedPhrases) || /\b(ejemplo|test|prueba|asdf)\b/.test(normalized)) {
    return { valid: false, message: 'Ingresa una ubicación real, no un texto de prueba.' };
  }

  const coordRegex = /[-+]?\d{1,3}\.\d+\s*[,;]\s*[-+]?\d{1,3}\.\d+/; // lat,lng
  const numberRegex = /#\s*\d+|\bNo\.?\s*\d+|\bnumero\s*\d+|\b\d{1,6}\b/iu;
  const coloniaRegex = /\bcol(?:onia)?\.?\s+\w+/i;
  const entreRegex = /\bentre\b|\bentre calles\b/i;
  const esquinaRegex = /\besquina\b|\besq\.?\b/i;
  const cruceRegex = /\bcruce\b|\bcruce con\b|\bcruce de\b/i;
  const frenteRegex = /\bfrente a\b|\bfrente\b/i;
  const cercaRegex = /\bcerca de\b/i;
  const aLadoRegex = /\ba un lado de\b|\bal lado de\b/i;
  const referenciaRegex = /\breferencia\b|\bref\.?\b/i;
  const placeRegex = /\bparque\b|\bescuela\b|\bhospital\b|\bplaza\b|\btienda\b|\boxxo\b/i;

  const coordMatch = raw.match(coordRegex);
  if (coordMatch) {
    const [latValue, lngValue] = coordMatch[0].split(/[,;]/).map((part) => part.trim());
    return validateCoordinates(latValue, lngValue);
  }
  if (numberRegex.test(raw)) return { valid: true, message: '' };
  if (coloniaRegex.test(raw)) return { valid: true, message: '' };

  if (entreRegex.test(normalized) || esquinaRegex.test(normalized) || cruceRegex.test(normalized) || frenteRegex.test(normalized) || cercaRegex.test(normalized) || aLadoRegex.test(normalized) || referenciaRegex.test(normalized) || placeRegex.test(normalized)) {
    return { valid: true, message: '' };
  }

  const streetLike = /\bcalle\b|\bc\.\b|\bavenida\b|\bav\.?\b|\bprol\.?\b|\bcamino\b|\bcarretera\b|\bcallejon\b|\bcalz\.?\b/i;
  if (streetLike.test(normalized)) {
    return { valid: false, message: 'La ubicación está incompleta. Agrega número, colonia, cruce, esquina o una referencia cercana.' };
  }

  return { valid: false, message: 'La ubicación está incompleta. Agrega número, colonia, cruce, esquina o una referencia cercana.' };
}

export {
  validarUbicacionBasicaBackend,
  validarReferenciaLugarBackend,
  validarDescripcionProblemaBackend,
  validarUbicacionReporteBackend,
};

// Structured validator for backend (server-side)
function validarUbicacionReporteBackend(data = {}) {
  try {
    const {
      direccion = '',
      numeroExterior = '',
      noNumero = false,
      estado = '',
      municipio = '',
      localidad = '',
      colonia = '',
      referencia = '',
      lat,
      lng,
      ubicacion = ''
    } = data || {};

    const fullText = (direccion || ubicacion || '').trim();
    const hasCoordinates = hasCoordinateValue(lat) && hasCoordinateValue(lng);
    if (!fullText && !hasCoordinates) return { valid: false, message: 'La ubicación es obligatoria.' };

    const low = normalizeText(fullText || '');
    const banned = ['ejemplo', 'test', 'prueba', 'asdf', 'sin ubicacion', 'sin ubic', 'ninguna', 'no se', 'nose'];
    for (const b of banned) if (low.includes(b)) return { valid: false, message: 'Ingresa una ubicación real, no un texto de prueba.' };

    const norm = (s='') => normalizeText((s || '').toString().trim());
    if (estado && norm(estado) !== 'sonora') return { valid: false, message: 'Solo se permiten reportes dentro de San Luis Río Colorado, Sonora.' };
    if (municipio && norm(municipio) !== 'san luis rio colorado') return { valid: false, message: 'Solo se permiten reportes dentro de San Luis Río Colorado, Sonora.' };

    const coordinateValidation = validateCoordinates(lat, lng);
    if (!coordinateValidation.valid) return coordinateValidation;
    if (hasCoordinates) return { valid: true, message: '' };

    if ((fullText || '').length < 15) return { valid: false, message: 'La ubicación está incompleta. Agrega número, colonia, cruce, esquina o una referencia cercana.' };

    const hasNumber = !!(numeroExterior && String(numeroExterior).trim()) || /#\s*\d+|\bNo\.?\s*\d+|\b\d{1,6}\b/.test(fullText);
    const hasColonia = /\bcol(?:onia)?\.?\s+\w+/i.test(fullText) || (colonia && colonia.trim().length > 0);
    const hasEntre = /\bentre\b|\bentre calles\b/i.test(fullText);
    const hasEsquina = /\besquina\b|\besq\.?\b/i.test(fullText);
    const hasCruce = /\bcruce\b|\bcruce con\b|\bcruce de\b/i.test(fullText);
    const hasReferencia = /\breferencia\b|\bref\.?\b/i.test(fullText) || (referencia && referencia.trim().length > 0);
    const hasPlace = /\bparque\b|\bescuela\b|\bhospital\b|\bplaza\b|\btienda\b|\boxxo\b/i.test(fullText);

    if (!noNumero && !hasNumber && !hasColonia && !hasEntre && !hasEsquina && !hasCruce && !hasReferencia && !hasPlace) {
      return { valid: false, message: 'La ubicación está incompleta. Agrega número, colonia, cruce, esquina o una referencia cercana.' };
    }

    return { valid: true, message: '' };
  } catch (err) {
    return { valid: false, message: 'Error al validar la ubicación.' };
  }
}
export { validarUbicacionReporteBackend };
