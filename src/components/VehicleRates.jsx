import { useMemo, useState } from 'react';
import { FaSearch, FaCar, FaCheck, FaTimes } from 'react-icons/fa';

export default function VehicleRates({ appData, selectedVehicle, onClose, onSelectVehicle }) {
  const [search, setSearch] = useState('');

  // =========================================
  // VEHICLES
  // =========================================

  const vehicles = useMemo(() => {
    if (!Array.isArray(appData?.vehicles)) {
      console.log('❌ vehicles پیدا نشد');
      return [];
    }

    const dollarRate = Number(appData?.price_usd || 0);

    const result = appData.vehicles.map((vehicle) => {
      const priceAfn = Number(vehicle.price_afn || 0);

      const priceUsd = dollarRate > 0 ? priceAfn / dollarRate : 0;

      return {
        ...vehicle,

        price_afn: priceAfn,
        price_usd: priceUsd,
        dollar_rate: dollarRate,
      };
    });

    console.log('🚗 تعداد نرخ موتر:', result.length);
    console.log('💵 نرخ دالر:', dollarRate);
    console.log('🚗 Vehicle Rates:', result);

    return result;
  }, [appData]);

  // =========================================
  // SEARCH
  // =========================================

  const filteredVehicles = useMemo(() => {
    const text = search.trim().toLowerCase();

    if (!text) {
      return vehicles;
    }

    return vehicles.filter((vehicle) => {
      const searchableText = [vehicle.name, vehicle.year, vehicle.price_afn, vehicle.price_usd]
        .filter((value) => value !== undefined && value !== null)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(text);
    });
  }, [vehicles, search]);

  // =========================================
  // FORMAT
  // =========================================

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString('en-US');
  };

  // =========================================
  // SELECT
  // =========================================

  const handleSelectVehicle = (vehicle) => {
    const selectedData = {
      ...vehicle,

      price_afn: Number(vehicle.price_afn || 0),
      price_usd: Number(vehicle.price_usd || 0),
      dollar_rate: Number(vehicle.dollar_rate || 0),
    };

    console.log('✅ موتر انتخاب شد:', selectedData);

    onSelectVehicle(selectedData);
  };

  return (
    <div className="vehicle-rates-overlay">
      <div className="vehicle-rates-page" onClick={(e) => e.stopPropagation()}>
        {/* =====================================
            HEADER
        ===================================== */}

        <div className="vehicle-rates-header">
          <div className="vehicle-rates-title">
            <div className="vehicle-rates-title-icon">
              <FaCar />
            </div>

            <div>
              <h2>نرخ گمرک موتر</h2>

              <p>{vehicles.length} نرخ موجود است</p>
            </div>
          </div>

          <button type="button" className="vehicle-rates-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* =====================================
            DOLLAR RATE
        ===================================== */}

        <div className="vehicle-dollar-rate">
          <span>نرخ دالر</span>

          <strong>؋{formatNumber(appData?.price_usd)}</strong>
        </div>

        {/* =====================================
            SEARCH
        ===================================== */}

        <div className="vehicle-rates-search">
          <FaSearch />

          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی نام موتر یا سال..." />

          {search && (
            <button type="button" className="vehicle-rates-search-clear" onClick={() => setSearch('')}>
              ×
            </button>
          )}
        </div>

        {/* =====================================
            COUNT
        ===================================== */}

        <div className="vehicle-rates-count">{filteredVehicles.length} نرخ پیدا شد</div>

        {/* =====================================
            LIST
        ===================================== */}

        <div className="vehicle-rates-list">
          {filteredVehicles.map((vehicle) => {
            const isSelected =
              selectedVehicle?.id === vehicle.id && selectedVehicle?.year === vehicle.year && selectedVehicle?.name === vehicle.name;

            const priceAfn = Number(vehicle.price_afn || 0);

            const priceUsd = Number(vehicle.price_usd || 0);

            return (
              <div key={`${vehicle.id}-${vehicle.year}`} className={`vehicle-rate-row ${isSelected ? 'vehicle-rate-row-selected' : ''}`}>
                {/* SELECT */}

                <button
                  type="button"
                  className={`vehicle-rate-select ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectVehicle(vehicle)}
                >
                  {isSelected && <FaCheck />}
                </button>

                {/* CAR */}

                <div className="vehicle-rate-car">
                  <strong>{vehicle.name || '-'}</strong>

                  <span>مدل {vehicle.year || '-'}</span>
                </div>

                {/* AFN */}

                <div className="vehicle-rate-afn">
                  <span>افغانی</span>

                  <strong>؋{formatNumber(priceAfn)}</strong>
                </div>

                {/* USD */}

                <div className="vehicle-rate-usd">
                  <span>دالر</span>

                  <strong>
                    $
                    {priceUsd.toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </div>
              </div>
            );
          })}

          {/* EMPTY */}

          {filteredVehicles.length === 0 && (
            <div className="vehicle-rates-empty">
              <FaCar />

              <strong>نرخ پیدا نشد</strong>

              <span>نام موتر یا سال را بررسی کنید.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
