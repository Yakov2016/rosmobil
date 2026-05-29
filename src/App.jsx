import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Calculator,
  ChevronDown,
  ChevronRight,
  Clock,
  Contact,
  Gauge,
  LoaderCircle,
  Mail,
  MapPin,
  MapPinned,
  Menu,
  MessageCircle,
  MessageSquare,
  Phone,
  Send,
  Truck,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import logo from '../logo.svg';
import heroImage from '../hero.png';
import kontHeroImage from '../Konthero.png';


const speedIcon = '/icon/speed.png';
const shIcon = '/icon/sh.png';
const lmIcon = '/icon/lm.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const cityOptions = [
  'Москва',
  'Санкт-Петербург',
  'Казань',
  'Нижний Новгород',
  'Екатеринбург',
  'Новосибирск',
  'Краснодар',
  'Ростов-на-Дону',
  'Самара',
  'Челябинск',
  'Пермь',
  'Уфа',
  'Владивосток',
];

const weightOptions = [
  '500 кг',
  '1000 кг',
  '2000 кг',
  '5000 кг',
  '10000 кг',
  '20000 кг',
];

const cityCoordinates = {
  Москва: { lat: 55.7558, lng: 37.6176 },
  'Санкт-Петербург': { lat: 59.9343, lng: 30.3351 },
  Казань: { lat: 55.7961, lng: 49.1064 },
  'Нижний Новгород': { lat: 56.2965, lng: 43.9361 },
  Екатеринбург: { lat: 56.8389, lng: 60.6057 },
  Новосибирск: { lat: 55.0084, lng: 82.9357 },
  Краснодар: { lat: 45.0355, lng: 38.9753 },
  'Ростов-на-Дону': { lat: 47.2357, lng: 39.7015 },
  Самара: { lat: 53.1959, lng: 50.1008 },
  Челябинск: { lat: 55.1644, lng: 61.4368 },
  Пермь: { lat: 58.0105, lng: 56.2502 },
  Уфа: { lat: 54.7388, lng: 55.9721 },
  Владивосток: { lat: 43.1155, lng: 131.8855 },
};

const sharedFeatures = [
  'Гарантия лучшей цены',
  'Личный логист',
  'Надежный транспорт',
];

const dedicatedFeatures = [
  'Подача машины в день заказа',
  'Личный логист',
  'Надежный транспорт',
];

function SoftHomeIcon() {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">
      <path
        d="M5.5 13.2c0-1.15.52-2.24 1.42-2.96l5.08-4.1a3.2 3.2 0 0 1 4 0l5.08 4.1a3.8 3.8 0 0 1 1.42 2.96v7.55a2.75 2.75 0 0 1-2.75 2.75h-3.2v-5.1a2.55 2.55 0 0 0-5.1 0v5.1h-3.2a2.75 2.75 0 0 1-2.75-2.75V13.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function formatPrice(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value) {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
  }).format(value);
}

