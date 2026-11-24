const PATHS = {
  kuali: ["M3 10h18", "M4.5 10a7.5 7.5 0 0 0 15 0", "M1.5 10H3M21 10h1.5", "M9 3.5c0 1.4 1 1.4 1 3M13.5 3.5c0 1.4 1 1.4 1 3"],
  bag: ["M5 8h14l-1.2 12H6.2L5 8Z", "M9 8V6.5a3 3 0 0 1 6 0V8"],
  menu: ["M4 7h16M4 12h16M4 17h16"],
  search: ["M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z", "m20.5 20.5-4.5-4.5"],
  sliders: ["M4 7h10M18 7h2M4 17h4M12 17h8", "M16 5v4M10 15v4"],
  calendar: ["M4 6h16v14H4Z", "M4 10h16", "M8 3v4M16 3v4"],
  plus: ["M12 5v14M5 12h14"],
  minus: ["M5 12h14"],
  x: ["M18 6 6 18M6 6l12 12"],
  check: ["M20 6 9 17l-5-5"],
  trash: ["M4 7h16", "M9 7V4.5h6V7", "M6.5 7l1 13h9l1-13"],
  edit: ["M4 20h4L19 9l-4-4L4 16v4Z", "M13.5 6.5l4 4"],
  home: ["M3 11 12 4l9 7", "M5.5 9.5V20h13V9.5"],
  box: ["M3.5 7.5 12 3.5l8.5 4-8.5 4-8.5-4Z", "M3.5 7.5v9l8.5 4 8.5-4v-9", "M12 11.5v9"],
  list: ["M9 6h11M9 12h11M9 18h11", "M4.5 6h.01M4.5 12h.01M4.5 18h.01"],
  chart: ["M4 20V11M10 20V5M16 20v-6M2 20h20"],
  gear: ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z"],
  logout: ["M14 4h5v16h-5", "M10 16.5 14.5 12 10 7.5", "M14.5 12H3"],
  alert: ["M12 8v5", "M12 16.5h.01", "M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"],
  store: ["M4 9.5 5.5 4h13L20 9.5", "M4 9.5h16v.5a3 3 0 0 1-5.3 1.9 3 3 0 0 1-5.4 0A3 3 0 0 1 4 10v-.5Z", "M5.5 13v7h13v-7"],
  reset: ["M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9", "M4.5 4.5V9H9"],
  steak: ["M3 6.5h11.5v8H5.5A2.5 2.5 0 0 1 3 12V6.5Z", "M14.5 9.5h5.5a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-5.5", "M6.5 9h.01"],
  daun: ["M4.5 19.5C4.5 11 10 5.5 19.5 4.5 18.5 14 13 19.5 4.5 19.5Z", "M4.5 19.5 14 10", "M9 15h4M11.5 12.5h3"],
  lock: ["M6 11h12v9H6Z", "M8.5 11V8a3.5 3.5 0 0 1 7 0v3"],
  panah: ["M5 12h14", "m13 6 6 6-6 6"],
  chevron: ["m9 6 6 6-6 6"],
  troli: ["M2.5 4h2.2l2.3 10.3a1.2 1.2 0 0 0 1.2.9h8.7a1.2 1.2 0 0 0 1.2-.9L20 8H6", "M9.5 19.5h.01", "M16.5 19.5h.01"],
  wa: ["M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4l-4.5 1.1Z", "M9 8.6c.3 2.9 2.5 5.4 5.6 6.1l1.4-1.6-2-1.2-.9.9c-1-.5-1.9-1.4-2.4-2.4l.9-.9-1.2-2-1.4 1.1Z"]
} as const;

export type NamaIkon = keyof typeof PATHS;

export function Icon({ name, className }: { name: NamaIkon; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false" className={className}>
      {PATHS[name].map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}
