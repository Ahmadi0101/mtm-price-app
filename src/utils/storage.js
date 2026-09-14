const STORAGE_KEY = 'mtm-price-data';

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

export function getSavedData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return null;
    }

    const parsed = JSON.parse(saved);

    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.locations)) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Error reading saved data:', error);

    return null;
  }
}

export function clearSavedData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}
