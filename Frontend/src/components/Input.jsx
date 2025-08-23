import { useState } from 'react';

export default function Input({
  label,
  type = 'text',
  error,
  className = '',
  ...props
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          className={
            'w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 ' +
            'text-gray-900 placeholder:text-gray-400 shadow-sm ' +
            'focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 ' +
            (error ? 'border-red-500 focus:ring-red-500/20 ' : '') +
            className
          }
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-2 my-auto rounded px-2 text-sm text-gray-600 hover:text-gray-900"
            aria-label="Toggle password visibility"
          >
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
