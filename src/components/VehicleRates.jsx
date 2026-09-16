import { useMemo, useRef, useState } from 'react';
import { FaSearch, FaCar, FaCheck, FaTimes } from 'react-icons/fa';

export default function VehicleRates({ appData, selectedVehicle, onClose, onSelectVehicle }) {
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchRef = useRef(null);

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

    return result;
  }, [appData]);

  // =========================================
  // NORMALIZE TEXT
  // =========================================

  const normalizeText = (value) => {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  };

  // =========================================
  // SEARCH PARTS
  // =========================================

  const searchParts = useMemo(() => {
    const text = normalizeText(search);

    if (!text) {
      return {
        fullText: '',
        nameText: '',
        yearText: '',
      };
    }

    const words = text.split(' ');

    let yearText = '';
    let nameText = text;

    /*
      مثال:

      Toyota Corolla
      name = Toyota Corolla
      year = ''

      Toyota Corolla 20
      name = Toyota Corolla
      year = 20

      Toyota Corolla 200
      name = Toyota Corolla
      year = 200

      Toyota Corolla 2004
      name = Toyota Corolla
      year = 2004

      2004
      name = ''
      year = 2004
    */

    const lastWord = words[words.length - 1];

    if (/^\d+$/.test(lastWord)) {
      yearText = lastWord;
      nameText = words.slice(0, -1).join(' ');
    }

    return {
      fullText: text,
      nameText,
      yearText,
    };
  }, [search]);

  // =========================================
  // FILTER TABLE
  // =========================================

  const filteredVehicles = useMemo(() => {
    const { fullText, nameText, yearText } = searchParts;

    // بدون سرچ
    if (!fullText) {
      return vehicles;
    }

    return vehicles.filter((vehicle) => {
      const vehicleName = normalizeText(vehicle.name);

      const vehicleYear = String(vehicle.year || '').trim();

      // -----------------------------
      // NAME
      // -----------------------------

      const nameMatches = !nameText || vehicleName.includes(nameText);

      // -----------------------------
      // YEAR
      // -----------------------------

      const yearMatches = !yearText || vehicleYear.startsWith(yearText);

      return nameMatches && yearMatches;
    });
  }, [vehicles, searchParts]);

  // =========================================
  // SEARCH SUGGESTIONS
  // =========================================

  const searchSuggestions = useMemo(() => {
    const { fullText, nameText, yearText } = searchParts;

    if (!fullText) {
      return [];
    }

    const suggestions = [];
    const seen = new Set();

    vehicles.forEach((vehicle) => {
      const vehicleName = String(vehicle.name || '').trim();

      const normalizedName = normalizeText(vehicleName);

      const vehicleYear = String(vehicle.year || '').trim();

      if (!vehicleName) {
        return;
      }

      // =====================================
      // NAME MATCH
      // =====================================

      const nameMatches = !nameText || normalizedName.includes(nameText);

      if (!nameMatches) {
        return;
      }

      // =====================================
      // YEAR MATCH
      // =====================================

      const yearMatches = !yearText || vehicleYear.startsWith(yearText);

      if (!yearMatches) {
        return;
      }

      // =====================================
      // وقتی سال در سرچ وجود دارد
      // نام + سال نمایش داده شود
      // =====================================

      if (yearText) {
        const label = `${vehicleName} ${vehicleYear}`;

        const key = normalizeText(label);

        if (!seen.has(key)) {
          seen.add(key);

          suggestions.push({
            type: 'vehicle-year',
            name: vehicleName,
            year: vehicleYear,
            label,
          });
        }

        return;
      }

      // =====================================
      // وقتی فقط نام سرچ شده
      // فقط نام یکتا نمایش داده شود
      // =====================================

      const key = normalizedName;

      if (!seen.has(key)) {
        seen.add(key);

        suggestions.push({
          type: 'vehicle-name',
          name: vehicleName,
          year: '',
          label: vehicleName,
        });
      }
    });

    // =====================================
    // مرتب‌سازی سال
    // =====================================

    if (yearText) {
      suggestions.sort((a, b) => {
        return Number(a.year || 0) - Number(b.year || 0);
      });
    }

    return suggestions.slice(0, 20);
  }, [vehicles, searchParts]);

  // =========================================
  // FORMAT NUMBER
  // =========================================

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString('en-US');
  };

  // =========================================
  // FORMAT USD
  // =========================================

  const formatUsd = (value) => {
    return Math.round(Number(value || 0)).toLocaleString('en-US');
  };

  // =========================================
  // CHECK SELECTED VEHICLE
  // =========================================

  const isVehicleSelected = (vehicle) => {
    return selectedVehicle?.id === vehicle.id && selectedVehicle?.year === vehicle.year && selectedVehicle?.name === vehicle.name;
  };

  // =========================================
  // SELECT VEHICLE
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

  // =========================================
  // SELECT SEARCH SUGGESTION
  // =========================================

  const handleSuggestionSelect = (item) => {
    /*
      اگر فقط نام باشد:

      Toyota Corolla

      اگر نام + سال باشد:

      Toyota Corolla 2004
    */

    const value = item.year ? `${item.name} ${item.year}` : item.name;

    setSearch(value);

    setShowSuggestions(false);

    requestAnimationFrame(() => {
      searchRef.current?.blur();
    });
  };

  // =========================================
  // SEARCH KEYBOARD
  // =========================================

  const handleSearchKeyDown = (e) => {
    // ENTER / RETURN
    if (e.key === 'Enter') {
      e.preventDefault();

      setShowSuggestions(false);

      searchRef.current?.blur();

      return;
    }

    // ESCAPE
    if (e.key === 'Escape') {
      e.preventDefault();

      setShowSuggestions(false);

      searchRef.current?.blur();
    }
  };

  // =========================================
  // CLEAR SEARCH
  // =========================================

  const handleClearSearch = () => {
    setSearch('');
    setShowSuggestions(false);

    requestAnimationFrame(() => {
      searchRef.current?.focus();
    });
  };

  // =========================================
  // SEARCH BLUR
  // =========================================

  const handleSearchBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  // =========================================
  // SEARCH CHANGE
  // =========================================

  const handleSearchChange = (e) => {
    const value = e.target.value;

    setSearch(value);

    if (value.trim()) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="vehicle-rates-overlay">
      <div className="vehicle-rates-page" onClick={(e) => e.stopPropagation()}>
        {/* =====================================
            HEADER
        ===================================== */}

        <div className="vehicle-rates-header">
          <button type="button" className="vehicle-rates-close" onClick={onClose} aria-label="بستن">
            <FaTimes />
          </button>

          <div className="vehicle-rates-title">
            <div>
              <h2>نرخ گمرک موتر</h2>

              <p>تعداد نرخ های موجود: {vehicles.length}</p>
            </div>

            <div className="vehicle-rates-title-icon">
              <FaCar />
            </div>
          </div>
        </div>

        {/* =====================================
            DOLLAR RATE
        ===================================== */}

        <div className="vehicle-dollar-rate">
          <span className="vehicle-n">نرخ دالر</span>

          <strong className="dollar-value">
            <span className="currency-symbol">؋</span>

            <span className="currency-number">{formatNumber(appData?.price_usd)}</span>
          </strong>
        </div>

        {/* =====================================
            SEARCH
        ===================================== */}

        <div className="vehicle-rates-search-container">
          <div className="vehicle-rates-search">
            <FaSearch />

            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={handleSearchChange}
              onFocus={() => {
                if (search.trim() && searchSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={handleSearchBlur}
              onKeyDown={handleSearchKeyDown}
              placeholder="جستجوی نام موتر یا سال..."
              enterKeyHint="search"
              autoComplete="off"
              spellCheck="false"
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleClearSearch}
                aria-label="پاک کردن"
              >
                ×
              </button>
            )}
          </div>

          {/* =====================================
              SEARCH SUGGESTIONS
          ===================================== */}

          {showSuggestions && search.trim() && searchSuggestions.length > 0 && (
            <div className="vehicle-search-suggestions">
              {searchSuggestions.map((item) => (
                <button
                  key={`${item.type}-${item.name}-${item.year}`}
                  type="button"
                  className="vehicle-search-suggestion"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSuggestionSelect(item)}
                >
                  <span className="suggestion-name">
                    {item.name}

                    {item.year && <span className="suggestion-year">{item.year}</span>}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* =====================================
            RESULT COUNT
        ===================================== */}

        <div className="vehicle-rates-count">{filteredVehicles.length} نرخ پیدا شد</div>

        {/* =====================================
            TABLE
        ===================================== */}

        <div className="vehicle-rates-list">
          {filteredVehicles.length > 0 ? (
            <div className="vehicle-rates-table-wrapper">
              <table className="vehicle-rates-table">
                <thead>
                  <tr>
                    <th className="col-select">انتخاب</th>

                    <th className="col-number">#</th>

                    <th className="col-car">نام موتر</th>

                    <th className="col-year">مدل</th>

                    <th className="col-afn">افغانی</th>

                    <th className="col-usd">دالر</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredVehicles.map((vehicle, index) => {
                    const selected = isVehicleSelected(vehicle);

                    const priceAfn = Number(vehicle.price_afn || 0);

                    const priceUsd = Number(vehicle.price_usd || 0);

                    return (
                      <tr key={`${vehicle.id}-${vehicle.year}-${index}`} className={selected ? 'vehicle-table-row-selected' : ''}>
                        {/* SELECT */}

                        <td className="col-select">
                          <button
                            type="button"
                            className={`vehicle-table-select ${selected ? 'selected' : ''}`}
                            onClick={() => handleSelectVehicle(vehicle)}
                            aria-label="انتخاب موتر"
                          >
                            {selected && <FaCheck />}
                          </button>
                        </td>

                        {/* NUMBER */}

                        <td className="col-number">
                          <span className="vehicle-row-number">{index + 1}</span>
                        </td>

                        {/* CAR */}

                        <td className="col-car">
                          <div className="vehicle-table-car">
                            <div className="vehicle-table-icon">
                              <FaCar />
                            </div>

                            <strong>{vehicle.name || '-'}</strong>
                          </div>
                        </td>

                        {/* YEAR */}

                        <td className="col-year">
                          <span className="vehicle-year">{vehicle.year || '-'}</span>
                        </td>

                        {/* AFN */}

                        <td className="col-afn">
                          <div className="vehicle-table-price">
                            <span className="price-currency">؋</span>

                            <strong>{formatNumber(priceAfn)}</strong>
                          </div>
                        </td>

                        {/* USD */}

                        <td className="col-usd">
                          <div className="vehicle-table-price usd-price">
                            <span className="price-currency">$</span>

                            <strong>{formatUsd(priceUsd)}</strong>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
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
