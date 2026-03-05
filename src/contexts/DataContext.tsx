import React, { createContext, useContext, useState, useEffect } from 'react';
import { Booking, Experiment, InventoryItem } from '../types';
import { mockExperiments, mockInventory } from '../lib/mockData';

interface DataContextType {
  experiments: Experiment[];
  inventory: InventoryItem[];
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'created_at' | 'status'>) => void;
  updateBookingStatus: (id: string, status: 'Approved' | 'Rejected', catatan_makmal?: string) => void;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwXUyV_aG-GQOYtAQpqSYmdeOZaZMUf7N_wlkZBXlC2aqUF5AH9Co1WeyGYCBgU8f7_Bw/exec";

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [experiments] = useState<Experiment[]>(mockExperiments);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from Google Sheets on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const data = await response.json();
        if (Array.isArray(data)) {
          setBookings(data);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Load inventory from local storage as fallback
    const storedInventory = localStorage.getItem('smartlab_inventory');
    if (storedInventory) {
      setInventory(JSON.parse(storedInventory));
    }
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
    
    // Optimistic UI update
    setBookings(prev => [...prev, newBooking]);
    alert(`Notifikasi: Tempahan baru oleh ${newBooking.guru_name} sedang dihantar...`);

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'add',
          booking: newBooking
        })
      });
    } catch (error) {
      console.error("Error adding booking:", error);
      alert("Ralat: Gagal menyimpan tempahan ke pangkalan data.");
    }
  };

  const updateBookingStatus = async (id: string, status: 'Approved' | 'Rejected', catatan_makmal?: string) => {
    // Optimistic UI update
    const updatedBookings = bookings.map(b => b.id === id ? { ...b, status, catatan_makmal } : b);
    setBookings(updatedBookings);

    const booking = bookings.find(b => b.id === id);
    if (booking && status === 'Approved') {
      // Auto deduct inventory
      let currentInventory = [...inventory];
      
      booking.senarai_bahan.forEach(bahan => {
        const itemIndex = currentInventory.findIndex(i => i.nama_item === bahan.nama);
        if (itemIndex >= 0) {
          currentInventory[itemIndex].kuantiti_stok -= bahan.kuantiti;
        }
      });
      
      booking.senarai_radas.forEach(radas => {
        const itemIndex = currentInventory.findIndex(i => i.nama_item === radas.nama);
        if (itemIndex >= 0) {
          currentInventory[itemIndex].kuantiti_stok -= radas.kuantiti;
        }
      });
      
      saveInventory(currentInventory);
    }

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'updateStatus',
          id: id,
          status: status,
          catatan_makmal: catatan_makmal || ""
        })
      });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Ralat: Gagal mengemaskini status di pangkalan data.");
    }
  };

  return (
    <DataContext.Provider value={{ experiments, inventory, bookings, addBooking, updateBookingStatus, isLoading }}>
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