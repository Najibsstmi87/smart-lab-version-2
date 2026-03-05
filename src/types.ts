export type Role = 'Guru' | 'Pembantu Makmal' | 'Ketua Panitia';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
}

export interface Experiment {
  id: string;
  tingkatan: number;
  bab: number;
  tajuk: string;
  objektif: string;
  jenis: string;
  default_bahan: { nama: string; kuantiti: number; unit: string }[];
  default_radas: { nama: string; kuantiti: number; unit: string }[];
}

export interface InventoryItem {
  id: string;
  nama_item: string;
  jenis: 'bahan' | 'radas';
  kuantiti_stok: number;
  unit: string;
  minimum_threshold: number;
}

export interface Booking {
  id: string;
  guru_id: string;
  guru_name: string;
  guru_email: string;
  eksperimen_id: string;
  eksperimen_tajuk: string;
  tingkatan?: string;
  kelas?: string;
  makmal?: string;
  tarikh: string; // YYYY-MM-DD
  masa: string; // HH:MM
  bilangan_kumpulan: number;
  senarai_bahan: { nama: string; kuantiti: number; unit: string; unit_khas_nilai?: number; unit_khas?: string }[];
  senarai_radas: { nama: string; kuantiti: number; unit: string; unit_khas_nilai?: number; unit_khas?: string }[];
  lain_lain?: string;
  catatan_guru?: string;
  catatan_makmal?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string; // ISO string
}
