 
import React, { useState } from 'react';
import {
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaExternalLinkAlt,
  FaCarSide,
  FaGavel,
  FaMapMarkerAlt,
  FaGasPump,
  FaTachometerAlt,
  FaCog,
  FaTools,
  FaShieldAlt,
  FaLink,
  FaCalendarAlt,
  FaDollarSign,
} from 'react-icons/fa';
import { FaCarBurst } from 'react-icons/fa6';
import './VehicleSales.css';
import { FaPhone, FaWhatsapp } from 'react-icons/fa';
import { MdOutlineFactCheck } from 'react-icons/md';

// =====================================================
// VEHICLE DATA
// فقط این Object را تغییر بده
// =====================================================

const vehicle = {
  id: 1,
  info: 'دارای رنگ داخلی زرد و بدون تکر میباشد.',
  saleStatus: 'برای فروش',

  brand: 'TOYOTA',
  model: 'PRIUS',
  year: '12/12',

  title: 'TOYOTA PRIUS 2013',

  auction: 'IAAI',
  lotNumber: '45134424',

  vin: 'JTDKN3DU0D5575586',

  damage: 'عقب سمت چپ',

  mileage: 'km (300,667) ~ 186,826 mi ',
  mileageUnit: '',

  engine: '1.8L, 4 cyl. هایبرید (✅)',

  transmission: 'اتوماتیک (✅)',

  fuel: 'بنزین',
  location: '(ایران) در حال رسیدن به مقصد اسلام قلعه',

  titleStatus: 'Clean Title',
  details: 'تسلیمی هرات با مکتوب',

  // =====================================================
  // PRICE
  // =====================================================

  salePrice: 8000,

  // اگر تخفیف ندارد:
  // discountPrice: null

  // اگر تخفیف دارد:
  discountPrice: 7500,

  currency: 'USD',

  // =====================================================
  // BIDCARS
  // =====================================================

  bidCarsUrl: 'https://bid.cars/en/lot/0-45134424/2013-Toyota-Prius-JTDKN3DU0D5575586',

  // =====================================================
  // DESCRIPTION
  // =====================================================

  description: '',

  // =====================================================
  // IMAGES
  // =====================================================

  images: [
    'https://raw.githubusercontent.com/Ahmadi0101/mtm-price-data/main/c1.jpg',

    'https://raw.githubusercontent.com/Ahmadi0101/mtm-price-data/main/c2.jpg',
    'https://raw.githubusercontent.com/Ahmadi0101/mtm-price-data/main/c3.jpg',
    'https://raw.githubusercontent.com/Ahmadi0101/mtm-price-data/main/c4.jpg',
    'https://raw.githubusercontent.com/Ahmadi0101/mtm-price-data/main/c5.jpg',
    'https://raw.githubusercontent.com/Ahmadi0101/mtm-price-data/main/c6.jpg',
    'https://raw.githubusercontent.com/Ahmadi0101/mtm-price-data/main/c7.jpg',
    'https://raw.githubusercontent.com/Ahmadi0101/mtm-price-data/main/c8.jpg',
    'https://raw.githubusercontent.com/Ahmadi0101/mtm-price-data/main/c9.jpg',
    'https://raw.githubusercontent.com/Ahmadi0101/mtm-price-data/main/c10.jpg',
    'https://raw.githubusercontent.com/Ahmadi0101/mtm-price-data/main/c11.jpg',
    'https://raw.githubusercontent.com/Ahmadi0101/mtm-price-data/main/c12.jpg',
    'https://raw.githubusercontent.com/Ahmadi0101/mtm-price-data/main/c13.jpg',
  ],
};

const EngineIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M5 9.5H8L9.5 7H15L16.5 9.5H19L21 11.5V17H18V19H6V17H3V12L5 9.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M9 12H15M9 15H15M12 7V4M16 10L18 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 19V21M18 19V21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);


