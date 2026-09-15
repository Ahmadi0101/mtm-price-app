import { useEffect, useMemo, useRef, useState } from 'react';
import { FaCalculator } from 'react-icons/fa';

import data from './data/data.json';

import VehicleRates from './components/VehicleRates';
import MapView from './components/MapView';
import Calculator from './components/Calculator';

import { getSavedData, saveData } from './utils/storage';
import { checkForUpdate } from './utils/github';

import './App.css';

function App() {
  /* =========================================
     VEHICLE RATES
  ========================================= */

  const [vehicleRatePage, setVehicleRatePage] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [selectedVehiclePriceUsd, setSelectedVehiclePriceUsd] = useState(0);

  /* =========================================
     APP DATA
  ========================================= */

  const [appData, setAppData] = useState(() => {
    const saved = getSavedData();

    if (saved && Array.isArray(saved.locations)) {
      console.log('💾 اطلاعات از حافظه محلی دریافت شد');
      return saved;
    }

    console.log('📦 اطلاعات اولیه data.json استفاده شد');

    return data;
  });

  /* =========================================
     SEARCH
  ========================================= */

  const [search, setSearch] = useState('');

  /* =========================================
     LOCATION
  ========================================= */

  const [selectedLocationId, setSelectedLocationId] = useState(null);

  const [selectedLocation, setSelectedLocation] = useState(null);

  /* =========================================
     PORT
  ========================================= */

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
     SAVE DATA LOCALLY
  ========================================= */

  useEffect(() => {
    if (!appData) return;

    saveData(appData);

    console.log('💾 اطلاعات در حافظه محلی ذخیره شد');
  }, [appData]);

  /* =========================================
     APP DATA REF
  ========================================= */

  const appDataRef = useRef(appData);

  useEffect(() => {
    appDataRef.current = appData;
  }, [appData]);

  /* =========================================
     CHECK GITHUB UPDATE
  ========================================= */

  useEffect(() => {
    let mounted = true;
    let checking = false;

    const updateData = async () => {
      if (checking) return;

      checking = true;

      if (mounted) {
        setUpdateStatus('checking');
      }

      console.log('🌐 در حال بررسی اطلاعات GitHub...');

      try {
        const result = await checkForUpdate(appDataRef.current);

        if (!mounted) return;

        /* =====================================
           OFFLINE
        ===================================== */

        if (result.offline) {
          console.log('📴 GitHub در دسترس نیست؛ حالت آفلاین');

          setUpdateStatus('offline');

          return;
        }

        /* =====================================
           NEW DATA
        ===================================== */

        if (result.updated && result.data) {
          console.log('🆕 اطلاعات جدید از GitHub دریافت شد');

          console.log(`📦 Version: ${result.localVersion} → ${result.remoteVersion}`);

          /*
           * ذخیره اطلاعات جدید
           */
          saveData(result.data);

          /*
           * Ref
           */
          appDataRef.current = result.data;

          /*
           * React State
           */
          setAppData(result.data);

          setUpdateStatus('updated');

          /*
           * تعداد Location
           */
          console.log('📍 تعداد Location:', result.data.locations?.length || 0);

          /*
           * تعداد Vehicle
           */
          const vehicleCount =
            result.data.locations?.reduce((total, location) => {
              return total + (Array.isArray(location.vehicles) ? location.vehicles.length : 0);
            }, 0) || 0;

          console.log('🚗 تعداد Vehicle:', vehicleCount);

          return;
        }

        /* =====================================
           LATEST
        ===================================== */

        console.log('✅ اطلاعات برنامه به‌روز است');

        setUpdateStatus('latest');
      } catch (error) {
        console.error('❌ Update check error:', error);

        if (mounted) {
          setUpdateStatus('offline');
        }
      } finally {
        checking = false;
      }
    };

    /*
     * اولین بررسی
     */
    updateData();

    /*
     * وقتی اینترنت وصل شد
     */
    const handleOnline = () => {
      console.log('🌐 اینترنت وصل شد؛ بررسی دوباره GitHub...');

      updateData();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      mounted = false;

      window.removeEventListener('online', handleOnline);
    };
  }, []);

  /* =========================================
     LOCATION SEARCH
  ========================================= */

  const locations = useMemo(() => {
    if (!appData || !Array.isArray(appData.locations)) {
      return [];
    }

    const text = search.trim().toLowerCase();

    let filteredLocations = appData.locations;

    /* =====================================
       SEARCH
    ===================================== */

    if (text) {
      filteredLocations = appData.locations.filter((item) => {
        const portText = Array.isArray(item.ports) ? item.ports.map((port) => port?.name || '').join(' ') : '';

        const searchableText = [item.state, item.branch, item.city, item.source, portText].filter(Boolean).join(' ').toLowerCase();

        return searchableText.includes(text);
      });
    }

    /* =====================================
       SELECTED LOCATION
    ===================================== */

    if (selectedLocationId) {
      /*
       * اگر Location انتخاب شده،
       * همان Location نمایش داده شود.
       */
      filteredLocations = appData.locations.filter((location) => location.id === selectedLocationId);
    }

    return filteredLocations;
  }, [search, appData, selectedLocationId]);

  /* =========================================
     SELECT LOCATION
  ========================================= */

  const selectLocation = (location) => {
    if (!location) return;

    setSelectedLocationId(location.id);

    setSelectedLocation(location);

    setSelectedPort(null);
  };

  /* =========================================
     SELECT PORT
  ========================================= */

  const selectPort = (location, port) => {
    if (!location || !port) return;

    setSelectedLocationId(location.id);

    setSelectedLocation(location);

    setSelectedPort(port);
  };

  /* =========================================
     OPEN CALCULATOR
  ========================================= */

  const openCalculator = (location, port) => {
    if (!location || !port) return;

    selectPort(location, port);

    setCalculator({
      location,
      port,
    });
  };

  /* =========================================
     CLEAR LOCATION
  ========================================= */

  const clearSelectedLocation = () => {
    setSelectedLocationId(null);

    setSelectedLocation(null);

    setSelectedPort(null);
  };

  /* =========================================
     SEARCH CHANGE
  ========================================= */

  const handleSearch = (value) => {
    setSearch(value);

    /*
     * با تغییر Search،
     * Location قبلی پاک شود.
     */
    setSelectedLocationId(null);

    setSelectedLocation(null);

    setSelectedPort(null);
  };

  /* =========================================
     CLOSE CALCULATOR
  ========================================= */

  const closeCalculator = () => {
    setCalculator(null);
  };

  /* =========================================
     SELECT VEHICLE
  ========================================= */

  const handleSelectVehicle = (vehicle) => {
    if (!vehicle) return;

    /*
     * ذخیره Vehicle کامل
     */
    setSelectedVehicle(vehicle);

    /*
     * ذخیره قیمت گمرک به دالر
     */
    const priceUsd = Number(vehicle.price_usd || 0);

    setSelectedVehiclePriceUsd(priceUsd);

    console.log('🚗 Vehicle انتخاب شد:', vehicle.name);

    console.log('📅 Year:', vehicle.year);

    console.log('💰 Customs AFN:', vehicle.price_afn);

    console.log('💵 Customs USD:', priceUsd);

    console.log('💱 Dollar Rate:', vehicle.dollar_rate);
  };

  /* =========================================
     OPEN VEHICLE RATES
  ========================================= */

  const openVehicleRates = () => {
    console.log('🚗 صفحه نرخ گمرک باز شد');

    console.log('📦 تعداد Location:', appData?.locations?.length || 0);

    const vehicleCount =
      appData?.locations?.reduce((total, location) => {
        return total + (Array.isArray(location.vehicles) ? location.vehicles.length : 0);
      }, 0) || 0;

    console.log('🚘 تعداد Vehicle:', vehicleCount);

    /*
     * بدون نیاز به انتخاب Location
     */
    setVehicleRatePage(true);
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
            SELECTED LOCATION
        =================================== */}

        {selectedLocation && (
          <div className="selected-location-filter">
            <div className="selected-location-info">
              <span className="selected-location-icon">📍</span>

              <div className="selected-location-text">
                <strong>{selectedLocation.city || selectedLocation.branch}</strong>

                {selectedLocation.branch && selectedLocation.city && selectedLocation.branch !== selectedLocation.city && (
                  <span>{selectedLocation.branch}</span>
                )}
              </div>
            </div>

            <button type="button" className="selected-location-clear" onClick={clearSelectedLocation} aria-label="حذف Location انتخاب شده">
              ×
            </button>
          </div>
        )}

        {/* ===================================
            RESULT COUNT
        =================================== */}

        {!selectedLocation && <div className="result-count">تعداد برنچ های: {locations.length}</div>}

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
                  {/* LOCATION HEADER */}

                  <div className="location-header">
                    <div>
                      <h2>{location.city}</h2>

                      <span>{location.state}</span>
                    </div>

                    <div className="location-header-right">
                      <div className="branch">{location.branch}</div>

                      <div
                        className={`location-source source-${String(location.source || 'OTHER')
                          .trim()
                          .toLowerCase()}`}
                      >
                        {String(location.source || 'OTHER').toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* PORTS */}

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

                              selectPort(location, port);
                            }}
                          >
                            {/* PORT NAME */}

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
                          </div>
                        );
                      })}
                  </div>

                  {/* COORDINATES */}

                  <div className="coordinates">
                    📍 {location.lat}, {location.lng}
                  </div>
                </div>
              );
            })}

            {/* NO RESULT */}

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

      {/* =====================================
          VEHICLE CUSTOMS BUTTON
      ===================================== */}

      <button type="button" className="floating-customs-button" onClick={openVehicleRates} aria-label="نرخ گمرک موتر">
        <span className="floating-car-icon">
          <img src={`${import.meta.env.BASE_URL}Vehicles.jpg`} alt="Vehicle Documents" className="flat-imge" />
        </span>
      </button>

      {/* =====================================
          VEHICLE RATES
      ===================================== */}

      {vehicleRatePage && (
        <VehicleRates
          appData={appData}
          selectedVehicle={selectedVehicle}
          onClose={() => setVehicleRatePage(false)}
          onSelectVehicle={handleSelectVehicle}
        />
      )}
    </div>
  );
}

export default App;
