import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import { FaCalculator } from 'react-icons/fa';
import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import {  useRef } from 'react';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

/* =====================================================
   LEAFLET BRANCH ICONS
===================================================== */

const defaultIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/*
  برنچ انتخاب شده
*/

const selectedIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,

  iconSize: [34, 52],
  iconAnchor: [17, 52],
  popupAnchor: [0, -46],
  shadowSize: [52, 52],

  className: 'selected-map-marker',
});

/* =====================================================
   PORT ICONS
===================================================== */

/*
  آیکن پورت عادی
  آیکن ⚓ داخل دایره آبی
*/

const portIcon = new L.DivIcon({
  className: 'port-pin-wrapper',

  html: `
    <div class="port-pin">
      <div class="port-pin-icon">⚓</div>
    </div>
  `,

  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

/*
  آیکن پورت انتخاب شده
  آیکن ⚓ داخل دایره سرخ
*/

const selectedPortIcon = new L.DivIcon({
  className: 'port-pin-wrapper',

  html: `
    <div class="port-pin selected">
      <div class="port-pin-icon">⚓</div>
    </div>
  `,

  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -17],
});

/* =====================================================
   PORT COORDINATES
===================================================== */

const PORT_COORDINATES = {
  'SAVANNAH, GA': {
    lat: 32.0809,
    lng: -81.0912,
  },

  'NEW YORK, NY': {
    lat: 40.7128,
    lng: -74.006,
  },

  'BALTIMORE, MD': {
    lat: 39.2904,
    lng: -76.6122,
  },

  'NEWARK, NJ': {
    lat: 40.7357,
    lng: -74.1724,
  },

  'JACKSONVILLE, FL': {
    lat: 30.3322,
    lng: -81.6557,
  },

  'MIAMI, FL': {
    lat: 25.7617,
    lng: -80.1918,
  },

  'HOUSTON, TX': {
    lat: 29.7604,
    lng: -95.3698,
  },

  'LOS ANGELES, CA': {
    lat: 34.0522,
    lng: -118.2437,
  },
};

/* =====================================================
   NORMALIZE PORT NAME
===================================================== */

function normalizePortName(name) {
  return String(name || '')
    .trim()
    .toUpperCase();
}

/* =====================================================
   GET PORT COORDINATES
===================================================== */

function getPortCoordinates(port) {
  if (!port) return null;

  /*
    اولویت با مختصات موجود در JSON
  */

  const lat = Number(port.lat);
  const lng = Number(port.lng);

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return {
      lat,
      lng,
    };
  }

  /*
    در غیر آن صورت از مختصات داخلی استفاده می‌کنیم
  */

  const name = normalizePortName(port.name);

  return PORT_COORDINATES[name] || null;
}

/* =====================================================
   MAP CONTROLLER
===================================================== */

function MapController({ locations, selectedLocation }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    /*
      برنچ انتخاب شده
    */

    if (selectedLocation && Number.isFinite(Number(selectedLocation.lat)) && Number.isFinite(Number(selectedLocation.lng))) {
      map.flyTo([Number(selectedLocation.lat), Number(selectedLocation.lng)], 3.8, {
        duration: 0.8,
      });

      return;
    }

    /*
      فقط یک نتیجه
    */

    if (locations.length === 1 && Number.isFinite(Number(locations[0].lat)) && Number.isFinite(Number(locations[0].lng))) {
      map.flyTo([Number(locations[0].lat), Number(locations[0].lng)], 8, {
        duration: 0.8,
      });

      return;
    }

    /*
      چند نتیجه
    */

    if (locations.length > 1) {
      const validLocations = locations.filter((location) => Number.isFinite(Number(location.lat)) && Number.isFinite(Number(location.lng)));

      if (validLocations.length > 1) {
        const bounds = L.latLngBounds(validLocations.map((location) => [Number(location.lat), Number(location.lng)]));

        map.fitBounds(bounds, {
          padding: [40, 40],
          maxZoom: 7,
        });
      }
    }
  }, [map, locations, selectedLocation]);

  return null;
}

/* =====================================================
   MAIN MAP
===================================================== */
 
