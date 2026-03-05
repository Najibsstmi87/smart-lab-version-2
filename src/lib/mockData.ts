import { Experiment, InventoryItem, User } from '../types';
import { senaraiEksperimen } from '../data/senaraiEksperimen';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Cikgu Ahmad', role: 'Guru', email: 'ahmad@sekolah.edu.my' },
  { id: 'u2', name: 'Cikgu Siti', role: 'Guru', email: 'siti@sekolah.edu.my' },
  { id: 'u3', name: 'Encik Razak', role: 'Pembantu Makmal', email: 'razak@sekolah.edu.my' },
  { id: 'u4', name: 'Puan Aminah', role: 'Ketua Panitia', email: 'aminah@sekolah.edu.my' },
];

export const mockExperiments: Experiment[] = senaraiEksperimen.map(exp => ({
  id: exp.id,
  tingkatan: exp.tingkatan,
  bab: parseInt(exp.nombor.split('.')[0]) || 0,
  tajuk: `${exp.nombor} ${exp.tajuk}`,
  objektif: exp.jenis,
  jenis: exp.jenis,
  default_bahan: exp.senarai_bahan.map(bahan => ({ nama: bahan, kuantiti: 1, unit: '' })),
  default_radas: exp.senarai_radas.map(radas => ({ nama: radas, kuantiti: 1, unit: '' })),
}));

export const mockInventory: InventoryItem[] = [
  { id: 'i1', nama_item: 'Bikar 250ml', jenis: 'radas', kuantiti_stok: 50, unit: 'unit', minimum_threshold: 10 },
  { id: 'i2', nama_item: 'Silinder Penyukat 100ml', jenis: 'radas', kuantiti_stok: 30, unit: 'unit', minimum_threshold: 5 },
  { id: 'i3', nama_item: 'Kelalang Kon 250ml', jenis: 'radas', kuantiti_stok: 40, unit: 'unit', minimum_threshold: 10 },
  { id: 'i4', nama_item: 'Tabung Uji', jenis: 'radas', kuantiti_stok: 200, unit: 'unit', minimum_threshold: 50 },
  { id: 'i5', nama_item: 'Air Suling', jenis: 'bahan', kuantiti_stok: 5000, unit: 'ml', minimum_threshold: 1000 },
  { id: 'i6', nama_item: 'Garam Biasa (NaCl)', jenis: 'bahan', kuantiti_stok: 1000, unit: 'g', minimum_threshold: 200 },
  { id: 'i7', nama_item: 'Asid Hidroklorik 0.1M', jenis: 'bahan', kuantiti_stok: 2000, unit: 'ml', minimum_threshold: 500 },
  { id: 'i8', nama_item: 'Natrium Hidroksida 0.1M', jenis: 'bahan', kuantiti_stok: 2000, unit: 'ml', minimum_threshold: 500 },
  { id: 'i9', nama_item: 'Buret 50ml', jenis: 'radas', kuantiti_stok: 20, unit: 'unit', minimum_threshold: 5 },
  { id: 'i10', nama_item: 'Pipet 25ml', jenis: 'radas', kuantiti_stok: 20, unit: 'unit', minimum_threshold: 5 },
];
