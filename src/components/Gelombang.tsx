/** Tepi bergelombang antar-bagian (gaya referensi). Warna diatur lewat CSS `color`. */
export function Gelombang({ posisi, className = "" }: { posisi: "bawah" | "atas"; className?: string }) {
  return (
    <div className={"d-gelombang d-gelombang-" + posisi + " " + className} aria-hidden="true">
      <svg viewBox="0 0 1440 110" preserveAspectRatio="none" focusable="false">
        <path className="d-gelombang-isi" d="M0,56 C200,108 420,108 640,70 C860,32 1060,8 1240,30 C1330,41 1390,58 1440,70 L1440,110 L0,110 Z" />
        <path className="d-gelombang-garis" d="M0,56 C200,108 420,108 640,70 C860,32 1060,8 1240,30 C1330,41 1390,58 1440,70" fill="none" pathLength={100} />
      </svg>
    </div>
  );
}
