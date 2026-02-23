import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Logo from "../assets/logo.svg?react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  const pathMatchRoute = (route) => route === location.pathname;
  const [pageState, setPageState] = useState("Sign in");
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setPageState("Profile");
      }
    });
  }, [auth.currentUser]);

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-40">
      <header className="flex justify-between items-center px-3 max-w-6xl mx-auto">
        {/* Logo */}
        <div className="">
          <Logo
            className="h-14 cursor-pointer text-gray-800 hover:text-black transition"
            onClick={() => navigate("/")}
          />
        </div>

        {/* Nav Links */}
        <ul className="flex space-x-10">
          <li
            className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 
              border-b-[3px] border-b-transparent -mb-[3px] ${
                pathMatchRoute("/") && "text-black border-b-red-500"
              }`}
            onClick={() => navigate("/")}
          >
            Home
          </li>

          <li
            className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 
              border-b-[3px] border-b-transparent -mb-[3px] ${
                pathMatchRoute("/offers") && "text-black  border-b-red-500"
              }`}
            onClick={() => navigate("/offers")}
          >
            Offers
          </li>

          <li
            className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 
              border-b-[3px] border-b-transparent -mb-[3px] ${
                (pathMatchRoute("/sign-in") || pathMatchRoute("/profile")) &&
                "text-black border-b-red-500"
              }`}
            onClick={() => navigate("/profile")}
          >
            {pageState}
          </li>
        </ul>
      </header>
    </nav>
  );
};

export default Navbar;
