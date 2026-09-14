import { useEffect, useMemo, useRef, useState } from 'react';
import { FaCalculator } from 'react-icons/fa';
import data from './data/data.json';

import MapView from './components/MapView';
import Calculator from './components/Calculator';

import { getSavedData, saveData } from './utils/storage';
import { checkForUpdate } from './utils/github';

import './App.css';

function App() {
  /* =========================================
     DATA
  ========================================= */

  const [appData, setAppData] = useState(() => {
    const saved = getSavedData();

    if (saved && Array.isArray(saved.locations)) {
      return saved;
    }

    return data;
  });

  /* =========================================
     SEARCH
  ========================================= */

  const [search, setSearch] = useState('');

  /* =========================================
     SELECTED LOCATION
  ========================================= */

  const [selectedLocationId, setSelectedLocationId] = useState(null);

  /* =========================================
     MAP SELECTION
  ========================================= */

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedPort, setSelectedPort] = useState(null);

  /* =========================================
     CALCULATOR
  ========================================= */

  const [calculator, setCalculator] = useState(null);

  /* =========================================
     UPDATE STATUS
  ========================================= */

  const [updateStatus, setUpdateStatus] = useState('checking');

  /* =========================================
     SAVE DATA
  ========================================= */

  useEffect(() => {
    saveData(appData);
  }, [appData]);

  /* =========================================
     CHECK GITHUB UPDATE
  ========================================= */

  const appDataRef = useRef(appData);

  useEffect(() => {
    appDataRef.current = appData;
  }, [appData]);

  useEffect(() => {
    let mounted = true;
    let checking = false;

    async function updateData() {
      // اگر همزمان یک بررسی دیگر در جریان است، دوباره اجرا نشود
      if (checking) return;

      checking = true;

      if (mounted) {
        setUpdateStatus('checking');
      }

      try {
        const result = await checkForUpdate(appDataRef.current);

        if (!mounted) return;

        // اینترنت یا GitHub در دسترس نیست
        if (result.offline) {
          setUpdateStatus('offline');
          return;
        }

        // اطلاعات GitHub تغییر کرده
        if (result.updated && result.data) {
          // اول ذخیره کن
          saveData(result.data);

          // بعد اطلاعات برنامه را عوض کن
          appDataRef.current = result.data;
          setAppData(result.data);

          setUpdateStatus('updated');

          console.log('✅ اطلاعات جدید GitHub دریافت شد');
          console.log(`📦 Version: ${result.localVersion} → ${result.remoteVersion}`);

          return;
        }

        // اطلاعات همان قبلی است
        setUpdateStatus('latest');

        console.log('✅ اطلاعات برنامه به‌روز است');
      } catch (error) {
        console.error('Update check error:', error);

        if (mounted) {
          setUpdateStatus('offline');
        }
      } finally {
        checking = false;
      }
    }

    // بررسی هنگام باز شدن برنامه
    updateData();

    // وقتی اینترنت دوباره وصل شد
    const handleOnline = () => {
      console.log('🌐 اینترنت وصل شد؛ بررسی GitHub...');
      updateData();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      mounted = false;
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  /* =========================================
     SEARCH RESULTS
  ========================================= */

  const locations = useMemo(() => {
    // اگر یک برنچ انتخاب شده، فقط همان برنچ را نشان بده
    if (selectedLocationId) {
      return appData.locations.filter((location) => location.id === selectedLocationId);
    }

    const text = search.trim().toLowerCase();

    // اگر سرچ خالی است، همه Locationها
    if (!text) {
      return appData.locations;
    }

    // جستجو
    return appData.locations.filter((item) => {
      const portText = Array.isArray(item.ports) ? item.ports.map((port) => port?.name || '').join(' ') : '';

      const searchableText = [item.state, item.branch, item.city, portText].filter(Boolean).join(' ').toLowerCase();

      return searchableText.includes(text);
    });
  }, [search, appData, selectedLocationId]);

  /* =========================================
     SELECT LOCATION
  ========================================= */

  const selectLocation = (location) => {
    if (!location) return;

    setSelectedLocationId(location.id);
    setSelectedLocation(location);
    setSelectedPort(null);

    // نام شهر/برنچ را داخل Search قرار بده
    setSearch(location.city || location.branch || '');
  };

  /* =========================================
     SELECT PORT
  ========================================= */
  const selectPort = (location, port) => {
    if (!location || !port) return;

    setSelectedLocationId(location.id);
    setSelectedLocation(location);
    setSelectedPort(port);

    // نام شهر / برنچ در Search
    setSearch(location.city || location.branch || '');
  };

  /* =========================================
     OPEN CALCULATOR
  ========================================= */

  const openCalculator = (location, port) => {
    if (!location || !port) return;

    /*
      پورت را برای نقشه هم انتخاب می‌کنیم
      تا مسیر سبز نمایش داده شود.
    */
    selectPort(location, port);

    setCalculator({
      location,
      port,
    });
  };

  /* =========================================
     SEARCH CHANGE
  ========================================= */

  const handleSearch = (value) => {
    setSearch(value);

    if (!value.trim()) {
      setSelectedLocationId(null);
      setSelectedLocation(null);
      setSelectedPort(null);
    } else {
      // وقتی کاربر خودش سرچ می‌کند،
      // انتخاب قبلی دیگر محدودکننده نباشد
      setSelectedLocationId(null);
      setSelectedLocation(null);
      setSelectedPort(null);
    }
  };

  /* =========================================
     CLOSE CALCULATOR
  ========================================= */

  const closeCalculator = () => {
    setCalculator(null);
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="app">
      {/* =====================================
          HEADER
      ===================================== */}

      <header className="header">
        <div className="header-content">
          <div className="header-logo">
            <img src={`${import.meta.env.BASE_URL}LOGO.png`} alt="MTM" className="header-logo-image" />
          </div>

          <div className="update-status">
            {updateStatus === 'checking' && '⏳ بررسی اطلاعات...'}
            {updateStatus === 'updated' && '✅ اطلاعات جدید دریافت شد'}
            {updateStatus === 'latest' && '✓ اطلاعات به‌روز است'}
            {updateStatus === 'offline' && '📴 حالت آفلاین'}
          </div>
        </div>
      </header>

      {/* =====================================
          MAIN
      ===================================== */}

      <main className="container">
        {/* ===================================
            SEARCH
        =================================== */}

        <div className="search-box">
          <input
            type="text"
            placeholder="... جستجوی شهر، برنچ، ایالت یا پورت"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />

          {search && (
            <button type="button" className="clear-search" onClick={() => handleSearch('')} aria-label="پاک کردن جستجو">
              ×
            </button>
          )}
        </div>

        {/* ===================================
            RESULT COUNT
        =================================== */}

        <div className="result-count">{locations.length} نتیجه پیدا شد</div>

        {/* ===================================
            MAP
        =================================== */}

        <div className="map-section">
          <MapView
            locations={locations}
            selectedLocation={selectedLocation}
            selectedPort={selectedPort}
            onSelectLocation={selectLocation}
            onSelectPort={selectPort}
          />
        </div>

        {/* ===================================
            LOCATIONS
        =================================== */}
        <div className="locations-scroll">
          <div className="locations">
            {locations.map((location) => {
              const isSelected = selectedLocationId === location.id;

              return (
                <div
                  className={`location-card ${isSelected ? 'selected-location' : ''}`}
                  key={location.id}
                  onClick={() => selectLocation(location)}
                >
                  {/* =========================
                    LOCATION HEADER
                ========================= */}

                  <div className="location-header">
                    <div>
                      <h2>{location.city}</h2>

                      <span>{location.state}</span>
                    </div>

                    <div className="branch">{location.branch}</div>
                  </div>

                  {/* =========================
                    PORTS
                ========================= */}

                  <div className="ports">
                    {Array.isArray(location.ports) &&
                      location.ports.map((port, index) => {
                        const isPortSelected = selectedLocation?.id === location.id && selectedPort?.name === port.name;

                        return (
                          <div
                            className={`port-card ${isPortSelected ? 'selected-port' : ''}`}
                            key={`${location.id}-${index}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              selectLocation(location);
                              /*
                                انتخاب پورت
                                و نمایش مسیر روی نقشه
                              */
                              selectPort(location, port);
                            }}
                          >
                            {/* PORT */}

                            <div className="port-name">🚢 {port.name}</div>

                            {/* PRICES */}

                            <div className="prices">
                              {/* SHIP */}

                              <div>
                                <span>Ship</span>

                                <strong>${Number(port.ship || 0).toLocaleString()}</strong>
                              </div>

                              {/* HERAT */}

                              <div>
                                <span>Herat</span>

                                <strong>${Number(port.herat || 0).toLocaleString()}</strong>
                              </div>

                              {/* TOTAL */}

                              <div
                                className="total clickable-total"
                                onClick={(e) => {
                                  e.stopPropagation();

                                  openCalculator(location, port);
                                }}
                              >
                                <FaCalculator className="total-calculator-bg" />

                                <span>Total</span>

                                <strong>${Number(port.total || 0).toLocaleString()}</strong>
                              </div>
                            </div>

                            {/* CALCULATE BUTTON */}

                            {/* <button
                              type="button"
                              className="calculate-button"
                              onClick={(e) => {
                                e.stopPropagation();

                                openCalculator(
                                  location,
                                  port
                                );
                              }}
                            >
                              محاسبه قیمت
                            </button> */}
                          </div>
                        );
                      })}
                  </div>

                  {/* =========================
                    COORDINATES
                ========================= */}

                  <div className="coordinates">
                    📍 {location.lat}, {location.lng}
                  </div>
                </div>
              );
            })}

            {/* =================================
              NO RESULT
          ================================= */}

            {locations.length === 0 && (
              <div className="no-result">
                <div>🔍</div>

                <strong>نتیجه‌ای پیدا نشد</strong>

                <span>نام شهر، برنچ، ایالت یا پورت را بررسی کنید.</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* =====================================
          CALCULATOR
      ===================================== */}

      {calculator && <Calculator location={calculator.location} port={calculator.port} onClose={closeCalculator} />}
    </div>
  );
}

export default App;