function pluralizeMachines(count) {
  if (count === 0) return 'Под запрос';

  const lastDigit = count % 10;
  const lastTwo = count % 100;

  if (lastTwo >= 11 && lastTwo <= 19) return `${formatNumber(count)} машин`;

  if (lastDigit === 1) return `${formatNumber(count)} машина`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${formatNumber(count)} машины`;

  return `${formatNumber(count)} машин`;
}

function parseWeight(value) {
  if (!value) return 0;

  const normalized = value.toLowerCase().replace(/\s+/g, '').replace(',', '.');
  const numberMatch = normalized.match(/[\d.]+/);

  if (!numberMatch) return 0;

  const numericValue = Number.parseFloat(numberMatch[0]);

  if (!Number.isFinite(numericValue)) return 0;

  if (normalized.includes('т')) {
    return Math.round(numericValue * 1000);
  }

  return Math.round(numericValue);
}

function getTariffProfile(weightKg) {
  if (weightKg <= 100) {
    return {
      dedicatedLabel: 'Отдельное авто',
      dedicatedRate: null,
      vehicleCount: 6,
    };
  }

  if (weightKg <= 1500) {
    return {
      dedicatedLabel: 'Отдельная газель',
      dedicatedRate: 23,
      vehicleCount: 3,
    };
  }

  if (weightKg <= 3000) {
    return {
      dedicatedLabel: 'Отдельная газель',
      dedicatedRate: 25,
      vehicleCount: 3,
    };
  }

  if (weightKg <= 5000) {
    return {
      dedicatedLabel: 'Отдельный 5-тонник',
      dedicatedRate: 30,
      vehicleCount: 5,
    };
  }

  if (weightKg <= 10000) {
    return {
      dedicatedLabel: 'Отдельный 10-тонник',
      dedicatedRate: 43,
      vehicleCount: 4,
    };
  }

  if (weightKg <= 21000) {
    return {
      dedicatedLabel: 'Отдельный 20-тонник',
      dedicatedRate: 50,
      vehicleCount: 6,
    };
  }

  return {
    dedicatedLabel: 'Тяжеловесный груз',
    dedicatedRate: 50,
    vehicleCount: 0,
    isOversize: true,
  };
}

function buildEstimate({
  distanceKm,
  fromCity,
  toCity,
  weightKg,
}) {
  const tariffProfile = getTariffProfile(weightKg);

  if (tariffProfile.isOversize) {
    return {
      distanceKm,
      fromCity,
      toCity,
      weightKg,
      distanceLabel: `${formatNumber(distanceKm)} км`,
      routeLabel: `${fromCity} → ${toCity}`,
      isOversize: true,
    };
  }

  let dedicatedPrice = 6000;
  let sharedPrice = 6000;

  if (tariffProfile.dedicatedRate !== null) {
    dedicatedPrice = Math.round(distanceKm * tariffProfile.dedicatedRate);

    if (tariffProfile.dedicatedRate === 50 && dedicatedPrice < 21000) {
      dedicatedPrice = 20000;
      sharedPrice = 20000;
    } else {
      sharedPrice = Math.round(dedicatedPrice * 0.9);
    }
  }

  return {
    distanceKm,
    distanceLabel: `${formatNumber(distanceKm)} км`,
    fromCity,
    toCity,
    routeLabel: `${fromCity} → ${toCity}`,
    weightKg,
    vehicleCount: tariffProfile.vehicleCount,
    dedicatedLabel: tariffProfile.dedicatedLabel,
    dedicatedPrice,
    sharedPrice,
    dedicatedFeatures,
    sharedFeatures,
  };
}

function buildRouteLink(fromCity, toCity) {
  const params = new URLSearchParams({
    api: '1',
    origin: fromCity,
    destination: toCity,
    travelmode: 'driving',
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function waitForNextPaint() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(resolve);
    });
  });
}

function haversineDistanceKm(fromPoint, toPoint) {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const latDelta = toRadians(toPoint.lat - fromPoint.lat);
  const lngDelta = toRadians(toPoint.lng - fromPoint.lng);
  const fromLat = toRadians(fromPoint.lat);
  const toLat = toRadians(toPoint.lat);

  const a = Math.sin(latDelta / 2) ** 2
    + Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lngDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function normalizeGeometryPoint(point) {
  return [point.lat, point.lng];
}

function getApproximateDistanceKm(fromCity, toCity) {
  const fromPoint = cityCoordinates[fromCity];
  const toPoint = cityCoordinates[toCity];

  if (!fromPoint || !toPoint) {
    throw new Error('Для одного из городов нет координат маршрута');
  }

  if (fromCity === toCity) {
    return 1;
  }

  return Math.max(1, Math.round(haversineDistanceKm(fromPoint, toPoint) * 1.18));
}

function leafletLatLng(city) {
  const point = cityCoordinates[city];
  if (!point) return null;
  return L.latLng(point.lat, point.lng);
}

async function fetchOsrmRoute(fromCity, toCity) {
  const from = cityCoordinates[fromCity];
  const to = cityCoordinates[toCity];
  if (!from || !to) throw new Error('No coordinates');

  const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('OSRM request failed');
  const data = await res.json();
  if (!data?.routes?.[0]) throw new Error('No route');
  return data.routes[0];
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  icon,
  tone,
  openMenu,
  setOpenMenu,
  inputMode = 'text',
  emptyText = 'Ничего не найдено',
}) {
  const isOpen = openMenu === id;
  const [inputValue, setInputValue] = useState(value);
  const [hasTyped, setHasTyped] = useState(false);
  const inputRef = useRef(null);

  const visibleOptions = useMemo(() => {
    const normalizedQuery = hasTyped ? inputValue.trim().toLowerCase() : '';
    const filteredOptions = normalizedQuery
      ? options.filter((option) => option.toLowerCase().includes(normalizedQuery))
      : options;
    const orderedOptions = normalizedQuery
      ? filteredOptions
      : [
          ...filteredOptions.filter((option) => option === value),
          ...filteredOptions.filter((option) => option !== value),
        ];

    return orderedOptions.slice(0, 6);
  }, [hasTyped, inputValue, options, value]);

  useEffect(() => {
    if (!isOpen) {
      setInputValue(value);
      setHasTyped(false);
      return;
    }

    window.requestAnimationFrame(() => {
      const input = inputRef.current;

      if (!input) return;

      try {
        input.focus({ preventScroll: true });
      } catch {
        input.focus();
      }

      input.setSelectionRange(input.value.length, input.value.length);
    });
  }, [isOpen, value]);

  return (
    <div className="field">
      <span className={`field-icon field-icon-${tone}`}>
        {icon}
      </span>

      <div className="field-content">
        <span className="field-label">{label}</span>

        <div className={`dropdown ${isOpen ? 'is-open' : ''}`}>
          <div className="select-trigger">
            <input
              ref={inputRef}
              className="combobox-input"
              type="text"
              inputMode={inputMode}
              value={inputValue}
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              enterKeyHint="done"
              onFocus={() => {
                setOpenMenu(id);
              }}
              onChange={(event) => {
                const nextValue = event.target.value;

                setInputValue(nextValue);
                setHasTyped(nextValue.trim().length > 0);
                setOpenMenu(id);
                onChange(nextValue);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setOpenMenu(null);
                  return;
                }

                if (event.key === 'Enter' && isOpen && visibleOptions.length > 0) {
                  event.preventDefault();
                  const firstOption = visibleOptions[0];
                  onChange(firstOption);
                  setInputValue(firstOption);
                  setHasTyped(false);
                  setOpenMenu(null);
                }
              }}
            />

            <button
              className="select-chevron-button"
              type="button"
              aria-label={`Открыть список: ${label}`}
              aria-expanded={isOpen}
              onClick={() => setOpenMenu(isOpen ? null : id)}
            >
              <ChevronDown className="select-chevron" size={24} />
            </button>
          </div>

          {isOpen ? (
            <div className="dropdown-menu">
              <div className="dropdown-options" role="listbox">
                {visibleOptions.map((option) => {
                  const isSelected = option === value;

                  return (
                    <button
                      key={option}
                      className={`dropdown-option ${isSelected ? 'is-selected' : ''}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(option);
                        setInputValue(option);
                        setHasTyped(false);
                        setOpenMenu(null);
                      }}
                    >
                      {option}
                    </button>
                  );
                })}

                {visibleOptions.length === 0 ? (
                  <span className="dropdown-empty">{emptyText}</span>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function RouteCard({ routeLabel, weightKg, distanceLabel }) {
  const parts = routeLabel.split('→').map((s) => s.trim());

  return (
    <article className="route-card">
      <div className="route-card__cities">
        <span className="route-card__city">{parts[0]}</span>
        <span className="route-card__arrow">↓</span>
        <span className="route-card__city">{parts[1]}</span>
      </div>

      <div className="route-card__info-stack">
        <span className="route-card__info-item">
          <Gauge size={16} className="route-card__info-icon route-card__info-icon--orange" />
          {formatNumber(weightKg)} кг
        </span>
        <span className="route-card__info-item">
          <MapPin size={16} className="route-card__info-icon route-card__info-icon--blue" />
          {distanceLabel}
        </span>
      </div>
    </article>
  );
}

function pluralizeFreeMachines(count) {
  if (count === 0) return 'Нет свободных машин';

  const lastDigit = count % 10;
  const lastTwo = count % 100;

  if (lastTwo >= 11 && lastTwo <= 19) return `${formatNumber(count)} свободных машин`;

  if (lastDigit === 1) return `${formatNumber(count)} свободная машина`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${formatNumber(count)} свободные машины`;

  return `${formatNumber(count)} свободных машин`;
}

function TariffCard({
  title,
  price,
  vehicleCount,
  features,
}) {
  return (
    <article className="tariff-card">
      <div className="tariff-card__content">
        <h3 className="tariff-card__title">{title}</h3>

        <div className="tariff-card__price">
          <span className="tariff-card__price-prefix">От</span>
          <span className="tariff-card__price-value">{formatPrice(price)}</span>
        </div>

        <ul className="tariff-card__list">
          {features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </div>

      <div className="tariff-card__action">
        <button className="tariff-card__select-btn">Выбрать</button>
        <span className="tariff-card__free-count">
          {vehicleCount > 0 ? '\u2713 ' : ''}{pluralizeFreeMachines(vehicleCount)}
        </span>
      </div>
    </article>
  );
}

function App() {
  const [page, setPage] = useState('main');

  const [fromCity, setFromCity] = useState('Москва');
  const [toCity, setToCity] = useState('Санкт-Петербург');
  const [weightValue, setWeightValue] = useState('1000 кг');
  const [openMenu, setOpenMenu] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [validationMessage, setValidationMessage] = useState('');
  const resultsRef = useRef(null);
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const routeLineRef = useRef(null);

  useEffect(() => {
    if (!openMenu) return undefined;

    const handleOutsidePointerDown = (event) => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest('.dropdown')) return;
      setOpenMenu(null);
    };

    document.addEventListener('pointerdown', handleOutsidePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointerDown);
    };
  }, [openMenu]);

  useEffect(() => () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
    }
  }, []);

  const routeLink = useMemo(() => {
    if (!result) return '#';

    return buildRouteLink(result.fromCity, result.toCity);
  }, [result]);

  const scrollToResults = () => {
    const resultsNode = resultsRef.current;
    if (!resultsNode) return;

    resultsNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearMapLayers = () => {
    markersRef.current.forEach((m) => leafletMapRef.current?.removeLayer(m));
    markersRef.current = [];
    if (routeLineRef.current) {
      leafletMapRef.current?.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }
  };

  const initMap = () => {
    if (leafletMapRef.current) return;

    if (!mapContainerRef.current) return;

    leafletMapRef.current = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
    }).setView([55.7558, 37.6176], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(leafletMapRef.current);

    leafletMapRef.current.on('focus', () => {
      leafletMapRef.current.scrollWheelZoom.enable();
    });

    leafletMapRef.current.on('blur', () => {
      leafletMapRef.current.scrollWheelZoom.disable();
    });
  };

  const drawRouteOnMap = async (nextFromCity, nextToCity) => {
    initMap();
    clearMapLayers();

    const fromLatLng = leafletLatLng(nextFromCity);
    const toLatLng = leafletLatLng(nextToCity);

    if (!fromLatLng || !toLatLng) throw new Error('No coordinates');

    let distanceKm;
    let coords;

    try {
      const route = await fetchOsrmRoute(nextFromCity, nextToCity);

      distanceKm = Math.round(route.distance / 1000);

      if (distanceKm < 1) distanceKm = 1;

      coords = route.geometry.coordinates.map((c) => [c[1], c[0]]);
    } catch {
      distanceKm = getApproximateDistanceKm(nextFromCity, nextToCity);
      coords = [fromLatLng, toLatLng];
    }

    const bounds = L.latLngBounds([fromLatLng, toLatLng]);

    routeLineRef.current = L.polyline(coords, {
      color: '#ff6b21',
      weight: 4,
      opacity: 0.85,
    }).addTo(leafletMapRef.current);

    const fromIcon = L.divIcon({
      className: 'map-marker-from',
      html: '<div class="map-marker-inner map-marker-from-inner"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="10" r="3"/><path d="M12 21s-8-6-8-11a8 8 0 1 1 16 0c0 5-8 11-8 11z"/></svg></div>',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    const toIcon = L.divIcon({
      className: 'map-marker-to',
      html: '<div class="map-marker-inner map-marker-to-inner"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 12l2 2 4-4"/></svg></div>',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    const fromMarker = L.marker(fromLatLng, { icon: fromIcon }).addTo(leafletMapRef.current);
    const toMarker = L.marker(toLatLng, { icon: toIcon }).addTo(leafletMapRef.current);

    markersRef.current = [fromMarker, toMarker];

    if (coords.length > 2) {
      coords.forEach((c) => bounds.extend(c));
    }

    leafletMapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });

    return { distanceKm };
  };

  const handleCalculate = async (event) => {
    event.preventDefault();

    const nextFromCity = fromCity.trim();
    const nextToCity = toCity.trim();
    const nextWeightKg = parseWeight(weightValue);

    if (!nextFromCity || !nextToCity || nextWeightKg <= 0) {
      setValidationMessage('Укажите города отправления, прибытия и вес груза.');
      return;
    }

    setValidationMessage('');
    setOpenMenu(null);
    setIsCalculating(true);

    setResult({
      fromCity: nextFromCity,
      toCity: nextToCity,
      weightKg: nextWeightKg,
      isPending: true,
      routeLabel: `${nextFromCity} → ${nextToCity}`,
    });

    await waitForNextPaint();
    scrollToResults();

    try {
      const { distanceKm } = await drawRouteOnMap(nextFromCity, nextToCity);

      await waitForNextPaint();

      setResult(
        buildEstimate({
          distanceKm,
          fromCity: nextFromCity,
          toCity: nextToCity,
          weightKg: nextWeightKg,
        }),
      );
    } catch {
      const fallbackDistanceKm = getApproximateDistanceKm(nextFromCity, nextToCity);

      initMap();
      clearMapLayers();

      const fromLatLng = leafletLatLng(nextFromCity);
      const toLatLng = leafletLatLng(nextToCity);

      if (fromLatLng && toLatLng) {
        routeLineRef.current = L.polyline([fromLatLng, toLatLng], {
          color: '#ff6b21',
          weight: 4,
          opacity: 0.85,
          dashArray: '8 8',
        }).addTo(leafletMapRef.current);

        L.marker(fromLatLng).addTo(leafletMapRef.current);
        L.marker(toLatLng).addTo(leafletMapRef.current);

        leafletMapRef.current.fitBounds(L.latLngBounds([fromLatLng, toLatLng]), { padding: [50, 50], maxZoom: 12 });
      }

      setResult(
        buildEstimate({
          distanceKm: fallbackDistanceKm,
          fromCity: nextFromCity,
          toCity: nextToCity,
          weightKg: nextWeightKg,
        }),
      );
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <>
      <header className="topbar" aria-label="Верхнее меню">
        <div className="topbar-inner">
          <a className="brand" href="#" aria-label="Росперевозки">
            <img src={logo} alt="Росперевозки" className="brand-logo" />
          </a>

          <a className="phone-link" href="tel:+74995200523" aria-label="Позвонить +7 (499) 520-05-23">
            <Phone size={21} fill="currentColor" />
            <span>+7 (499) 520-05-23</span>
          </a>
        </div>
      </header>

    <main className="app-shell">
      {page === 'contacts' ? (
        <>
          <div className="hero-zone" aria-hidden="true">
            <img
              className="hero-visual"
              src={kontHeroImage}
              width="1536"
              height="1021"
              alt=""
              decoding="async"
            />
          </div>

          <div className="contacts-card">
            <h1 className="contacts-section-title">Контакты</h1>
            <p className="contacts-section-subtitle">Выберите удобный способ связи</p>

            <div className="contacts-list">
              {[
                { title: 'Telegram', value: '@rosperevozki', gradient: 'linear-gradient(135deg, #40bfff, #1d9be8)', icon: Send },
                { title: 'WhatsApp', value: '+7 (800) 555-35-35', gradient: 'linear-gradient(135deg, #62e66b, #21c943)', icon: MessageCircle },
                { title: 'MAX', value: 'Написать в MAX', gradient: 'linear-gradient(135deg, #8d5cff, #6338f0)', icon: MessageSquare },
                { title: 'ВКонтакте', value: 'vk.com/rosperevozki', gradient: 'linear-gradient(135deg, #3fa1ff, #1976e8)', icon: MessageCircle },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <a key={item.title} className="contacts-item" href="#">
                    <span className="contacts-item-icon" style={{ background: item.gradient }}>
                      <Icon size={24} color="#fff" />
                    </span>
                    <span className="contacts-item-text">
                      <span className="contacts-item-name">{item.title}</span>
                      <span className="contacts-item-value">{item.value}</span>
                    </span>
                    <ChevronRight size={22} className="contacts-chevron" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="contacts-info-card">
            {[
              { label: 'Телефон', value: '+7 (499) 520-05-23', icon: Phone },
              { label: 'Email', value: 'info@rosperevozki.ru', icon: Mail },
              { label: 'Режим работы', value: 'Ежедневно, 9:00–21:00', icon: Clock },
            ].map((row, i, arr) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className={`contacts-info-row ${i === arr.length - 1 ? 'contacts-info-row--last' : ''}`}>
                  <span className="contacts-info-icon">
                    <Icon size={20} />
                  </span>
                  <span className="contacts-info-label">{row.label}</span>
                  <span className="contacts-info-value">{row.value}</span>
                  <ChevronRight size={18} className="contacts-info-chevron" />
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="hero-zone" aria-hidden="true">
            <img
              className="hero-visual"
              src={heroImage}
              width="1536"
              height="1021"
              alt=""
              decoding="async"
              fetchPriority="high"
            />
          </div>

      <form className="quote-panel" onSubmit={handleCalculate} aria-label="Расчет грузоперевозки">
        <div className="fields">
          <SelectField
            id="from"
            label="Откуда"
            value={fromCity}
            options={cityOptions}
            onChange={setFromCity}
            icon={<MapPin size={22} aria-hidden="true" />}
            tone="orange"
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
          />

          <SelectField
            id="to"
            label="Куда"
            value={toCity}
            options={cityOptions}
            onChange={setToCity}
            icon={<MapPin size={22} aria-hidden="true" />}
            tone="blue"
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
          />

          <SelectField
            id="weight"
            label="Вес"
            value={weightValue}
            options={weightOptions}
            onChange={setWeightValue}
            icon={<Gauge size={22} aria-hidden="true" />}
            tone="orange"
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
            inputMode="numeric"
            emptyText="Введите вес вручную"
          />
        </div>

        <button className="calculate-button" type="submit" aria-label="Рассчитать стоимость">
          <span className="button-icon">
            {isCalculating ? (
              <LoaderCircle className="is-spinning" size={24} aria-hidden="true" />
            ) : (
              <Calculator size={24} aria-hidden="true" />
            )}
          </span>
          <span>{isCalculating ? 'Считаем маршрут...' : 'Рассчитать стоимость'}</span>
          <span className="button-arrow">
            <ArrowRight size={27} />
          </span>
        </button>

        {validationMessage ? (
          <p className="inline-message" role="alert">{validationMessage}</p>
        ) : null}
      </form>

      {result ? (
        <section ref={resultsRef} className="results-section" aria-label="Результаты расчета">
          {result.isPending ? (
            <div className="results-loading">
              <LoaderCircle className="is-spinning" size={20} />
              <span>Строим маршрут и подтягиваем цены по тарифам...</span>
            </div>
          ) : (
            <>
              <RouteCard
                routeLabel={result.routeLabel}
                weightKg={result.weightKg}
                distanceLabel={result.distanceLabel}
              />

              {result.isOversize ? (
                <div className="results-note">
                  Грузы тяжелее 21 тонны считаются тяжеловесными. Если груз делится на части, обычно
                  потребуется 2 машины. Для неделимого груза нужна спецтехника, цена рассчитывается
                  индивидуально.
                </div>
              ) : null}

              {result.sharedPrice && result.dedicatedPrice ? (
                <>
                  <TariffCard
                    title="Сборный груз"
                    price={result.sharedPrice}
                    vehicleCount={result.vehicleCount}
                    features={result.sharedFeatures}
                  />
                  <TariffCard
                    title={result.dedicatedLabel}
                    price={result.dedicatedPrice}
                    vehicleCount={result.vehicleCount}
                    features={result.dedicatedFeatures}
                  />
                </>
              ) : null}
            </>
          )}

          <div className="map-panel">
            <div className="map-panel__header">
              <div>
                <span className="results-kicker">Маршрут</span>
                <h3 className="map-panel__title">Карта перевозки</h3>
              </div>

              <a className="map-panel__link" href={routeLink} target="_blank" rel="noreferrer">
                <MapPinned size={16} />
                Открыть
              </a>
            </div>

            <div
              className={`route-map ${result.isPending ? 'is-loading' : ''}`}
              aria-label="Карта маршрута"
            >
              <div ref={mapContainerRef} className="route-map__canvas" aria-hidden="true" />

              {result.isPending ? (
                <div className="route-map__overlay">
                  <LoaderCircle className="is-spinning" size={22} />
                  <span>Готовим карту...</span>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

        <div className="status-zone">
          <section className="status-row" aria-label="Преимущества доставки">
            <article className="status-item">
              <span className="status-icon">
                <img src={speedIcon} alt="" className="status-icon-img" />
              </span>
              <span>
                <strong>Доставка</strong>
                в срок
              </span>
            </article>
            <article className="status-item">
              <span className="status-icon">
                <img src={shIcon} alt="" className="status-icon-img" />
              </span>
              <span>
                <strong>Страхование</strong>
                по договору
              </span>
            </article>
            <article className="status-item">
              <span className="status-icon">
                <img src={lmIcon} alt="" className="status-icon-img" />
              </span>
              <span>
                <strong>Личный</strong>
                менеджер
              </span>
            </article>
          </section>
        </div>

        </>
      )}

      <nav className="bottom-nav" aria-label="Мобильное меню">
        <a className={`nav-item ${page === 'main' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setPage('main'); }}>
          <SoftHomeIcon />
          <span>Главная</span>
        </a>
        <a className="nav-item" href="#" onClick={(e) => { e.preventDefault(); }}>
          <Truck size={28} />
          <span>Услуги</span>
        </a>
        <a className="call-action" href="tel:+74995200523" aria-label="Быстрый звонок">
          <Phone size={32} fill="currentColor" />
        </a>
        <a className={`nav-item ${page === 'contacts' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setPage('contacts'); }}>
          <Contact size={28} />
          <span>Контакты</span>
        </a>
        <a className="nav-item" href="#" onClick={(e) => { e.preventDefault(); }}>
          <Menu size={29} />
          <span>Меню</span>
        </a>
      </nav>
    </main>
    </>
  );
}

export default App;

