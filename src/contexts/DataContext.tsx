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

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwXUyV_aG-GQOYtAQpqSYmdeOZaZMUf7N_wlkZBXlC2aqUF5AH9Co1WeyGYCBgU8f7_Bw/exec";

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [experiments] = useState<Experiment[]>(mockExperiments);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Ambil data hanya sekali bila sistem dibuka
  useEffect(() => {
    // 1. Mula-mula, tunjukkan data dari Local Storage (supaya skrin tak blank)
    const storedBookings = localStorage.getItem('smartlab_bookings');
    if (storedBookings) {
      try {
        setBookings(JSON.parse(storedBookings));
      } catch (e) {
        console.error("Ralat membaca local storage", e);
      }
    }

    const storedInventory = localStorage.getItem('smartlab_inventory');
    if (storedInventory) {
      try {
        setInventory(JSON.parse(storedInventory));
      } catch (e) {
        console.error("Ralat membaca inventori", e);
      }
    }

    // 2. Kemudian, cuba ambil data terkini dari Google Sheets di belakang tabir
    fetch(GOOGLE_SCRIPT_URL)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBookings(data);
          localStorage.setItem('smartlab_bookings', JSON.stringify(data));
        }
      })
      .catch(err => console.error("Gagal ambil dari Google Sheets:", err));
  }, []);

  const saveInventory = (newInventory: InventoryItem[]) => {
    setInventory(newInventory);
    localStorage.setItem('smartlab_inventory', JSON.stringify(newInventory));
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

    // Hantar ke Google Sheets
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', booking: newBooking })
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
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStatus', id: id, status: status, catatan_makmal: catatan_makmal || "" })
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
