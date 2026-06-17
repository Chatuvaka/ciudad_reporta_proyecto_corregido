// Validator for ubicacion field (frontend) - ES module
function normalizeText(value = '') {
  return value.normalize
    ? value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
    : value.toLowerCase();
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

export function validarUbicacionBasica(ubicacion = '') {
  const raw = (ubicacion || '').trim();
  const normalized = normalizeText(raw);

  if (!raw) return { valid: false, message: 'La ubicación es obligatoria.' };
  if (raw.length < 15) return { valid: false, message: 'La ubicación es demasiado corta. Agrega calle, número, colonia o referencia.' };

  const lower = normalizeText(raw);
  const banned = ['ejemplo', 'test', 'prueba', 'asdf', 'sin ubicacion', 'sin ubic', 'sin ubicaci', 'no se', 'nose', 'ninguna', 'calle falsa', 'domicilio falso'];
  for (const b of banned) if (lower.includes(b)) return { valid: false, message: 'Ingresa una ubicación real, no un texto de prueba.' };

  const coordRegex = /[-+]?\d{1,3}\.\d+\s*[,;]\s*[-+]?\d{1,3}\.\d+/;
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
  if (entreRegex.test(lower) || esquinaRegex.test(lower) || cruceRegex.test(lower) || frenteRegex.test(lower) || cercaRegex.test(lower) || aLadoRegex.test(lower) || referenciaRegex.test(lower) || placeRegex.test(lower)) {
    return { valid: true, message: '' };
  }

  const streetLike = /\bcalle\b|\bc\.\b|\bavenida\b|\bav\.?\b|\bprol\.?\b|\bcamino\b|\bcarretera\b|\bcallejon\b|\bcalz\.?\b/i;
  if (streetLike.test(lower)) return { valid: false, message: 'La ubicación está incompleta. Agrega número, colonia, cruce, esquina o una referencia cercana.' };

  return { valid: false, message: 'La ubicación está incompleta. Agrega número, colonia, cruce, esquina o una referencia cercana.' };
}

// Structured validator for report submissions
export function validarUbicacionReporte(data = {}) {
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
