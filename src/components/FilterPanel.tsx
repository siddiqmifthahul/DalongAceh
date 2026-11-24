import { useEffect, useRef } from "react";
import { Icon, type NamaIkon } from "./Icon";
import { rp } from "../lib/format";
import { FILTER_AWAL, HARGA_MAKS_FILTER, type Filter } from "../lib/katalog";
import type { Momen } from "../lib/types";

const HARGA_MIN = 50_000;
const OPSI_MOMEN: { nilai: Momen | "semua"; label: string; ket?: string; ikon: NamaIkon }[] = [
  { nilai: "semua", label: "Semua momen", ikon: "calendar" },
  { nilai: "meugang", label: "Meugang", ket: "Ramadan, Lebaran, Haji", ikon: "steak" },
  { nilai: "kenduri", label: "Kenduri", ket: "Maulid, walimah", ikon: "kuali" }
];

interface Props {
  filter: Filter;
  setFilter: (f: Filter) => void;
  aktif: number;
  cocok: number;
  perMomen: Record<Momen | "semua", number>;
  terbuka: boolean;
  tutup: () => void;
}

export function FilterPanel({ filter, setFilter, aktif, cocok, perMomen, terbuka, tutup }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (terbuka) window.setTimeout(() => ref.current?.querySelector<HTMLInputElement>("input:checked")?.focus(), 60);
  }, [terbuka]);
  const persen = ((filter.hargaMaks - HARGA_MIN) / (HARGA_MAKS_FILTER - HARGA_MIN)) * 100;

  return (
    <aside ref={ref} className={"filter-panel" + (terbuka ? " open" : "")} id="filter-panel" aria-labelledby="filter-title">
      <div className="filter-head on-dark">
        <div className="sheet-grip" aria-hidden="true" />
        <div className="filter-head-row">
          <div>
            <h3 id="filter-title">Saring produk</h3>
            <p className="filter-status" data-active={aktif > 0} aria-live="polite">
              {aktif ? aktif + " filter aktif, " + cocok + " produk cocok" : "Belum ada filter"}
            </p>
          </div>
          <button className="filter-reset" type="button" disabled={aktif === 0}
            onClick={() => setFilter({ ...FILTER_AWAL, q: filter.q, kategori: filter.kategori })}>
            <Icon name="reset" />Reset
          </button>
          <button className="btn btn-icon sheet-close" type="button" onClick={tutup} aria-label="Tutup filter"><Icon name="x" /></button>
        </div>
      </div>
      <div className="songket thin" role="presentation" />
      <div className="filter-body">
        <fieldset className="f-group">
          <legend>Momen</legend>
          <div className="momen-list">
            {OPSI_MOMEN.map(o => (
              <label key={o.nilai} className="momen-opt">
                <input type="radio" name="momen" value={o.nilai} checked={filter.momen === o.nilai}
                  onChange={() => setFilter({ ...filter, momen: o.nilai })} />
                <span className="momen-ic"><Icon name={o.ikon} /></span>
                <span className="momen-txt">{o.label}{o.ket && <small>{o.ket}</small>}</span>
                <span className="momen-count">{perMomen[o.nilai]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="f-group">
          <legend>Ketersediaan</legend>
          <label className="switch-row">
            <span><strong>Sembunyikan yang habis</strong><small>Hanya tampilkan yang masih bisa dipesan</small></span>
            <input type="checkbox" role="switch" checked={filter.sembunyikanHabis}
              onChange={e => setFilter({ ...filter, sembunyikanHabis: e.target.checked })} />
          </label>
        </fieldset>
        <fieldset className="f-group">
          <legend><label htmlFor="max-harga">Harga maksimal</label></legend>
          <output className="price-out" htmlFor="max-harga">
            {filter.hargaMaks >= HARGA_MAKS_FILTER ? "Semua harga" : "Hingga " + rp(filter.hargaMaks)}
          </output>
          <input className="range" id="max-harga" type="range" min={HARGA_MIN} max={HARGA_MAKS_FILTER} step={50_000}
            value={filter.hargaMaks} style={{ ["--fill" as string]: persen + "%" }}
            onChange={e => setFilter({ ...filter, hargaMaks: Number(e.target.value) })} />
          <div className="range-ends"><span>Rp 50 rb</span><span>Rp 3 jt</span></div>
        </fieldset>
        <button className="btn btn-primary btn-block filter-apply" type="button" onClick={tutup}>Tampilkan hasil</button>
      </div>
    </aside>
  );
}