function VehicleSales({ onClose }) {

  const [activeImage, setActiveImage] = useState(0);

  // برای Swipe
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);


  // =====================================================
  // FORMAT PRICE
  // =====================================================

  const formatPrice = (price) => {
    return Number(price).toLocaleString('en-US');
  };


  // =====================================================
  // NEXT IMAGE
  // =====================================================

  const nextImage = () => {

    setActiveImage((prev) => {

      if (prev === vehicle.images.length - 1) {
        return 0;
      }

      return prev + 1;
    });

  };


  // =====================================================
  // PREVIOUS IMAGE
  // =====================================================

  const previousImage = () => {

    setActiveImage((prev) => {

      if (prev === 0) {
        return vehicle.images.length - 1;
      }

      return prev - 1;
    });

  };


  // =====================================================
  // TOUCH START
  // =====================================================

  const handleTouchStart = (event) => {

    const touch = event.touches[0];

    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);

  };


  // =====================================================
  // TOUCH END
  // =====================================================

  const handleTouchEnd = (event) => {

    if (touchStartX === null || touchStartY === null) {
      return;
    }

    const touch = event.changedTouches[0];

    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    // فقط حرکت افقی
    if (Math.abs(deltaX) > Math.abs(deltaY)) {

      // حداقل فاصله Swipe
      if (Math.abs(deltaX) > 45) {

        /*
          RTL:
          کشیدن به راست  → عکس بعدی
          کشیدن به چپ    → عکس قبلی
        */

        if (deltaX > 0) {
           previousImage();
        } else {
         nextImage();
        }

      }

    }

    setTouchStartX(null);
    setTouchStartY(null);

  };


  // =====================================================
  // MOUSE DRAG
  // =====================================================

  const [mouseStartX, setMouseStartX] = useState(null);


  const handleMouseDown = (event) => {

    setMouseStartX(event.clientX);

  };


  const handleMouseUp = (event) => {

    if (mouseStartX === null) {
      return;
    }

    const deltaX = event.clientX - mouseStartX;

    if (Math.abs(deltaX) > 45) {

      // کشیدن به راست → بعدی
      if (deltaX > 0) {
        previousImage();
      }

      // کشیدن به چپ → قبلی
      else {
        nextImage();
       
      }

    }

    setMouseStartX(null);

  };

  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
const [viewerTouchStartX, setViewerTouchStartX] = useState(null);

const openImageViewer = () => {
  setIsImageViewerOpen(true);
};

const closeImageViewer = () => {
  setIsImageViewerOpen(false);
};

const nextViewerImage = () => {
  setActiveImage((current) =>
    current === vehicle.images.length - 1 ? 0 : current + 1
  );
};

const previousViewerImage = () => {
  setActiveImage((current) =>
    current === 0 ? vehicle.images.length - 1 : current - 1
  );
};

const handleViewerTouchStart = (event) => {
  setViewerTouchStartX(event.touches[0].clientX);
};

