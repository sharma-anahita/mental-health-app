import React from 'react';

type LocationInputProps = {
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
};

const LocationInput: React.FC<LocationInputProps> = ({
  value = '',
  onChange,
  disabled = false,
  label = 'Location',
  className = '',
}) => {
  return (
    <label className="block">
      {label && <div className="text-sm font-medium text-slate-700 mb-1">{label}</div>}
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Search location..."
        disabled={disabled}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 ${className}`}
      />
    </label>
  );
};

export default LocationInput;