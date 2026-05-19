import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import RawMaterials from './pages/RawMaterials.jsx';
import Products from './pages/Products.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';
import LockScreen from './pages/LockScreen.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import { isUnlocked } from './access.js';

export default function App() {
  const [unlocked, setUnlocked] = useState(isUnlocked);

  useEffect(() => {
    const onAccessChange = () => {
      setUnlocked(isUnlocked());
    };

    window.addEventListener('inventory-access-changed', onAccessChange);
    window.addEventListener('storage', onAccessChange);
    return () => {
      window.removeEventListener('inventory-access-changed', onAccessChange);
      window.removeEventListener('storage', onAccessChange);
    };
  }, []);

  return (
    <Routes>
      <Route path="/unlock" element={unlocked ? <Navigate to="/" replace /> : <LockScreen />} />
      <Route element={unlocked ? <AppLayout /> : <Navigate to="/unlock" replace />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="raw-materials" element={<RawMaterials />} />
        <Route path="products" element={<Products />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={unlocked ? <NotFound /> : <Navigate to="/unlock" replace />} />
    </Routes>
  );
}
