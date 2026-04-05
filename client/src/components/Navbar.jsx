import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-20 border-b border-white/10 bg-black/30 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to={isAuthenticated ? "/movies" : "/login"} className="flex items-center gap-3">
          <div className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-amber-200">
            Scale
          </div>
          <div>
            <p className="title-font text-lg font-semibold">Ticket Atlas</p>
            <p className="text-xs text-white/50">Microservices Demo Platform</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 sm:block">
                {user?.name} · {user?.role}
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-white/70 transition hover:text-white">
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-200"
              >
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
