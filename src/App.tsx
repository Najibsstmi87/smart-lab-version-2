import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookingForm from './pages/BookingForm';
import BookingList from './pages/BookingList';
import Analysis from './pages/Analysis';
import PrintLayout from './pages/PrintLayout';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tempahan-baru" element={<BookingForm />} />
              <Route path="/senarai-tempahan" element={<BookingList />} />
              <Route path="/analisis" element={<Analysis />} />
            </Route>
            
            <Route path="/cetak/:id" element={<PrintLayout />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
