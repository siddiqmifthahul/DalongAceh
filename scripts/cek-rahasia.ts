/**
 * npm run cek:rahasia
 * Memindai semua file yang dilacak git. Gagal (exit 1) jika ada kunci/password rahasia.
 * Materi CHAT: "Pastikan tidak ada kunci rahasia yang tertulis langsung di kode."
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { cariRahasia } from "../src/lib/rahasia.ts";

const BINER = /\.(jpe?g|png|webp|gif|ico|woff2?|ttf|pdf|zip)$/i;
const file = execFileSync("git", ["ls-files"], { encoding: "utf8" }).split("\n").filter(f => f && !BINER.test(f));

let total = 0;
for (const f of file) {
  let isi: string;
  try { isi = readFileSync(f, "utf8"); } catch { continue; }
  for (const t of cariRahasia(isi)) {
    total++;
    console.error(`✗ ${f}:${t.baris}  ${t.jenis}  (${t.cuplikan})`);
  }
}

if (total) {
  console.error(`\n${total} kemungkinan rahasia ditemukan. Hapus dari kode dan pindahkan ke environment variable.`);
  process.exit(1);
}
console.log(`✓ ${file.length} file dipindai, tidak ada kunci/password rahasia.`);
