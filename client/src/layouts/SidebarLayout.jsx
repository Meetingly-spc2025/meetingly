import Sidebar from "../components/Sidebar";

const SidebarLayout = ({ children }) => (
  <div
    style={{
      display: "flex",
      height: "calc(100vh - var(--header-height))",
      marginTop: "var(--header-height)",
      overflow: "hidden",
    }}
  >
    <Sidebar />
    <main
      style={{
        flex: 1,
        marginLeft: "var(--sidebar-width)",
        overflowY: "auto",
        overflowX: "hidden",
        height: "100%",
      }}
    >
      {children}
    </main>
  </div>
);

export default SidebarLayout;
