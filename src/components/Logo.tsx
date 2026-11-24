import { useData } from "../state/data";

/** Logo teks bertumpuk (gaya referensi): nama usaha + subjudul. */
export function Logo({ sub = "Meugang & Kenduri" }: { sub?: string }) {
  const { pengaturan } = useData();
  return (
    <span className="d-logo">
      <span className="d-logo-nama">{pengaturan.namaUsaha}</span>
      <span className="d-logo-sub">{sub}</span>
    </span>
  );
}
