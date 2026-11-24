import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "./styles/global.css";
import "./styles/dalong.css";
import "./styles/gerak.css";
import { App } from "./App";
import { bolehBergerak } from "./lib/gerak";

// Animasi hanya aktif jika pengguna tidak memilih "kurangi gerak" di perangkatnya.
const mintaKurangi = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
if (bolehBergerak(mintaKurangi, "IntersectionObserver" in window)) document.documentElement.classList.add("gerak");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
