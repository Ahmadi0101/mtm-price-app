import { useEffect, useMemo, useState } from 'react';
import { FaCalculator } from 'react-icons/fa';

export default function Calculator({
  location,
  port,
  onClose,

  selectedVehicle = null,
  selectedVehiclePriceUsd = 0,

  onOpenVehicleRates,
  onRemoveVehicle,
}) {
  // ==========================================
  // PORTS
  // ==========================================

  const ports = Array.isArray(location?.ports) ? location.ports : [];

  const [selectedPortIndex, setSelectedPortIndex] = useState(() => {
    const index = ports.findIndex((item) => item === port);

    return index >= 0 ? index : 0;
  });

  const selectedPort = ports[selectedPortIndex] || port || {};

  // ==========================================
  // CUSTOMS PRICE
  // ==========================================

  const customsVehiclePrice = Number(selectedVehiclePriceUsd || selectedVehicle?.price_usd || 0);

  // ==========================================
  // EXTRA COSTS
  // ==========================================

  const [extraCosts, setExtraCosts] = useState([]);

  // ==========================================
  // وقتی موتر انتخاب / حذف می‌شود
  // ==========================================

useEffect(() => {
  setExtraCosts((prev) => {
    // اگر موتر انتخاب نشده، ردیف گمرک حذف شود
    if (!selectedVehicle || customsVehiclePrice <= 0) {
      return prev.filter((item) => item.type !== 'customs');
    }

    const customsIndex = prev.findIndex((item) => item.type === 'customs');

    // اگر ردیف گمرک وجود ندارد، ایجاد شود
    if (customsIndex === -1) {
      return [
        {
          id: 'customs-product',
          name: 'محصول گمرک',
          value: customsVehiclePrice,
          type: 'customs',
          vehicleId: selectedVehicle.id,
        },
        ...prev,
      ];
    }

    // اگر موتر جدید انتخاب شده، قیمت و مشخصات اولیه ردیف گمرک آپدیت شود
    const currentCustoms = prev[customsIndex];

    if (currentCustoms.vehicleId !== selectedVehicle.id) {
      const updated = [...prev];

      updated[customsIndex] = {
        ...currentCustoms,
        name: 'محصول گمرک',
        value: customsVehiclePrice,
        vehicleId: selectedVehicle.id,
      };

      return updated;
    }

    return prev;
  });
}, [selectedVehicle, selectedVehiclePriceUsd]);

  // ==========================================
  // SAVED
  // ==========================================

  const [saved, setSaved] = useState(false);

  // ==========================================
  // ADD NORMAL COST
  // ==========================================

  const addCost = () => {
    setExtraCosts((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        name: '',
        value: '',
        type: 'extra',
      },
    ]);
  };

  // ==========================================
  // REMOVE COST
  // ==========================================

  const removeCost = (id) => {
    const item = extraCosts.find((cost) => cost.id === id);

    // --------------------------------------
    // اگر محصول گمرک حذف شد
    // selectedVehicle را هم پاک کن
    // --------------------------------------

    if (item?.type === 'customs' && typeof onRemoveVehicle === 'function') {
      onRemoveVehicle();
    }

    setExtraCosts((prev) => prev.filter((cost) => cost.id !== id));
  };

  // ==========================================
  // UPDATE COST
  // ==========================================

  const updateCost = (id, field, value) => {
    setExtraCosts((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }

        // --------------------------------------
        // نام
        // --------------------------------------

        if (field === 'name') {
          return {
            ...item,
            name: value,
          };
        }

        // --------------------------------------
        // قیمت
        //
        // اگر خالی شد، خالی نگه دار
        // --------------------------------------

        if (field === 'value') {
          return {
            ...item,
            value: value === '' ? '' : Number(value) || 0,
          };
        }

        return {
          ...item,
          [field]: value,
        };
      }),
    );
  };

  // ==========================================
  // TRANSFER PRICES
  // ==========================================

  const ship = Number(selectedPort?.ship || 0);

  const herat = Number(selectedPort?.herat || 0);

  const originalTotal = Number(selectedPort?.total || 0);

  // ==========================================
  // EXTRA TOTAL
  // ==========================================

  const extraTotal = useMemo(() => {
    return extraCosts.reduce((sum, item) => sum + Number(item.value || 0), 0);
  }, [extraCosts]);

  // ==========================================
  // GRAND TOTAL
  // ==========================================

  const grandTotal = originalTotal + extraTotal;

  // ==========================================
  // FORMAT PRICE
  // ==========================================

  const formatPrice = (value) => {
    return Number(value || 0).toLocaleString('en-US');
  };

  // ==========================================
  // SAVE CALCULATION
  // ==========================================

  const saveCalculation = () => {
    const calculation = {
      id: Date.now(),

      date: new Date().toISOString(),

      // --------------------------------------
      // LOCATION
      // --------------------------------------

      location: {
        state: location?.state || '',
        branch: location?.branch || '',
        city: location?.city || '',
      },

      // --------------------------------------
      // PORT
      // --------------------------------------

      port: {
        name: selectedPort?.name || '',
        ship,
        herat,
        total: originalTotal,
      },

      // --------------------------------------
      // VEHICLE
      // --------------------------------------

      customsVehicle: selectedVehicle
        ? {
            id: selectedVehicle.id,
            name: selectedVehicle.name || '',
            year: selectedVehicle.year || '',
            price_afn: Number(selectedVehicle.price_afn || 0),
            price_usd: Number(selectedVehicle.price_usd || 0),
            dollar_rate: Number(selectedVehicle.dollar_rate || 0),
          }
        : null,

      // --------------------------------------
      // EXTRA COSTS
      // --------------------------------------

      extraCosts: extraCosts
        .filter((item) => item.name.trim() !== '' || Number(item.value || 0) > 0)
        .map((item) => ({
          name: item.name,
          value: Number(item.value || 0),
          type: item.type || 'extra',
        })),

      extraTotal,

      grandTotal,
    };

    // ========================================
    // OLD CALCULATIONS
    // ========================================

    let oldCalculations = [];

    try {
      oldCalculations = JSON.parse(localStorage.getItem('mtm_calculations') || '[]');

      if (!Array.isArray(oldCalculations)) {
        oldCalculations = [];
      }
    } catch {
      oldCalculations = [];
    }

    // ========================================
    // SAVE
    // ========================================

    localStorage.setItem('mtm_calculations', JSON.stringify([calculation, ...oldCalculations]));

    // ========================================
    // SUCCESS
    // ========================================

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="calculator-overlay" onClick={onClose}>
      <div className="calculator" onClick={(e) => e.stopPropagation()}>
        {/* ======================================
            HEADER
        ====================================== */}

        <div className="calculator-header">
          <div className="calculator-header-info">
            <div className="calculator-title-icon">
              <FaCalculator />
            </div>

            <div>
              <h2>محاسبه قیمت انتقال</h2>

              <p>
                {selectedPort?.name || '-'}
                <span> ← </span>
                {location?.city || '-'}
              </p>
            </div>
          </div>

          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {/* ======================================
            LOCATION
        ====================================== */}

        <div className="calculator-location">
          <div className="location-item">
            <span>ایالت</span>

            <strong>{location?.state || '-'}</strong>
          </div>

          <div className="location-item">
            <span>برنچ</span>

            <strong>{location?.branch || '-'}</strong>
          </div>

          <div className="location-item">
            <span>شهر</span>

            <strong>{location?.city || '-'}</strong>
          </div>
        </div>

        {/* ======================================
            PORT SELECTOR
        ====================================== */}

        {ports.length > 1 && (
          <div className="port-selector">
            <label>پورت مقصد</label>

            <select value={selectedPortIndex} onChange={(e) => setSelectedPortIndex(Number(e.target.value))}>
              {ports.map((item, index) => (
                <option key={`${item.name}-${index}`} value={index}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ======================================
            SELECTED PORT
        ====================================== */}

        <div className="selected-port-info">
          <div className="selected-port-info-div">
            <span className="selected-port-info-span">پورت انتخاب‌شده</span>

            <strong>{selectedPort?.name || '-'}</strong>
          </div>
        </div>

        {/* ======================================
            PRICE DETAILS
        ====================================== */}

        <div className="price-card">
          <div className="price-row">
            <div className="price-label">
              <span className="price-icon">🚢</span>

              <div>
                <strong>هزینه انتقال الی مرسن</strong>

                <small>USA TO TR</small>
              </div>
            </div>

            <strong className="price-value">${formatPrice(ship)}</strong>
          </div>

          <div className="price-row">
            <div className="price-label">
              <span className="price-icon">🇦🇫</span>

              <div>
                <strong>هزینه انتقال الی اسلام قلعه</strong>

                <small>TR TO AF</small>
              </div>
            </div>

            <strong className="price-value">${formatPrice(herat)}</strong>
          </div>
        </div>

        {/* ======================================
            BASE TOTAL
        ====================================== */}

        <div className="base-total">
          <div>
            <span>مجموع انتقال</span>

            <small>هزینه اصلی انتقال موتر</small>
          </div>

          <strong>${formatPrice(originalTotal)}</strong>
        </div>

        {/* ======================================
            EXTRA COSTS
        ====================================== */}

        <div className="extra-section">
          {/* ------------------------------------
              TITLE
          ------------------------------------ */}

          <div className="section-title">
            <div>
              <h3>مصارف اضافی</h3>

              <p>اگر هزینه دیگری دارید، اینجا اضافه کنید</p>
            </div>

            <div className="section-actions">
             

            
              {/* --------------------------------
                  NORMAL COST
              -------------------------------- */}

              <button type="button" className="add-cost-small" onClick={addCost}>
                + افزودن
              </button>
            </div>
          </div>

          {/* ====================================
              COST LIST
          ==================================== */}

          <div className="extra-costs-list">
            {extraCosts.map((cost, index) => (
              <div className="extra-cost" key={cost.id}>
                {/* NUMBER */}

                <div className="extra-number">{index + 1}</div>

                {/* NAME */}

                <input type="text" placeholder="نام مصرف" value={cost.name} onChange={(e) => updateCost(cost.id, 'name', e.target.value)} />

                {/* PRICE */}

                <div className="extra-price-input">
                  <span>$</span>

                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    placeholder="0"
                    value={cost.value === 0 ? '' : cost.value}
                    onChange={(e) => updateCost(cost.id, 'value', e.target.value)}
                  />
                </div>

                {/* REMOVE */}

                <button
                  type="button"
                  className="remove-cost"
                  onClick={() => removeCost(cost.id)}
                  title={cost.type === 'customs' ? 'حذف محصول گمرک' : 'حذف مصرف'}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* ====================================
              EXTRA TOTAL
          ==================================== */}

          <div className="extra-total">
            <span>مجموع مصارف اضافی</span>

            <strong>${formatPrice(extraTotal)}</strong>
          </div>
        </div>

        {/* ======================================
            GRAND TOTAL
        ====================================== */}

        <div className="grand-total">
          <div>
            <span>مجموع نهایی</span>

            <small>انتقال + مصارف اضافی</small>
          </div>

          <strong>${formatPrice(grandTotal)}</strong>
        </div>

        {/* ======================================
            SAVE
        ====================================== */}

        {/* <button type="button" className={`save-calculation ${saved ? 'saved' : ''}`} onClick={saveCalculation}>
          {saved ? '✓ محاسبه ذخیره شد' : 'ذخیره محاسبه'}
        </button> */}

        {/* ======================================
            CLOSE
        ====================================== */}

        <button type="button" className="calculator-done" onClick={onClose}>
          بستن
        </button>
      </div>
    </div>
  );
}
