import { Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import BookingPage from "./pages/BookingPage";
import LoginPage from "./pages/LoginPage";
import MoviesPage from "./pages/MoviesPage";
import PaymentStatusPage from "./pages/PaymentStatusPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-ink text-white">
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/movies" : "/login"} replace />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/movies"
          element={
            <ProtectedRoute>
              <MoviesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movies/:movieId/shows/:showId/book"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-status/:bookingId"
          element={
            <ProtectedRoute>
              <PaymentStatusPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
