const DATA_URL = 'https://raw.githubusercontent.com/Ahmadi0101/mtm-price-data/main/data.json';

export async function fetchRemoteData() {
  try {
    const response = await fetch(`${DATA_URL}?t=${Date.now()}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`GitHub Error: ${response.status}`);
    }

    const remoteData = await response.json();

    if (!remoteData || typeof remoteData !== 'object' || !Array.isArray(remoteData.locations)) {
      throw new Error('ساختار data.json نادرست است');
    }

    return remoteData;
  } catch (error) {
    console.error('Remote data error:', error);
    return null;
  }
}

/**
 * بررسی می‌کند که اطلاعات GitHub با اطلاعات فعلی فرق دارد یا نه.
 * فقط به version وابسته نیست.
 */
export async function checkForUpdate(currentData) {
  const remoteData = await fetchRemoteData();

  // اینترنت / GitHub در دسترس نیست
  if (!remoteData) {
    return {
      updated: false,
      data: null,
      offline: true,
    };
  }

  let localString = '';
  let remoteString = '';

  try {
    localString = JSON.stringify(currentData || {});
    remoteString = JSON.stringify(remoteData);
  } catch (error) {
    console.error('Data comparison error:', error);
  }

  const updated = localString !== remoteString;

  return {
    updated,
    data: updated ? remoteData : null,
    offline: false,
    remoteVersion: Number(remoteData.version || 0),
    localVersion: Number(currentData?.version || 0),
  };
}
