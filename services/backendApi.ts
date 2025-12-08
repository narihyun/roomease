import { AppState } from '../types';

const GAS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzXjSvUCJLXQ8PWJGuHSMH4Z0f-KuWGbvKrSfyVVe2wjZSlM6xHRg6o8oz3bNqsOfOung/exec';


// Simple numeric-ish ID generator (timestamp + random)
const generateNumericId = (): string => {
  return `${Date.now()}${Math.floor(Math.random() * 900 + 100)}`; // e.g. "1765207113236123"
};

// Helper to parse GAS JSON or JSONP responses
const parseGASResponse = async (res: Response) => {
  const text = await res.text();
  console.debug('[backendApi] raw response text:', text);
  // Try JSON.parse first (some endpoints may return raw JSON)
  try {
    return JSON.parse(text);
  } catch (e) {
    // Fallback: JSONP like "cb({...})" or "callbackName({...});"
    const m = text.match(/^[^(]*\(([\s\S]*)\);?$/);
    if (m && m[1]) {
      try {
        return JSON.parse(m[1]);
      } catch (err) {
        console.error('[backendApi] JSONP inner parse error', err);
        throw err;
      }
    }
    throw new Error('Unrecognized response format');
  }
};

export const createHouseInBackend = async (data: Partial<AppState>) => {
  try {
    const houseId = generateNumericId();
    const stateToStore = { ...data, houseId };

    // IMPORTANT: Apps Script Read() filters by `id` column.
    // Ensure we write both `id` (number) and `house_id` (legacy) columns.
    const numericId = Number(houseId); // timestamp-based id should fit in JS number
    const rowPayload = {
      id: numericId,           // <- 반드시 추가: GAS _read에서 record.id와 비교
      house_id: houseId,      // <- 기존 컬럼명도 유지 (안정성)
      data: JSON.stringify(stateToStore),
      updated_at: new Date().toLocaleString('ko-KR')
    };

    const params = new URLSearchParams({
      action: 'insert',
      table: 'Houses',
      data: JSON.stringify(rowPayload),
      callback: 'cb' // request JSONP so GAS returns cb(...)
    });

    console.log('[backendApi] Creating house with ID:', houseId);
    const res = await fetch(`${GAS_SCRIPT_URL}?${params.toString()}`);
    if (!res.ok) throw new Error('Network response was not ok');

    const json = await parseGASResponse(res);
    console.debug('[backendApi] createHouse response parsed:', json);
    if (json && json.success) {
      return { success: true, houseId };
    }
    return { success: false, raw: json };
  } catch (e) {
    console.error("Create House Error:", e);
    return { success: false };
  }
};

export const updateHouseInBackend = async (houseId: string, data: Partial<AppState>) => {
  try {
    const rowPayload = {
      data: JSON.stringify(data),
      updated_at: new Date().toLocaleString('ko-KR')
    };
    const params = new URLSearchParams({
      action: 'update',
      table: 'Houses',
      id: houseId,
      data: JSON.stringify(rowPayload),
      callback: 'cb'
    });

    console.log('[backendApi] Updating house:', houseId);
    const res = await fetch(`${GAS_SCRIPT_URL}?${params.toString()}`);
    if (!res.ok) throw new Error('Network response was not ok');

    const json = await parseGASResponse(res);
    console.debug('[backendApi] updateHouse response parsed:', json);
    if (json && json.success) {
      return { success: true };
    }
    return { success: false, raw: json };
  } catch (e) {
    console.error("Update House Error:", e);
    return { success: false };
  }
};

export const getHouseFromBackend = async (houseId: string) => {
  try {
    const params = new URLSearchParams({
      action: 'read',
      table: 'Houses',
      id: houseId,
      callback: 'cb'
    });

    console.log('[backendApi] Fetching house with ID:', houseId);
    const res = await fetch(`${GAS_SCRIPT_URL}?${params.toString()}`);
    if (!res.ok) throw new Error('Network response was not ok');

    const json = await parseGASResponse(res);
    console.log('[backendApi] getHouseFromBackend full response:', json);

    // Check if request was successful
    if (!json || !json.success) {
      console.error('[backendApi] Request failed:', json);
      return { success: false, raw: json };
    }

    // Check if data exists
    if (!json.data) {
      console.error('[backendApi] No data in response');
      return { success: false, raw: json };
    }

    console.log('[backendApi] json.data:', json.data);
    console.log('[backendApi] json.data.data:', json.data.data);

    // GAS row object stores the original payload under the "data" column (stringified)
    // Try multiple possible locations for the actual state data
    let stored = null;
    
    if (json.data.data) {
      // Standard case: data is in json.data.data column
      stored = json.data.data;
      console.log('[backendApi] Found data in json.data.data');
    } else if (typeof json.data === 'string') {
      // Fallback: entire json.data is a stringified object
      stored = json.data;
      console.log('[backendApi] json.data is a string, parsing directly');
    } else if (json.data.house_id || json.data.houseId || json.data.houseName) {
      // Fallback: json.data already is the AppState
      stored = json.data;
      console.log('[backendApi] json.data appears to be AppState directly');
    } else {
      console.error('[backendApi] Could not find state data in any expected location');
      return { success: false, raw: json };
    }

    // Parse if it's a string
    try {
      const appState = typeof stored === 'string' ? JSON.parse(stored) : stored;
      console.log('[backendApi] Successfully parsed AppState:', appState);
      return { success: true, data: appState };
    } catch (parseError) {
      console.error('[backendApi] JSON Parse Error for House Data:', parseError);
      console.error('[backendApi] Attempted to parse:', stored);
      return { success: false, raw: json };
    }
  } catch (e) {
    console.error('[backendApi] Get House Error:', e);
    return { success: false };
  }
};