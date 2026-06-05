import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute"; // match your exact filename
import ProviderRoute from "./components/ProviderRoute"; 
import AdminRoute from "./components/AdminRoute";


import Home from "./pages/Home";
import LoginRegister from "./pages/Loginregister";   // match your exact filename
import Userprofile from "./pages/Userprofile";
import ProviderProfile from "./pages/ProviderProfile";
import AdminProfile from "./pages/AdminProfile";
import JoinProvider from "./pages/JoinProvider"; // match your exact filename
import ExploreProviders from "./pages/ExploreProviders"; // match your exact filename
import BookNow from "./pages/BookNow";
import LocationSearch from "./pages/LocationSearch"; // match your exact filename
import ReactDOM from 'react-dom/client'


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/register" element={<LoginRegister />} />
          <Route path="/profile" element={<Userprofile />} />
          <Route path="/provider-profile" element={
            <ProviderRoute>
              <ProviderProfile />
            </ProviderRoute>
          } />
          <Route path="/admin-profile" element={
            <AdminRoute>
              <AdminProfile />
            </AdminRoute>
          } />
          <Route path="/join-provider" element={<JoinProvider />} />
          <Route path="/providers" element={<ExploreProviders />} />
          <Route path="/search" element={<LocationSearch />} />
          <Route path="/book/:id" element={
            <ProtectedRoute><BookNow /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
