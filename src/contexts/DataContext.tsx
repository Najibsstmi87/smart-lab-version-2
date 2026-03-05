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
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        if (isMounted && Array.isArray(data)) {
          setBookings(data);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        // Fallback to local storage if Google Sheets fails
        if (isMounted) {
          const storedBookings = localStorage.getItem('smartlab_bookings');
          if (storedBookings) {
            setBookings(JSON.parse(storedBookings));
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    
    // Load inventory from local storage as fallback
    const storedInventory = localStorage.getItem('smartlab_inventory');
    if (storedInventory) {
      setInventory(JSON.parse(storedInventory));
    }

    return () => {
      isMounted = false;
    };
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
    
    // Save to local storage as backup
    localStorage.setItem('smartlab_bookings', JSON.stringify([...bookings, newBooking]));
    
    alert(`Notifikasi: Tempahan baru oleh ${newBooking.guru_name} sedang dihantar...`);

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        // Use no-cors mode to prevent CORS errors from Google Apps Script
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add',
          booking: newBooking
        })
      });
      console.log("Booking sent to Google Sheets");
    } catch (error) {
      console.error("Error adding booking:", error);
      alert("Ralat: Gagal menyimpan tempahan ke pangkalan data awan. Data disimpan secara lokal.");
    }
  };

  const updateBookingStatus = async (id: string, status: 'Approved' | 'Rejected', catatan_makmal?: string) => {
    // Optimistic UI update
    const updatedBookings = bookings.map(b => b.id === id ? { ...b, status, catatan_makmal } : b);
    setBookings(updatedBookings);
    
    // Save to local storage as backup
    localStorage.setItem('smartlab_bookings', JSON.stringify(updatedBookings));

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
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateStatus',
          id: id,
          status: status,
          catatan_makmal: catatan_makmal || ""
        })
      });
      console.log("Status updated in Google Sheets");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Ralat: Gagal mengemaskini status di pangkalan data awan.");
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
