import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

const Input: React.FC<Props> = ({ label, className = '', ...rest }) => {
  return (
    <label className="block">
      {label && <div className="text-sm font-medium text-slate-700 mb-1">{label}</div>}
      <input
        {...rest}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 ${className}`}
      />
    </label>
  );
};

export default Input;
