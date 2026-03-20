import React, { useEffect, useMemo, useState } from 'react';
import { AsYouType, parsePhoneNumberFromString } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';

type CountryOption = {
  iso2: CountryCode;
  name: string;
  dialCode: string;
  flag: string;
};

const COUNTRIES: CountryOption[] = [
  { iso2: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { iso2: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { iso2: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { iso2: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { iso2: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { iso2: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { iso2: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { iso2: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { iso2: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
  { iso2: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { iso2: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
  { iso2: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺' },
  { iso2: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { iso2: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { iso2: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
];

export type PhonePayload = {
  country: string;
  countryCode: string;
  countryName: string;
  phoneNumber: string;
  fullNumber: string;
  isValid: boolean;
};

interface PhoneInputProps {
  value: string;
  country?: string;
  countryCode?: string;
  onChange: (params: PhonePayload) => void;
  onValidationChange?: (isValid: boolean, errorMessage: string) => void;
  disabled?: boolean;
  label?: string;
  error?: string;
}

const normalizeDigits = (raw: string) => raw.replace(/\D/g, '');

const detectCountryFromLanguage = (): CountryCode | null => {
  const lang = navigator.language || '';
  const region = lang.includes('-') ? lang.split('-')[1].toUpperCase() : '';
  const found = COUNTRIES.find((c) => c.iso2 === region);
  return found?.iso2 ?? null;
};

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  country = 'IN',
  countryCode = '+91',
  onChange,
  onValidationChange,
  disabled = false,
  label = 'Phone',
  error = '',
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>((country as CountryCode) || 'IN');
  const [phone, setPhone] = useState(value || '');
  const [validationError, setValidationError] = useState(error);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const selected = useMemo(() => {
    return COUNTRIES.find((c) => c.iso2 === selectedCountry) || COUNTRIES[0];
  }, [selectedCountry]);

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => {
      const haystack = `${c.name} ${c.dialCode} ${c.iso2}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [countrySearch]);

  useEffect(() => {
    setPhone(value || '');
  }, [value]);

  useEffect(() => {
    setValidationError(error);
  }, [error]);

  useEffect(() => {
    const bootstrapCountry = async () => {
      if (country && COUNTRIES.some((c) => c.iso2 === country)) {
        setSelectedCountry(country as CountryCode);
        return;
      }

      try {
        const ctrl = new AbortController();
        const timeoutId = setTimeout(() => ctrl.abort(), 1500);
        const resp = await fetch('https://ipapi.co/json/', { signal: ctrl.signal });
        clearTimeout(timeoutId);

        if (resp.ok) {
          const geo = (await resp.json()) as { country_code?: string };
          const geoCode = (geo.country_code || '').toUpperCase() as CountryCode;
          if (COUNTRIES.some((c) => c.iso2 === geoCode)) {
            setSelectedCountry(geoCode);
            return;
          }
        }
      } catch {
        // Fallback to browser locale below.
      }

      const fallback = detectCountryFromLanguage();
      if (fallback) setSelectedCountry(fallback);
    };

    bootstrapCountry();
  }, [country]);

  const emitChange = (digits: string, countryOpt: CountryOption) => {
    const parsed = digits ? parsePhoneNumberFromString(digits, countryOpt.iso2) : undefined;
    const isValid = digits.length === 0 ? true : Boolean(parsed?.isValid());
    const fullNumber = parsed?.number || `${countryOpt.dialCode}${digits}`;

    onChange({
      country: countryOpt.iso2,
      countryCode: countryOpt.dialCode,
      countryName: countryOpt.name,
      phoneNumber: digits,
      fullNumber,
      isValid,
    });

    if (onValidationChange) {
      onValidationChange(isValid, isValid ? '' : 'Invalid phone number for selected country');
    }
  };

  const handleCountrySelect = (iso2: CountryCode) => {
    const next = COUNTRIES.find((c) => c.iso2 === iso2);
    if (!next) return;

    let nextDigits = normalizeDigits(phone);
    const nextDialDigits = normalizeDigits(next.dialCode);

    // Remove duplicated dial code if user pasted full number into national field.
    if (nextDigits.startsWith(nextDialDigits) && nextDigits.length > nextDialDigits.length + 6) {
      nextDigits = nextDigits.slice(nextDialDigits.length);
    }

    setSelectedCountry(iso2);
    setPhone(nextDigits);
    setValidationError('');
    setIsDropdownOpen(false);
    setCountrySearch('');
    emitChange(nextDigits, next);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = normalizeDigits(e.target.value);
    const dialDigits = normalizeDigits(selected.dialCode);

    if (digits.startsWith(dialDigits) && digits.length > dialDigits.length + 6) {
      digits = digits.slice(dialDigits.length);
    }

    setPhone(digits);
    setValidationError('');
    emitChange(digits, selected);
  };

  const handlePhoneBlur = () => {
    if (!phone) {
      setValidationError('');
      return;
    }

    const parsed = parsePhoneNumberFromString(phone, selected.iso2);
    if (!parsed?.isValid()) {
      const msg = 'Invalid phone number for selected country';
      setValidationError(msg);
      if (onValidationChange) onValidationChange(false, msg);
      return;
    }

    setValidationError('');
    if (onValidationChange) onValidationChange(true, '');
  };

  const formattedPhone = phone ? new AsYouType(selected.iso2).input(phone) : '';

  return (
    <div>
      {label && <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative sm:basis-[30%]">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsDropdownOpen((v) => !v)}
            className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-200 ${
              disabled ? 'cursor-not-allowed bg-slate-100 text-slate-500' : 'bg-white'
            }`}
          >
            <span className="truncate">{`${selected.flag} ${selected.name} (${selected.dialCode})`}</span>
            <span className="ml-2 text-slate-500">▾</span>
          </button>

          {isDropdownOpen && !disabled && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border bg-white p-2 shadow-lg">
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder="Search country..."
                className="mb-2 w-full rounded-md border px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                autoFocus
              />
              <div className="max-h-64 overflow-y-auto">
                {filteredCountries.length === 0 ? (
                  <div className="px-2 py-2 text-xs text-slate-500">No country found</div>
                ) : (
                  filteredCountries.map((c) => (
                    <button
                      key={c.iso2}
                      type="button"
                      onClick={() => handleCountrySelect(c.iso2)}
                      className="flex w-full items-center rounded-md px-2 py-2 text-left text-sm hover:bg-slate-100"
                    >
                      <span className="mr-2">{c.flag}</span>
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="ml-2 text-slate-500">{c.dialCode}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="sm:basis-[70%]">
          <input
            type="tel"
            value={formattedPhone}
            onChange={handlePhoneChange}
            onBlur={handlePhoneBlur}
            placeholder="Enter phone number"
            disabled={disabled}
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 ${
              validationError
                ? 'border-red-300 bg-red-50 focus:ring-red-200'
                : 'border-slate-300 bg-white focus:ring-indigo-200'
            } ${disabled ? 'cursor-not-allowed bg-slate-100 text-slate-500' : ''}`}
          />
        </div>
      </div>

      {validationError && <div className="mt-2 text-xs text-red-600">{validationError}</div>}
      {!validationError && error && <div className="mt-2 text-xs text-red-600">{error}</div>}
    </div>
  );
};

export default PhoneInput;
