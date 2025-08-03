"use client";

import NavBar from "../navbar/NavBar";

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* Navbar fixed bên trái */}
      <NavBar />

      {/* Content area */}
      <main
        className="flex-1"
        style={{
          marginLeft: "220px", // Để tránh navbar che content
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}
