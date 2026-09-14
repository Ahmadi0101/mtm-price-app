import { useMemo, useState } from 'react';
import { FaCalculator } from 'react-icons/fa';

export default function Calculator({ location, port, onClose }) {
  const ports = Array.isArray(location?.ports) ? location.ports : [];

  const [selectedPortIndex, setSelectedPortIndex] = useState(() => {
    const index = ports.findIndex((item) => item === port);
    return index >= 0 ? index : 0;
  });

  const selectedPort = ports[selectedPortIndex] || port || {};

  const [extraCosts, setExtraCosts] = useState([
    {
      id: 1,
      name: '',
      value: 0,
    },
  ]);

  const [saved, setSaved] = useState(false);

  // ==========================================
  // افزودن مصرف
  // ==========================================

  const addCost = () => {
    setExtraCosts((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        name: '',
        value: 0,
      },
    ]);
  };

  // ==========================================
  // حذف مصرف
  // ==========================================

  const removeCost = (id) => {
    setExtraCosts((prev) => prev.filter((item) => item.id !== id));
  };

  // ==========================================
  // تغییر مصرف
  // ==========================================

  const updateCost = (id, field, value) => {
    setExtraCosts((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === 'value' ? Number(value) || 0 : value,
            }
          : item,
      ),
    );
  };

  // ==========================================
  // قیمت‌ها
  // ==========================================

  const ship = Number(selectedPort?.ship || 0);

  const herat = Number(selectedPort?.herat || 0);

  const originalTotal = Number(selectedPort?.total || 0);

  const extraTotal = useMemo(() => {
    return extraCosts.reduce((sum, item) => sum + Number(item.value || 0), 0);
  }, [extraCosts]);

  const grandTotal = originalTotal + extraTotal;

  // ==========================================
  // فرمت قیمت
  // ==========================================

  const formatPrice = (value) => {
    return Number(value || 0).toLocaleString('en-US');
  };

  // ==========================================
  // ذخیره محاسبه
  // ==========================================

  const saveCalculation = () => {
    const calculation = {
      id: Date.now(),

      date: new Date().toISOString(),

      location: {
        state: location?.state || '',
        branch: location?.branch || '',
        city: location?.city || '',
      },

      port: {
        name: selectedPort?.name || '',
        ship,
        herat,
        total: originalTotal,
      },

      extraCosts: extraCosts
        .filter((item) => item.name.trim() !== '' || Number(item.value || 0) > 0)
        .map((item) => ({
          name: item.name,
          value: Number(item.value || 0),
        })),

      extraTotal,

      grandTotal,
    };

    const oldCalculations = JSON.parse(localStorage.getItem('mtm_calculations') || '[]');

    localStorage.setItem('mtm_calculations', JSON.stringify([calculation, ...oldCalculations]));

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="calculator-overlay" onClick={onClose}>
      <div className="calculator" onClick={(e) => e.stopPropagation()}>
        {/* ==========================================
            HEADER
        ========================================== */}

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

        {/* ==========================================
            LOCATION CARD
        ========================================== */}

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

        {/* ==========================================
            PORT SELECTOR
        ========================================== */}

        {ports.length > 1 && (
          <div className="port-selector">
            <label> پورت مقصد</label>

            <select value={selectedPortIndex} onChange={(e) => setSelectedPortIndex(Number(e.target.value))}>
              {ports.map((item, index) => (
                <option key={`${item.name}-${index}`} value={index}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ==========================================
            SELECTED PORT
        ========================================== */}

        <div className="selected-port-info">
          <div className="selected-port-info-div">
            <span className="selected-port-info-span">پورت انتخاب‌شده</span>

            <strong> {selectedPort?.name || '-'}</strong>
          </div>
        </div>

        {/* ==========================================
            PRICE DETAILS
        ========================================== */}

        <div className="price-card">
          <div className="price-row">
            <div className="price-label">
              <span className="price-icon">🚢</span>

              <div>
                <strong>هزینه انتقالا الی مرسن (ترکیه)</strong>
                <small>USA</small>
              </div>
            </div>

            <strong className="price-value">${formatPrice(ship)}</strong>
          </div>

          <div className="price-row">
            <div className="price-label">
              <span className="price-icon">🇦🇫</span>

              <div>
                <strong>هزینه انتقالا الی اسلام قلعه (هرات)</strong>
                <small>Herat</small>
              </div>
            </div>

            <strong className="price-value">${formatPrice(herat)}</strong>
          </div>
        </div>

        {/* ==========================================
            BASE TOTAL
        ========================================== */}

        <div className="base-total">
          <div>
            <span>مجموع انتقال</span>

            <small>هزینه اصلی انتقال موتر</small>
          </div>

          <strong>${formatPrice(originalTotal)}</strong>
        </div>

        {/* ==========================================
            EXTRA COSTS
        ========================================== */}

        <div className="extra-section">
          <div className="section-title">
            <div>
              <h3>مصارف اضافی</h3>

              <p>اگر هزینه دیگری دارید، اینجا اضافه کنید</p>
            </div>

            <button type="button" className="add-cost-small" onClick={addCost}>
              + افزودن
            </button>
          </div>

          <div className="extra-costs-list">
            {extraCosts.map((cost, index) => (
              <div className="extra-cost" key={cost.id}>
                <div className="extra-number">{index + 1}</div>

                <input type="text" placeholder="نام مصرف" value={cost.name} onChange={(e) => updateCost(cost.id, 'name', e.target.value)} />

                <div className="extra-price-input">
                  <span>$</span>

                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    placeholder="0"
                    value={cost.value}
                    onChange={(e) => updateCost(cost.id, 'value', e.target.value)}
                  />
                </div>

                {extraCosts.length > 1 && (
                  <button type="button" className="remove-cost" onClick={() => removeCost(cost.id)}>
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="extra-total">
            <span>مجموع مصارف اضافی</span>

            <strong>${formatPrice(extraTotal)}</strong>
          </div>
        </div>

        {/* ==========================================
            FINAL TOTAL
        ========================================== */}

        <div className="grand-total">
          <div>
            <span>مجموع نهایی</span>

            <small>انتقال + مصارف اضافی</small>
          </div>

          <strong>${formatPrice(grandTotal)}</strong>
        </div>

    

        {/* ==========================================
            CLOSE
        ========================================== */}

        <button type="button" className="calculator-done" onClick={onClose}>
          بستن
        </button>
      </div>
    </div>
  );
}
