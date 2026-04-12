import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isHome   = pathname === "/dashboard";
  const isMovies = pathname.startsWith("/movies");
  const isEvents = pathname.startsWith("/events");

  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-20 border-b border-white/10 bg-black/30 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link to={isAuthenticated ? "/dashboard" : "/login"} className="flex shrink-0 items-center gap-3">
          <div className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-amber-200">
            Cine Vibe
          </div>
          <div className="hidden sm:block">
            <p className="title-font text-base font-semibold leading-tight">Book it now!!</p>
            <p className="text-xs text-white/50">Movies &amp; Events</p>
          </div>
        </Link>

        {/* Centre tab toggle */}
        {isAuthenticated && (
          <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
            <Link to="/dashboard"
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${isHome ? "bg-amber-300 text-black shadow" : "text-white/60 hover:text-white"}`}>
              🏠 <span className="hidden sm:inline">Home</span>
            </Link>
            <Link to="/movies"
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${isMovies ? "bg-amber-300 text-black shadow" : "text-white/60 hover:text-white"}`}>
              🎬 <span className="hidden sm:inline">Movies</span>
            </Link>
            <Link to="/events"
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${isEvents ? "bg-amber-300 text-black shadow" : "text-white/60 hover:text-white"}`}>
              🎪 <span className="hidden sm:inline">Events</span>
            </Link>
          </div>
        )}

        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-2">
          {isAuthenticated ? (
            <>
              <div className="hidden rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/60 lg:block">
                {user?.name} · {user?.role}
              </div>
              <Link to="/profile"
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:border-amber-300/30 hover:text-amber-200 sm:px-4 sm:text-sm">
                My Bookings
              </Link>
              <button type="button"
                onClick={() => { logout(); navigate("/login"); }}
                className="rounded-full bg-amber-300 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-amber-200 sm:px-4 sm:text-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-white/70 transition hover:text-white">Login</Link>
              <Link to="/register" className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-200">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}

export default Navbar;
