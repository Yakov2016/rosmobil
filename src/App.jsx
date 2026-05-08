import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Contact,
  Menu,
  Phone,
  Truck,
} from 'lucide-react';
import logo from '../logo.svg';
import heroImage from '../hero.png';
import speedIcon from '../speed.png';
import shIcon from '../sh.png';
import lmIcon from '../lm.png';

const cities = [
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

const weights = [
  { label: 'От 100 кг', kg: 100, factor: 1 },
  { label: 'От 1500 кг', kg: 1500, factor: 2.7 },
  { label: 'От 5000 кг', kg: 5000, factor: 5.8 },
  { label: 'От 10000 кг', kg: 10000, factor: 9.2 },
  { label: 'От 20000 кг', kg: 20000, factor: 15.5 },
];

const cityRates = {
  Москва: 1,
  'Санкт-Петербург': 1.08,
  Казань: 1.16,
  'Нижний Новгород': 1.1,
  Екатеринбург: 1.42,
  Новосибирск: 1.72,
  Краснодар: 1.28,
  'Ростов-на-Дону': 1.22,
  Самара: 1.2,
  Челябинск: 1.35,
  Пермь: 1.3,
  Уфа: 1.27,
  Владивосток: 2.05,
};

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

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  iconClass,
  tone,
  openMenu,
  setOpenMenu,
}) {
  const isOpen = openMenu === id;
  const [inputValue, setInputValue] = useState(value);
  const [hasTyped, setHasTyped] = useState(false);
  const [replaceOnType, setReplaceOnType] = useState(false);
  const inputRef = useRef(null);

  const visibleOptions = useMemo(() => {
    const normalizedQuery = hasTyped ? inputValue.trim().toLowerCase() : '';
    const filteredOptions = normalizedQuery
      ? options.filter((option) => {
          const optionValue = typeof option === 'string' ? option : option.label;
          return optionValue.toLowerCase().includes(normalizedQuery);
        })
      : options;
    const orderedOptions = normalizedQuery
      ? filteredOptions
      : [
          ...filteredOptions.filter((option) => {
            const optionValue = typeof option === 'string' ? option : option.label;
            return optionValue === value;
          }),
          ...filteredOptions.filter((option) => {
            const optionValue = typeof option === 'string' ? option : option.label;
            return optionValue !== value;
          }),
        ];

    return orderedOptions.slice(0, 5);
  }, [hasTyped, inputValue, options, value]);

  useEffect(() => {
    if (!isOpen) {
      setInputValue(value);
      setHasTyped(false);
      setReplaceOnType(false);
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
      setReplaceOnType(true);
    });
  }, [isOpen, value]);

  const replaceInputValue = (nextValue) => {
    setInputValue(nextValue);
    setHasTyped(nextValue.trim().length > 0);
    setReplaceOnType(false);
    setOpenMenu(id);
  };

  return (
    <div className="field">
      <span className={`field-icon field-icon-${tone}`}>
        <i className={`bi ${iconClass}`} aria-hidden="true" />
      </span>

      <div className="field-content">
        <span className="field-label">{label}</span>

        <div className={`dropdown ${isOpen ? 'is-open' : ''}`}>
          <div className="select-trigger">
            <input
              ref={inputRef}
              className={`combobox-input ${replaceOnType ? 'is-soft-selected' : ''}`}
              type="text"
              value={inputValue}
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              enterKeyHint="done"
              onPointerDown={() => {
                if (document.activeElement === inputRef.current) {
                  setReplaceOnType(false);
                }
              }}
              onFocus={(event) => {
                setOpenMenu(id);
                event.currentTarget.setSelectionRange(
                  event.currentTarget.value.length,
                  event.currentTarget.value.length,
                );
                setReplaceOnType(true);
              }}
              onBeforeInput={(event) => {
                if (!replaceOnType) return;

                const { data, inputType } = event.nativeEvent;

                if (inputType?.startsWith('insert')) {
                  event.preventDefault();
                  replaceInputValue(data ?? '');
                  return;
                }

                if (inputType === 'deleteContentBackward' || inputType === 'deleteContentForward') {
                  event.preventDefault();
                  replaceInputValue('');
                }
              }}
              onPaste={(event) => {
                if (!replaceOnType) return;

                event.preventDefault();
                replaceInputValue(event.clipboardData.getData('text'));
              }}
              onSelect={(event) => {
                if (event.currentTarget.selectionStart !== event.currentTarget.selectionEnd) {
                  setReplaceOnType(false);
                }
              }}
              onChange={(event) => {
                const nextValue = replaceOnType && event.target.value.startsWith(value)
                  ? event.target.value.slice(value.length)
                  : event.target.value;

                setInputValue(nextValue);
                setHasTyped(nextValue.trim().length > 0);
                setReplaceOnType(false);
                setOpenMenu(id);
              }}
              onKeyDown={(event) => {
                if (
                  replaceOnType
                  && event.key.length === 1
                  && !event.altKey
                  && !event.ctrlKey
                  && !event.metaKey
                ) {
                  event.preventDefault();
                  replaceInputValue(event.key);
                  return;
                }

                if (replaceOnType && (event.key === 'Backspace' || event.key === 'Delete')) {
                  event.preventDefault();
                  replaceInputValue('');
                  return;
                }

                if (event.key.startsWith('Arrow') || event.key === 'Home' || event.key === 'End') {
                  setReplaceOnType(false);
                }

                if (event.key === 'Escape') {
                  setOpenMenu(null);
                  return;
                }

                if (event.key === 'Enter' && isOpen && visibleOptions.length > 0) {
                  event.preventDefault();
                  const firstOption = visibleOptions[0];
                  const optionValue = typeof firstOption === 'string' ? firstOption : firstOption.label;
                  onChange(optionValue);
                  setInputValue(optionValue);
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
                  const optionValue = typeof option === 'string' ? option : option.label;
                  const isSelected = optionValue === value;

                  return (
                    <button
                      key={optionValue}
                      className={`dropdown-option ${isSelected ? 'is-selected' : ''}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(optionValue);
                        setInputValue(optionValue);
                        setHasTyped(false);
                        setOpenMenu(null);
                      }}
                    >
                      {optionValue}
                    </button>
                  );
                })}

                {visibleOptions.length === 0 ? (
                  <span className="dropdown-empty">Город не найден</span>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [fromCity, setFromCity] = useState('Москва');
  const [toCity, setToCity] = useState('Санкт-Петербург');
  const [weight, setWeight] = useState(weights[0].label);
  const [estimate, setEstimate] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

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

  const selectedWeight = useMemo(
    () => weights.find((item) => item.label === weight) ?? weights[0],
    [weight],
  );

  const calculatedPrice = useMemo(() => {
    const fromRate = cityRates[fromCity] ?? 1;
    const toRate = cityRates[toCity] ?? 1;
    const routeFactor = fromCity === toCity ? 0.62 : (fromRate + toRate) / 2;
    return Math.round((3400 + selectedWeight.kg * 8.5) * selectedWeight.factor * routeFactor);
  }, [fromCity, selectedWeight.factor, selectedWeight.kg, toCity]);

  const handleCalculate = (event) => {
    event.preventDefault();
    setOpenMenu(null);
    setEstimate({
      price: calculatedPrice,
      days: fromCity === toCity ? '1-2 дня' : toCity === 'Владивосток' ? '8-12 дней' : '3-7 дней',
    });
  };

  return (
    <main className="app-shell">
      <header className="topbar" aria-label="Верхнее меню">
        <a className="brand" href="#" aria-label="Росперевозки">
          <img src={logo} alt="Росперевозки" className="brand-logo" />
        </a>

        <a className="phone-link" href="tel:88005553535" aria-label="Позвонить 8 800 555 35 35">
          <Phone size={21} fill="currentColor" />
          <span>88005553535</span>
        </a>
      </header>

      <div className="hero-zone" aria-hidden="true">
        <img className="hero-visual" src={heroImage} alt="" />
      </div>

      <form className="quote-panel" onSubmit={handleCalculate} aria-label="Расчет грузоперевозки">
        <div className="fields">
          <SelectField
            id="from"
            label="Откуда"
            value={fromCity}
            options={cities}
            onChange={setFromCity}
            iconClass="bi-geo-alt-fill"
            tone="orange"
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
          />

          <SelectField
            id="to"
            label="Куда"
            value={toCity}
            options={cities}
            onChange={setToCity}
            iconClass="bi-geo-alt-fill"
            tone="blue"
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
          />

          <SelectField
            id="weight"
            label="Вес"
            value={weight}
            options={weights}
            onChange={setWeight}
            iconClass="bi-speedometer2"
            tone="orange"
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
          />
        </div>

        <button className="calculate-button" type="submit" aria-label="Рассчитать стоимость">
          <span className="button-icon">
            <i className="bi bi-calculator-fill" aria-hidden="true" />
          </span>
          <span>Рассчитать стоимость</span>
          <span className="button-arrow">
            <ArrowRight size={27} />
          </span>
        </button>

        <span className="sr-only" aria-live="polite">
          {estimate ? `${formatPrice(estimate.price)}, ${estimate.days}` : ''}
        </span>
      </form>

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

      <nav className="bottom-nav" aria-label="Мобильное меню">
        <a className="nav-item active" href="#">
          <SoftHomeIcon />
          <span>Главная</span>
        </a>
        <a className="nav-item" href="#">
          <Truck size={28} />
          <span>Услуги</span>
        </a>
        <a className="call-action" href="tel:88005553535" aria-label="Быстрый звонок">
          <Phone size={32} fill="currentColor" />
        </a>
        <a className="nav-item" href="#">
          <Contact size={28} />
          <span>Контакты</span>
        </a>
        <a className="nav-item" href="#">
          <Menu size={29} />
          <span>Меню</span>
        </a>
      </nav>
    </main>
  );
}

export default App;