export default function MapView({ locations = [], selectedLocation = null, selectedPort = null, onSelectLocation, onSelectPort, popupCloseKey }) {


  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = async () => {
    const mapWrapper = document.querySelector('.map-wrapper');

    if (!mapWrapper) return;

    try {
      if (!document.fullscreenElement) {
        await mapWrapper.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  function ClosePopups({ popupCloseKey }) {
    const map = useMap();

    useEffect(() => {
      map.closePopup();
    }, [map, popupCloseKey]);

    return null;
  }
  /* ===================================================
     SELECTED LOCATION PORTS
  =================================================== */

  const selectedLocationPorts = useMemo(() => {
    if (!selectedLocation) {
      return [];
    }

    if (!Array.isArray(selectedLocation.ports)) {
      return [];
    }

    return selectedLocation.ports;
  }, [selectedLocation]);

  /* ===================================================
     PORT DESTINATIONS
  =================================================== */

  const portDestinations = useMemo(() => {
    if (!selectedLocation) {
      return [];
    }

    return selectedLocationPorts
      .map((port, index) => {
        const coords = getPortCoordinates(port);

        if (!coords) {
          return null;
        }

        return {
          id: `${selectedLocation.id}-port-${index}`,

          name: port.name || 'Unknown Port',

          lat: coords.lat,
          lng: coords.lng,

          port,
        };
      })
      .filter(Boolean);
  }, [selectedLocation, selectedLocationPorts]);

  /* ===================================================
     ROUTE LINES
  =================================================== */

  const routeLines = useMemo(() => {
    if (!selectedLocation) {
      return [];
    }

    const sourceLat = Number(selectedLocation.lat);
    const sourceLng = Number(selectedLocation.lng);

    if (!Number.isFinite(sourceLat) || !Number.isFinite(sourceLng)) {
      return [];
    }

    return portDestinations.map((destination) => ({
      id: destination.id,

      positions: [
        [sourceLat, sourceLng],
        [destination.lat, destination.lng],
      ],
    }));
  }, [selectedLocation, portDestinations]);

  /* ===================================================
     SELECTED PORT NAME
  =================================================== */

  const selectedPortName = normalizePortName(selectedPort?.name);

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="map-wrapper">
      <button
        type="button"
        className="map-fullscreen-button"
        onClick={toggleFullscreen}
        title={isFullscreen ? 'خروج از حالت تمام صفحه' : 'تمام صفحه'}
        aria-label={isFullscreen ? 'خروج از حالت تمام صفحه' : 'تمام صفحه'}
      >
        {isFullscreen ? '⛶' : '⛶'}
      </button>

      <MapContainer center={[35.5, -95.7]} zoom={4} className="map" scrollWheelZoom={true} attributionControl={false}>
        {/* =================================================
            OPEN STREET MAP
        ================================================= */}
        <ClosePopups popupCloseKey={popupCloseKey} />

        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
        {/* =================================================
            MAP CONTROLLER
        ================================================= */}

        <MapController locations={locations} selectedLocation={selectedLocation} />

        {/* =================================================
            GREEN ROUTES
        ================================================= */}

        {routeLines.map((route) => (
          <Polyline
            key={route.id}
            positions={route.positions}
            pathOptions={{
              color: '#16a34a',
              weight: 5,
              opacity: 0.9,
              dashArray: '10 7',
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        ))}

        {/* =================================================
            PORT DESTINATIONS
        ================================================= */}

        {portDestinations.map((destination) => {
          const isSelectedPort = selectedPortName && normalizePortName(destination.name) === selectedPortName;

          return (
            <div key={`port-${destination.id}`}>
              {/* =========================================
                  COLORED PORT CIRCLE
              ========================================= */}

              <CircleMarker
                center={[destination.lat, destination.lng]}
                radius={isSelectedPort ? 13 : 10}
                pathOptions={{
                  color: isSelectedPort ? '#941e26' : '#2563eb',

                  weight: isSelectedPort ? 4 : 3,

                  opacity: 1,

                  fillColor: isSelectedPort ? '#dc3838' : '#3b82f6',

                  fillOpacity: isSelectedPort ? 0.55 : 0.45,
                }}
              />

              {/* =========================================
                  PORT ICON + POPUP
              ========================================= */}

              <Marker position={[destination.lat, destination.lng]} icon={isSelectedPort ? selectedPortIcon : portIcon}>
                <Popup maxWidth={320} minWidth={280} maxHeight={420} className="port-popup">
                  <div
                    className="map-popup"
                    dir="rtl"
                    style={{
                      width: '100%',
                      maxHeight: '380px',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      boxSizing: 'border-box',
                      paddingLeft: '5px',
                      direction: 'rtl',
                      textAlign: 'right',
                    }}
                  >
                    {/* =================================
                        PORT NAME
                    ================================= */}

                    <div
                      className="popup-title"
                      style={{
                        fontWeight: 900,
                        fontSize: '16px',
                      }}
                    >
                      {destination.name}
                    </div>

                    <div
                      className="popup-state"
                      style={{
                        textAlign: 'right',
                      }}
                    >
                      پورت مقصد
                    </div>

                    <div className="popup-divider" />

                    {/* =================================
                        SHIP
                    ================================= */}

                    <div
                      className="popup-price"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        direction: 'rtl',
                        width: '100%',
                      }}
                    >
                      <span
                        style={{
                          textAlign: 'right',
                          fontWeight: 700,
                        }}
                      >
                        کرایه انتقال امریکا الی ترکیه
                      </span>

                      <strong
                        dir="ltr"
                        style={{
                          direction: 'ltr',
                          textAlign: 'left',
                          fontWeight: 900,
                        }}
                      >
                        ${Number(destination.port?.ship || 0).toLocaleString()}
                      </strong>
                    </div>

                    {/* =================================
                        HERAT
                    ================================= */}

                    <div
                      className="popup-price"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        direction: 'rtl',
                        width: '100%',
                      }}
                    >
                      <span
                        style={{
                          textAlign: 'right',
                          fontWeight: 700,
                        }}
                      >
                        ترکیه الی افغانستان (اسلام قلعه)
                      </span>

                      <strong
                        dir="ltr"
                        style={{
                          direction: 'ltr',
                          textAlign: 'left',
                          fontWeight: 900,
                        }}
                      >
                        ${Number(destination.port?.herat || 0).toLocaleString()}
                      </strong>
                    </div>

                    {/* =================================
                        TOTAL
                    ================================= */}

                    <div
                      className="popup-total"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        direction: 'rtl',
                        width: '100%',
                        marginTop: '5px',
                        paddingTop: '7px',
                        borderTop: '1px solid rgba(0,0,0,0.08)',
                      }}
                    >
                      <span
                        style={{
                          textAlign: 'right',
                          fontWeight: 900,
                        }}
                      >
                        مجموع
                      </span>

                      <strong
                        dir="ltr"
                        style={{
                          direction: 'ltr',
                          textAlign: 'left',
                          fontWeight: 950,
                          fontSize: '15px',
                        }}
                      >
                        ${Number(destination.port?.total || 0).toLocaleString()}
                      </strong>
                    </div>

                    {/* =================================
                        SELECT BUTTON
                    ================================= */}

                    <button
                      type="button"
                      style={{
                        width: '100%',
                        marginTop: '10px',
                        padding: '9px',
                        border: 'none',
                        borderRadius: '10px',
                        background: '#2563eb',
                        color: '#fff',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        if (onSelectPort && selectedLocation) {
                          onSelectPort(selectedLocation, destination.port);
                        }
                      }}
                    >
                      انتخاب پورت
                    </button>
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}

        {/* =================================================
            LOCATION / BRANCH MARKERS
        ================================================= */}

        {locations.map((location) => {
          const lat = Number(location.lat);
          const lng = Number(location.lng);

          if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return null;
          }

          const isSelected = selectedLocation && selectedLocation.id === location.id;

          return (
            <Marker
              key={location.id}
              position={[lat, lng]}
              icon={isSelected ? selectedIcon : defaultIcon}
              eventHandlers={{
                click: (e) => {
                  if (onSelectLocation) {
                    onSelectLocation(location);
                  }

                  // Popup همین Location را باز نگه می‌داریم
                  setTimeout(() => {
                    e.target.openPopup();
                  }, 50);
                },
              }}
            >
              <Popup>
                <div className="map-popup">
                  {/* =================================
                      LOCATION
                  ================================= */}

                  {location.branch && (
                    <div className="popup-branch">
                      <div className="popup-title">{location.branch}</div>
                    </div>
                  )}

                  <div className="popup-state">{location.city || location.branch || 'Location'}</div>

                  {location.state && <div className="popup-state">{location.state}</div>}

                  <div className="popup-divider" />

                  {/* =================================
                      PORTS LIST
                  ================================= */}

                  {Array.isArray(location.ports) && location.ports.length > 0 && (
                    <div
                      style={{
                        maxHeight: '180px',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        paddingLeft: '2px',
                        paddingRight: '1px',
                        marginTop: '8px',
                        direction: 'rtl',
                      }}
                    >
                      {location.ports.map((port, index) => {
                        const isSelectedPort = selectedPortName && normalizePortName(port?.name) === selectedPortName;

                        return (
                          <div
                            className="popup-port"
                            key={`${location.id}-${index}`}
                            style={{
                              cursor: 'pointer',

                              border: isSelectedPort ? '2px solid #2563eb' : '1px solid rgba(0,0,0,0.08)',

                              background: isSelectedPort ? '#eff6ff' : '#ffffff',

                              borderRadius: '10px',

                              padding: '9px',

                              marginBottom: '7px',

                              direction: 'rtl',

                              textAlign: 'right',
                            }}
                            onClick={() => {
                              if (onSelectPort) {
                                onSelectPort(location, port);
                              }
                            }}
                          >
                            {/* PORT NAME */}

                            <div
                              className="popup-port-name"
                              style={{
                                color: isSelectedPort ? '#2563eb' : '#111827',

                                fontWeight: 800,

                                fontSize: '13px',

                                marginBottom: '7px',

                                textAlign: 'right',
                              }}
                            >
                              {isSelectedPort && '🔵 '}
                              🚢 {port?.name || 'پورت نامعلوم'}
                            </div>

                            {/* SHIP */}

                            <div
                              className="popup-price"
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                direction: 'rtl',
                              }}
                            >
                              <span
                                style={{
                                  textAlign: 'right',
                                  fontWeight: 700,
                                }}
                              >
                                آمریکا ← ترکیه
                              </span>

                              <strong
                                dir="ltr"
                                style={{
                                  direction: 'ltr',
                                  textAlign: 'left',
                                }}
                              >
                                ${Number(port?.ship || 0).toLocaleString()}
                              </strong>
                            </div>

                            {/* HERAT */}

                            <div
                              className="popup-price"
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                direction: 'rtl',
                              }}
                            >
                              <span
                                style={{
                                  textAlign: 'right',
                                  fontWeight: 700,
                                }}
                              >
                                ترکیه ← (اسلام قلعه)
                              </span>

                              <strong
                                dir="ltr"
                                style={{
                                  direction: 'ltr',
                                  textAlign: 'left',
                                }}
                              >
                                ${Number(port?.herat || 0).toLocaleString()}
                              </strong>
                            </div>

                            {/* TOTAL */}

                            <div
                              className="popup-total"
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                direction: 'rtl',
                                marginTop: '5px',
                                paddingTop: '6px',
                                borderTop: '1px solid rgba(0,0,0,0.08)',
                              }}
                            >
                              <span
                                style={{
                                  textAlign: 'right',
                                  fontWeight: 900,
                                }}
                              >
                                مجموع
                              </span>

                              <strong
                                dir="ltr"
                                style={{
                                  direction: 'ltr',
                                  textAlign: 'left',
                                  fontWeight: 900,
                                }}
                              >
                                ${Number(port?.total || 0).toLocaleString()}
                              </strong>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* =================================
                      COORDINATES
                  ================================= */}

                  <div className="popup-coordinates">
                    {Number(location.lat).toFixed(5)}
                    {' , '}
                    {Number(location.lng).toFixed(5)}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* =================================================
            SELECTED LOCATION HIGHLIGHT
        ================================================= */}

        {selectedLocation && Number.isFinite(Number(selectedLocation.lat)) && Number.isFinite(Number(selectedLocation.lng)) && (
          <CircleMarker
            center={[Number(selectedLocation.lat), Number(selectedLocation.lng)]}
            radius={24}
            pathOptions={{
              color: '#16a34a',
              weight: 4,
              opacity: 1,
              fillColor: '#22c55e',
              fillOpacity: 0.22,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
