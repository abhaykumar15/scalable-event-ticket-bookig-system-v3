import { Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import BookingPage from "./pages/BookingPage";
import DashboardPage from "./pages/DashboardPage";
import EventBookingPage from "./pages/EventBookingPage";
import EventsPage from "./pages/EventsPage";
import LoginPage from "./pages/LoginPage";
import MoviesPage from "./pages/MoviesPage";
import PaymentPage from "./pages/PaymentPage";
import PaymentStatusPage from "./pages/PaymentStatusPage";
import RegisterPage from "./pages/RegisterPage";
import UserProfilePage from "./pages/UserProfilePage";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-ink text-white">
      <Navbar />
      <Routes>
        {/* Root → dashboard or login */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

        {/* Movies */}
        <Route path="/movies" element={<ProtectedRoute><MoviesPage /></ProtectedRoute>} />
        <Route path="/movies/:movieId/shows/:showId/book" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />

        {/* Events */}
        <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
        <Route path="/events/:eventId/slots/:slotId/book" element={<ProtectedRoute><EventBookingPage /></ProtectedRoute>} />

        {/* Payment */}
        <Route path="/payment/:bookingId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="/payment-status/:bookingId" element={<ProtectedRoute><PaymentStatusPage /></ProtectedRoute>} />

        {/* Profile */}
        <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;
