export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="vetura-logo-g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#0369a1" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#vetura-logo-g)" />
      <path
        d="M10.2 25.4V21a2.3 2.3 0 0 1 1.4-2.13l1.9-3.9A3.4 3.4 0 0 1 16.6 13h6.8a3.4 3.4 0 0 1 3.1 1.97l1.9 3.9A2.3 2.3 0 0 1 29.8 21v4.4a1.6 1.6 0 0 1-1.6 1.6h-.5a1.6 1.6 0 0 1-1.6-1.6v-.6h-12v.6a1.6 1.6 0 0 1-1.6 1.6h-.5a1.6 1.6 0 0 1-1.8-1.6Z"
        fill="white"
      />
      <circle cx="14.6" cy="24.9" r="2" fill="url(#vetura-logo-g)" />
      <circle cx="25.4" cy="24.9" r="2" fill="url(#vetura-logo-g)" />
      <path d="M13.2 17.6h13.6l1.3 3.1H11.9l1.3-3.1Z" fill="url(#vetura-logo-g)" fillOpacity="0.4" />
      <path d="M16.3 15.1h7.4l1 2.1H15.3l1-2.1Z" fill="url(#vetura-logo-g)" fillOpacity="0.55" />
    </svg>
  );
}
