import { useEffect, useMemo, useRef, useState } from 'react';
import { FaCalculator,FaCarSide, FaSearch } from 'react-icons/fa';
import { FaSave } from 'react-icons/fa';
import SavedCalculations from './components/SavedCalculations';
import data from './data/data.json';

import VehicleRates from './components/VehicleRates';
import MapView from './components/MapView';
import Calculator from './components/Calculator';

import { getSavedData, saveData } from './utils/storage';
import { checkForUpdate } from './utils/github';

import './App.css';
import VehicleSales from './components/VehicleSales';

function App() {
  /* =========================================
     VEHICLE RATES
  ========================================= */

  const [vehicleRatePage, setVehicleRatePage] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [selectedVehiclePriceUsd, setSelectedVehiclePriceUsd] = useState(0);

  const [savedCalculationsPage, setSavedCalculationsPage] = useState(false);

  const [vehicleSalesPage, setVehicleSalesPage] = useState(false);

  /* =========================================
     UPDATE STATUS
  ========================================= */

  const [updateStatus, setUpdateStatus] = useState('checking');
  const [showUpdateStatus, setShowUpdateStatus] = useState(false);

  /* =========================================
     APP DATA
  ========================================= */

  useEffect(() => {
    // فقط وقتی وضعیت به updated یا latest تغییر کرد
    if (updateStatus === 'updated' || updateStatus === 'latest') {
      setShowUpdateStatus(true);

      const timer = setTimeout(() => {
        setShowUpdateStatus(false);
      }, 5000);

      return () => clearTimeout(timer);
    }

    // آفلاین باید تا زمان آنلاین شدن نمایش داده شود
    if (updateStatus === 'offline') {
      setShowUpdateStatus(true);
    }
  }, [updateStatus]);

  const [appData, setAppData] = useState(() => {
    const saved = getSavedData();

    if (saved && Array.isArray(saved.locations) && Array.isArray(saved.vehicles) && typeof saved.price_usd !== 'undefined') {
      console.log('💾 اطلاعات کامل از حافظه محلی دریافت شد');
      console.log('🚗 تعداد Vehicle:', saved.vehicles.length);
      console.log('💵 نرخ دالر:', saved.price_usd);

      return saved;
    }

    console.log('⚠️ حافظه محلی قدیمی یا ناقص است؛ data.json استفاده می‌شود');

    return data;

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
  const [popupCloseKey, setPopupCloseKey] = useState(0);
  /* =========================================
     PORT
  ========================================= */

  const [selectedPort, setSelectedPort] = useState(null);

  /* =========================================
     CALCULATOR
  ========================================= */

  const [calculator, setCalculator] = useState(null);

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
          const vehicleCount = Array.isArray(appData?.vehicles) ? appData.vehicles.length : 0;

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

    // بستن Popup نقشه
    setPopupCloseKey((prev) => prev + 1);
  };

  const handleRemoveVehicle = () => {
    setSelectedVehicle(null);
    setSelectedVehiclePriceUsd(0);
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

          <div className="header-actions">
            {showUpdateStatus && (
              <div className="update-status">
                {updateStatus === 'updated' && '✅ اطلاعات جدید دریافت شد'}
                {updateStatus === 'latest' && '✓ اطلاعات به‌روز است'}
                {updateStatus === 'offline' && '📴 حالت آفلاین'}
              </div>
            )}

            <button type="button" className="vehicle-sales-header-button" onClick={() => setVehicleSalesPage(true)} title="موتر فروشی">
              <span>موتر فروشی</span>
              <FaCarSide />
            </button>
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

        <div className="vehicle-rates-search">
          <FaSearch />

          <input
            type="search"
            inputMode="search"
            enterKeyHint="search"
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
            popupCloseKey={popupCloseKey}
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
                      <h2>{location.branch}</h2>

                      <span>{location.state}</span>
                    </div>

                    <div className="location-header-right">
                      <div className="branch">{location.city}</div>

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
                                <span>🇺🇸 → 🇹🇷</span>

                                <strong>${Number(port.ship || 0).toLocaleString()}</strong>
                              </div>

                              {/* HERAT */}

                              <div>
                                <span>🇹🇷 → 🇦🇫</span>

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
        {vehicleSalesPage && <VehicleSales onClose={() => setVehicleSalesPage(false)} />}
      </main>

      {/* =====================================
          CALCULATOR
      ===================================== */}

      {calculator && (
        <Calculator
          location={selectedLocation}
          port={selectedPort}
          onClose={() => setCalculator(false)}
          selectedVehicle={selectedVehicle}
          selectedVehiclePriceUsd={selectedVehiclePriceUsd}
          onOpenVehicleRates={() => setVehicleRatePage(true)}
          onRemoveVehicle={handleRemoveVehicle}
        />
      )}

      {/* =====================================
          VEHICLE CUSTOMS BUTTON
      ===================================== */}
      {!vehicleSalesPage && (
        <button type="button" className="floating-customs-button" onClick={openVehicleRates} aria-label="نرخ گمرک موتر">
          <span className="floating-car-icon">
            <img src={`${import.meta.env.BASE_URL}Vehicles.jpg`} alt="Vehicle Documents" className="flat-imge" />
          </span>
        </button>
      )}

      {/* =====================================
          VEHICLE RATES
      ===================================== */}

      {vehicleRatePage && (
        <VehicleRates
          appData={appData}
          selectedVehicle={selectedVehicle}
          onClose={() => setVehicleRatePage(false)}
          onSelectVehicle={(vehicle) => {
            console.log('🚗 موتر انتخاب شد:', vehicle);

            setSelectedVehicle(vehicle);

            setSelectedVehiclePriceUsd(Number(vehicle?.price_usd || 0));

            // صفحه گمرکات بسته شود
            setVehicleRatePage(false);
          }}
        />
      )}
      {savedCalculationsPage && (
        <div className="saved-calculations-overlay">
          <SavedCalculations
            onClose={() => setSavedCalculationsPage(false)}
            onOpenCalculation={(calculation) => {
              console.log('📂 محاسبه انتخاب شد:', calculation);

              setSavedCalculationsPage(false);

              // فعلاً فقط صفحه بسته می‌شود.
              // در مرحله بعد Calculator را با همین اطلاعات پر می‌کنیم.
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
