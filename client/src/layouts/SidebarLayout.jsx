import React from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const SidebarLayout = ({ children }) => (
  <div style={{ display: "flex", height: "100vh" }}>
    <Sidebar style={{ width: "240px", flexShrink: 0 }} />
    <main style={{ flexGrow: 1, overflowY: "auto" }}>{children}</main>
  </div>
);

export default SidebarLayout;