const handleViewerTouchEnd = (event) => {
  if (viewerTouchStartX === null) return;

  const endX = event.changedTouches[0].clientX;
  const difference = viewerTouchStartX - endX;

  // حداقل مقدار حرکت برای تشخیص Swipe
  if (Math.abs(difference) > 50) {
    if (difference > 0) {
      nextViewerImage();
    } else {
      previousViewerImage();
    }
  }

  setViewerTouchStartX(null);
};

  // =====================================================
  // PRICE
  // =====================================================

  const hasDiscount =
    vehicle.discountPrice !== null &&
    vehicle.discountPrice !== undefined &&
    Number(vehicle.discountPrice) < Number(vehicle.salePrice);


  const finalPrice = hasDiscount
    ? vehicle.discountPrice
    : vehicle.salePrice;


  return (
    <div className="vehicle-sales-overlay">
      <div className="vehicle-detail-page">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="vehicle-detail-header">
          <div className="vehicle-header-line" />

          <button type="button" className="vehicle-detail-close" onClick={onClose} aria-label="بستن">
            <FaTimes />
          </button>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="vehicle-detail-content">
          {/* =================================================
              GALLERY
          ================================================= */}

          <div className="vehicle-gallery">
            {/* MAIN IMAGE */}

            <div
              className="vehicle-main-image"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onDragStart={(event) => event.preventDefault()}
              onClick={openImageViewer}
            >
              <img src={vehicle.images[activeImage]} alt={vehicle.title} draggable="false" />

              {/* SALE BADGE */}

              <div className="vehicle-sale-badge">
                {/* <FaCarSide /> */}

                <span>{vehicle.saleStatus}</span>
              </div>

              {/* IMAGE COUNTER */}

              <div className="vehicle-image-counter">
                {activeImage + 1}

                <span>/</span>

                {vehicle.images.length}
              </div>

              {/* DESKTOP ARROWS */}

              {/* <button
                type="button"
                className="vehicle-main-arrow vehicle-main-arrow-left"
                onClick={(event) => {
                  event.stopPropagation();
                  previousImage();
                }}
                aria-label="عکس قبلی"
              >
                <FaChevronLeft />
              </button>


              <button
                type="button"
                className="vehicle-main-arrow vehicle-main-arrow-right"
                onClick={(event) => {
                  event.stopPropagation();
                  nextImage();
                }}
                aria-label="عکس بعدی"
              >
                <FaChevronRight />
              </button> */}
            </div>

            {/* =================================================
                THUMBNAILS
            ================================================= */}

            <div className="vehicle-thumbnails-wrapper">
              <button type="button" className="vehicle-gallery-arrow" onClick={previousImage} aria-label="عکس قبلی">
                <FaChevronLeft size={10} />
              </button>

              <div className="vehicle-thumbnails">
                {vehicle.images.map((image, index) => (
                  <button
                    type="button"
                    key={index}
                    className={`vehicle-thumbnail ${activeImage === index ? 'active' : ''}`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={image} alt={`Vehicle ${index + 1}`} draggable="false" />
                  </button>
                ))}
              </div>

              <button type="button" className="vehicle-gallery-arrow" onClick={nextImage} aria-label="عکس بعدی">
                <FaChevronRight size={10} />
              </button>
            </div>
          </div>
{isImageViewerOpen && (
  <div
    className="vehicle-image-viewer"
    onClick={closeImageViewer}
    onTouchStart={handleViewerTouchStart}
    onTouchEnd={handleViewerTouchEnd}
  >
    {/* CLOSE BUTTON */}
    <button
      type="button"
      className="vehicle-image-viewer-close"
      onClick={(event) => {
        event.stopPropagation();
        closeImageViewer();
      }}
      aria-label="بستن"
    >
      ×
    </button>

    {/* PREVIOUS */}
    {/* <button
      type="button"
      className="vehicle-image-viewer-arrow vehicle-image-viewer-arrow-left"
      onClick={(event) => {
        event.stopPropagation();
        previousViewerImage();
      }}
      aria-label="عکس قبلی"
    >
      <FaChevronLeft />
    </button> */}

    {/* IMAGE */}
    <img
      src={vehicle.images[activeImage]}
      alt={vehicle.title}
      className="vehicle-image-viewer-image"
      draggable="false"
      onClick={(event) => event.stopPropagation()}
    />

    {/* NEXT */}
    {/* <button
      type="button"
      className="vehicle-image-viewer-arrow vehicle-image-viewer-arrow-right"
      onClick={(event) => {
        event.stopPropagation();
        nextViewerImage();
      }}
      aria-label="عکس بعدی"
    >
      <FaChevronRight />
    </button> */}

    {/* COUNTER */}
    <div className="vehicle-image-viewer-counter">
      {activeImage + 1} / {vehicle.images.length}
    </div>
  </div>
)}

          {/* =================================================
              TITLE
          ================================================= */}

          <div className="vehicle-title-section">
            <h1>{vehicle.title}</h1>

            <div className="vehicle-auction-row">
              {/* <div className="vehicle-auction">
                <FaGavel />

                <span>{vehicle.auction}</span>
              </div> */}

              <div className="vehicle-lot">
                
                Stock #:  {' '}
                <strong>
                 {vehicle.lotNumber} 
                </strong>
              </div>
            </div>
          </div>

          {/* =================================================
              INFORMATION
          ================================================= */}

          <div className="vehicle-information-grid">
            {/* =================================================
                LEFT COLUMN
            ================================================= */}

            <div className="vehicle-info-column">
              {/* VIN */}

              <div className="vehicle-info-item">
                <div className="vehicle-info-icon">
                  <FaLink />
                </div>

                <div className="vehicle-info-text">
                  <span>VIN شماره</span>

                  <strong>{vehicle.vin}</strong>
                </div>
              </div>

              {/* MILEAGE */}

              <div className="vehicle-info-item">
                <div className="vehicle-info-icon">
                  <FaTachometerAlt />
                </div>

                <div className="vehicle-info-text">
                  <span>مالج / گشت</span>

                  <strong>
                    {vehicle.mileage} {vehicle.mileageUnit}
                  </strong>
                </div>
              </div>

              {/* ENGINE */}

              {/* <div className="vehicle-info-item">
                <div className="vehicle-info-icon">
                  <FaCarSide />
                </div>

                <div className="vehicle-info-text">
                  <span>نوع موتور</span>

                  <strong>{vehicle.engine}</strong>
                </div>
              </div> */}

              {/* FUEL */}

              <div className="vehicle-info-item">
                <div className="vehicle-info-icon">
                  <EngineIcon size={24} />
                </div>

                <div className="vehicle-info-text">
                  <span>ماشین</span>

                  <strong>{vehicle.engine}</strong>
                </div>
              </div>

              <div className="vehicle-info-item">
                <div className="vehicle-info-icon">
                  <MdOutlineFactCheck size={24} />
                </div>

                <div className="vehicle-info-text">
                  <span>مشخصات</span>

                  <strong>{vehicle.info}</strong>
                </div>
              </div>

              {/* TITLE STATUS */}

              {/* <div className="vehicle-info-item">
                <div className="vehicle-info-icon">
                  <FaShieldAlt />
                </div>

                <div className="vehicle-info-text">
                  <span>وضعیت عنوان</span>

                  <strong>{vehicle.titleStatus}</strong>
                </div>
              </div> */}
            </div>

            {/* =================================================
                RIGHT COLUMN
            ================================================= */}

            <div className="vehicle-info-column">
              {/* DAMAGE */}

              <div className="vehicle-info-item">
                <div className="vehicle-info-icon">
                  <FaCarBurst />
                </div>

                <div className="vehicle-info-text">
                  <span>خسارت / تکر</span>

                  <strong>{vehicle.damage}</strong>
                </div>
              </div>

              {/* TRANSMISSION */}

              <div className="vehicle-info-item">
                <div className="vehicle-info-icon">
                  <FaCog />
                </div>

                <div className="vehicle-info-text">
                  <span>گیربکس</span>

                  <strong>{vehicle.transmission}</strong>
                </div>
              </div>

              {/* LOCATION */}

              <div className="vehicle-info-item">
                <div className="vehicle-info-icon">
                  <FaMapMarkerAlt />
                </div>

                <div className="vehicle-info-text">
                  <span>موقعیت</span>

                  <strong>{vehicle.location}</strong>
                </div>
              </div>

              {/* YEAR */}

              <div className="vehicle-info-item">
                <div className="vehicle-info-icon">
                  <FaCalendarAlt />
                </div>

                <div className="vehicle-info-text">
                  <span>تاریخ ساخت</span>

                  <strong>{vehicle.year}</strong>
                </div>
              </div>
            </div>
          </div>



          {/* =================================================
              PRICE
          ================================================= */}

          <div className="vehicle-price-box">
            <div className="vehicle-price-left">
              <div className="vehicle-price-icon">
                <FaDollarSign />
              </div>

              <div>
                <span>قیمت فروش</span>

                <strong>${formatPrice(finalPrice)}</strong>
              </div>
            </div>
             

            {/* ORIGINAL PRICE */}

            {hasDiscount && (
              <div className="vehicle-price-right">
                <span>قیمت اصلی</span>

                <div className="vehicle-original-price">
                  <del>${formatPrice(vehicle.salePrice)}</del>
                </div>
              </div>
            )}

            
          </div>
          <div className="vehicle-detail">
               <span>  {vehicle.details}</span>
              </div>
          

          {/* =================================================
              BIDCARS HISTORY
          ================================================= */}

          {/* <div className="vehicle-actions">
            <a href={vehicle.bidCarsUrl} target="_blank" rel="noopener noreferrer" className="vehicle-primary-button">
              <FaExternalLinkAlt />

              <span>دیدن هستوی</span>
            </a>
          </div> */}

          {/* =================================================
    CONTACT / WHATSAPP
================================================= */}



          <div className="vehicle-actionss">
            <a href="tel:+93781865863" className="vehicle-contact-button vehicle-call-button">
              <FaPhone />

              <span>تماس</span>
            </a>

            <a
              href="https://wa.me/93781865863"
              target="_blank"
              rel="noopener noreferrer"
              className="vehicle-contact-button vehicle-whatsapp-button"
            >
              <FaWhatsapp />

              <span>واتساپ</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


export default VehicleSales;
 
