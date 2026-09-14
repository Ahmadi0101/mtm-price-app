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

export async function checkForUpdate(currentVersion) {
  const remoteData = await fetchRemoteData();

  if (!remoteData) {
    return {
      updated: false,
      data: null,
      offline: true,
    };
  }

  const remoteVersion = Number(remoteData.version || 0);

  const localVersion = Number(currentVersion || 0);

  if (remoteVersion > localVersion) {
    return {
      updated: true,
      data: remoteData,
      offline: false,
    };
  }

  return {
    updated: false,
    data: null,
    offline: false,
    remoteVersion,
    localVersion,
  };
}
