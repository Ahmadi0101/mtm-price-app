import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaCar, FaTrash, FaFolderOpen, FaCalculator, FaMapMarkerAlt, FaShip } from 'react-icons/fa';

import './SavedCalculations.css';

export default function SavedCalculations({ onClose, onOpenCalculation }) {
  const [calculations, setCalculations] = useState([]);

  // ========================================
  // LOAD
  // ========================================

  useEffect(() => {
    loadCalculations();
  }, []);

  const loadCalculations = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('mtm_calculations') || '[]');

      setCalculations(Array.isArray(saved) ? saved : []);
    } catch (error) {
      console.error('❌ خطا در خواندن محاسبات:', error);

      setCalculations([]);
    }
  };

  // ========================================
  // DELETE
  // ========================================

  const deleteCalculation = (id) => {
    const confirmed = window.confirm('آیا مطمئن هستید که این محاسبه حذف شود؟');

    if (!confirmed) return;

    const updated = calculations.filter((item) => item.id !== id);

    setCalculations(updated);

    localStorage.setItem('mtm_calculations', JSON.stringify(updated));
  };

  // ========================================
  // OPEN
  // ========================================

  const openCalculation = (calculation) => {
    if (typeof onOpenCalculation === 'function') {
      onOpenCalculation(calculation);
    }
  };

  // ========================================
  // DATE
  // ========================================

  const formatDate = (date) => {
    if (!date) return '-';

    try {
      const d = new Date(date);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');

      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');

      return `${year}/${month}/${day} - ${hours}:${minutes}`;
    } catch {
      return '-';
    }
  };

  // ========================================
  // PRICE
  // ========================================

  const formatPrice = (value) => {
    return Number(value || 0).toLocaleString('en-US', {
      maximumFractionDigits: 2,
    });
  };

  // ========================================
  // EMPTY
  // ========================================

  if (calculations.length === 0) {
    return (
      <div className="saved-calculations">
        {/* HEADER */}

        <div className="saved-calculations-header">
          <div className="saved-calculations-header-info">
            <div className="saved-calculations-title-icon">
              <FaCalculator />
            </div>

            <div>
              <h2>محاسبات قبلی</h2>

              <p>محاسبه‌های ذخیره‌شده شما</p>
            </div>
          </div>

          <button type="button" className="saved-calculations-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="saved-calculations-empty">
          <div className="saved-empty-icon">
            <FaCalculator />
          </div>

          <h3>هیچ محاسبه‌ای ذخیره نشده است</h3>

          <p>بعد از انجام محاسبه، آن را ذخیره کنید تا در اینجا نمایش داده شود.</p>
        </div>
      </div>
    );
  }

  // ========================================
  // MAIN
  // ========================================

  return (
    <div className="saved-calculations">
      {/* ====================================
          HEADER
      ==================================== */}

      <div className="saved-calculations-header">
        <div className="saved-calculations-header-info">
          <div className="saved-calculations-title-icon">
            <FaCalculator />
          </div>

          <div>
            <h2>محاسبات قبلی</h2>

            <p>{calculations.length} محاسبه ذخیره شده</p>
          </div>
        </div>

        <button type="button" className="saved-calculations-close" onClick={onClose}>
          ×
        </button>
      </div>

      {/* ====================================
          LIST
      ==================================== */}

      <div className="saved-calculations-content">
        {calculations.map((calculation) => {
          const vehicle = calculation.customsVehicle;

          const location = calculation.location || {};

          const port = calculation.port || {};

          const extraCosts = Array.isArray(calculation.extraCosts) ? calculation.extraCosts : [];

          const customsCost = extraCosts.find((item) => item.type === 'customs');

          return (
            <div key={calculation.id} className="saved-calculation-card">
              {/* =================================
                  CARD HEADER
              ================================= */}

              <div className="saved-card-header">
                <div className="saved-card-number">#{calculation.id}</div>

                <div className="saved-card-date">
                  <FaCalendarAlt />
                  <span>{formatDate(calculation.date)}</span>
                </div>
              </div>

              {/* =================================
                  LOCATION
              ================================= */}

              <div className="saved-location-section">
                <div className="saved-section-title">
                  <FaMapMarkerAlt />
                  <span>موقعیت انتقال</span>
                </div>

                <div className="saved-location-grid">
                  <div className="saved-data-box">
                    <span>ایالت</span>

                    <strong>{location.state || '-'}</strong>
                  </div>

                  <div className="saved-data-box">
                    <span>شعبه</span>

                    <strong>{location.branch || '-'}</strong>
                  </div>

                  <div className="saved-data-box">
                    <span>شهر</span>

                    <strong>{location.city || '-'}</strong>
                  </div>

                  <div className="saved-data-box">
                    <span>پورت</span>

                    <strong>{port.name || '-'}</strong>
                  </div>
                </div>
              </div>

              {/* =================================
                  VEHICLE
              ================================= */}

              {vehicle && (
                <div className="saved-vehicle-section">
                  <div className="saved-section-title">
                    <FaCar />
                    <span>موتر</span>
                  </div>

                  <div className="saved-vehicle-row">
                    <div className="saved-vehicle-main">
                      <div className="saved-vehicle-icon">
                        <FaCar />
                      </div>

                      <div>
                        <h3>{vehicle.name || 'موتر'}</h3>

                        <p>سال: {vehicle.year || '-'}</p>
                      </div>
                    </div>

                    <div className="saved-customs-price">
                      <span>محصول گمرک</span>

                      <strong>${formatPrice(customsCost?.value || vehicle.price_usd)}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================
                  PORT COSTS
              ================================= */}

              <div className="saved-port-section">
                <div className="saved-section-title">
                  <FaShip />
                  <span>هزینه انتقال</span>
                </div>

                <div className="saved-cost-grid">
                  <div className="saved-cost-box">
                    <span>انتقال</span>

                    <strong>${formatPrice(port.ship)}</strong>
                  </div>

                  <div className="saved-cost-box">
                    <span>هرات</span>

                    <strong>${formatPrice(port.herat)}</strong>
                  </div>

                  <div className="saved-cost-box">
                    <span>انتقال + هرات</span>

                    <strong>${formatPrice(port.total)}</strong>
                  </div>
                </div>
              </div>

              {/* =================================
                  TOTAL
              ================================= */}

              <div className="saved-total-section">
                <div>
                  <span>مجموع نهایی</span>

                  <small>تمام مصارف این محاسبه</small>
                </div>

                <strong>${formatPrice(calculation.grandTotal)}</strong>
              </div>

              {/* =================================
                  ACTIONS
              ================================= */}

              <div className="saved-card-actions">
                <button type="button" className="saved-open-button" onClick={() => openCalculation(calculation)}>
                  <FaFolderOpen />
                  باز کردن محاسبه
                </button>

                <button type="button" className="saved-delete-button" onClick={() => deleteCalculation(calculation.id)}>
                  <FaTrash />
                  حذف
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
