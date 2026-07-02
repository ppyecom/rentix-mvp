import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useAuth } from './context/AuthContext';
import { ReactNode } from 'react';

import Landing from './pages/Landing';
import Marketplace from './pages/Marketplace';
import EquipmentDetail from './pages/EquipmentDetail';
import Publish from './pages/Publish';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import Messages from './pages/Messages';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Admin from './pages/Admin';

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminProtected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_admin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/equipo/:id" element={<EquipmentDetail />} />
        <Route path="/perfil/:id" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/publicar" element={<Protected><Publish /></Protected>} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/perfil/editar" element={<Protected><EditProfile /></Protected>} />
        <Route path="/checkout/:id" element={<Protected><Checkout /></Protected>} />
        <Route path="/mensajes" element={<Protected><Messages /></Protected>} />
        <Route path="/admin" element={<AdminProtected><Admin /></AdminProtected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
