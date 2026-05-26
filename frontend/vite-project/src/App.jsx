import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute"; // match your exact filename

import Home from "./pages/Home";
import LoginRegister from "./pages/Loginregister";   // match your exact filename
import Userprofile from "./pages/Userprofile";
import JoinProvider from "./pages/JoinProvider"; // match your exact filename
import ExploreProviders from "./pages/ExploreProviders"; // match your exact filename
import BookNow from "./pages/BookNow";
import LocationSearch from "./pages/LocationSearch"; // match your exact filename
import ReactDOM from 'react-dom/client'
/* import Home from './components/Home.jsx' */
/* import Service from './components/Service.jsx'
import About from './components/About'
import Navbar from './components/Navbar'
import Howitworks from './components/Howitworks'
import WhyChooseUs from './components/WhyChooseUs'
import TopProviders from './components/TopProviders'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer' */
/* import LoginRegister from './pages/Loginregister' */


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
        
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/register" element={<LoginRegister />} />
          <Route path="/profile" element={<Userprofile />} />
          <Route path="/join-provider" element={<JoinProvider />} />
          <Route path="/providers" element={<ExploreProviders />} />
          <Route path="/search" element={<LocationSearch />} />
          <Route path="/services" element={
            <ProtectedRoute><BookNow /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
