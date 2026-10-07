import React from 'react';

// Brand isotipo (document with folded corner) plus the NOTES wordmark
const Logo = ({ size = 30, wordmark = true, inverse = false, className = '' }) => (
  <span
    className={`logo ${inverse ? 'logo-inverse' : ''} ${className}`}
    style={{ fontSize: `${size * 0.66}px` }}
  >
    <svg
      width={(size * 44) / 50}
      height={size}
      viewBox="0 0 44 50"
      role="img"
      aria-label="Notes"
    >
      <path
        className="logo-body"
        d="M12 0h14l18 18v20a12 12 0 0 1-12 12H12A12 12 0 0 1 0 38V12A12 12 0 0 1 12 0z"
      />
      <path className="logo-fold" d="M26 0l18 18H34a8 8 0 0 1-8-8V0z" />
      <rect className="logo-line" x="9" y="23" width="18" height="4" rx="2" />
      <rect className="logo-line" x="9" y="31" width="26" height="4" rx="2" />
      <rect className="logo-line" x="9" y="39" width="18" height="4" rx="2" />
    </svg>
    {wordmark && <span className="logo-word">Notes</span>}
  </span>
);

export default Logo;
