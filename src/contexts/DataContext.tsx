import React, { createContext, useContext, useState, useEffect } from 'react';
import { Booking, Experiment, InventoryItem } from '../types';
import { mockExperiments, mockInventory } from '../lib/mockData';

interface DataContextType {
  experiments: Experiment[];
  inventory: InventoryItem[];
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'created_at' | 'status'>) => void;
  updateBookingStatus: (id: string, status: 'Approved' | 'Rejected', catatan_makmal?: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// SILA MASUKKAN URL GOOGLE SCRIPT CIKGU DI BAWAH INI:
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwSnIL8EVPYdyFcH8RLR-KB7olxDBsq5TVJ3y4muYkYrErf9oTCL5aA8w8cRuj15Zu-xg/exec";

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    // 1. Tunjuk data dari Local Storage dulu
    const storedBookings = localStorage.getItem('smartlab_bookings');
    if (storedBookings) setBookings(JSON.parse(storedBookings));

    const storedInventory = localStorage.getItem('smartlab_inventory');
    if (storedInventory) setInventory(JSON.parse(storedInventory));

    const storedExperiments = localStorage.getItem('smartlab_experiments');
    if (storedExperiments) setExperiments(JSON.parse(storedExperiments));

    // 2. Ambil data berpusat dari Google Sheets
    fetch(GOOGLE_SCRIPT_URL)
      .then(res => res.json())
      .then(data => {
        if (data.bookings) {
          setBookings(data.bookings);
          localStorage.setItem('smartlab_bookings', JSON.stringify(data.bookings));
        }

        // Sync Inventori
        if (data.inventory && data.inventory.length > 0) {
          setInventory(data.inventory);
          localStorage.setItem('smartlab_inventory', JSON.stringify(data.inventory));
        } else {
          // Jika kosong di Sheets, hantar mockData ke Sheets
          setInventory(mockInventory);
          syncInventoryToDB(mockInventory);
        }

        // Sync Eksperimen
        if (data.experiments && data.experiments.length > 0) {
          setExperiments(data.experiments);
          localStorage.setItem('smartlab_experiments', JSON.stringify(data.experiments));
        } else {
          setExperiments(mockExperiments);
          syncExperimentsToDB(mockExperiments);
        }
      })
      .catch(err => console.error("Gagal ambil dari Google Sheets:", err));
  }, []);

  const syncInventoryToDB = async (inv: InventoryItem[]) => {
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'syncInventori', inventory: inv })
      });
    } catch (e) {}
  };

  const syncExperimentsToDB = async (exp: Experiment[]) => {
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'syncEksperimen', experiments: exp })
      });
    } catch (e) {}
  };

  const saveInventory = (newInventory: InventoryItem[]) => {
    setInventory(newInventory);
    localStorage.setItem('smartlab_inventory', JSON.stringify(newInventory));
    syncInventoryToDB(newInventory); // Hantar ke Sheets
  };

  const addBooking = async (bookingData: Omit<Booking, 'id' | 'created_at' | 'status'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: `b${Date.now()}`,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };
    
    // Kemaskini skrin terus
    const newBookingsList = [...bookings, newBooking];
    setBookings(newBookingsList);
    localStorage.setItem('smartlab_bookings', JSON.stringify(newBookingsList));
    
    alert(`Notifikasi: Tempahan baru oleh ${newBooking.guru_name} sedang dihantar...`);

    // Hantar ke Google Sheets menggunakan kaedah yang betul untuk elak CORS
    try {
      const payload = { action: 'add', booking: newBooking };
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error("Gagal hantar ke Google Sheets:", error);
    }
  };

  const updateBookingStatus = async (id: string, status: 'Approved' | 'Rejected', catatan_makmal?: string) => {
    // Kemaskini skrin terus
    const updatedBookings = bookings.map(b => b.id === id ? { ...b, status, catatan_makmal } : b);
    setBookings(updatedBookings);
    localStorage.setItem('smartlab_bookings', JSON.stringify(updatedBookings));

    const booking = bookings.find(b => b.id === id);
    if (booking && status === 'Approved') {
      let currentInventory = [...inventory];
      booking.senarai_bahan.forEach(bahan => {
        const itemIndex = currentInventory.findIndex(i => i.nama_item === bahan.nama);
        if (itemIndex >= 0) currentInventory[itemIndex].kuantiti_stok -= bahan.kuantiti;
      });
      booking.senarai_radas.forEach(radas => {
        const itemIndex = currentInventory.findIndex(i => i.nama_item === radas.nama);
        if (itemIndex >= 0) currentInventory[itemIndex].kuantiti_stok -= radas.kuantiti;
      });
      saveInventory(currentInventory);
    }

    // Hantar ke Google Sheets
    try {
      const payload = { action: 'updateStatus', id: id, status: status, catatan_makmal: catatan_makmal || "" };
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error("Gagal kemaskini Google Sheets:", error);
    }
  };

  return (
    <DataContext.Provider value={{ experiments, inventory, bookings, addBooking, updateBookingStatus }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
