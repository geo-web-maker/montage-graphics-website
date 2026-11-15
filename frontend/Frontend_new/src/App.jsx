import MontagePage from "./MontagePage";
import AdminApp from "./admin/AdminApp";

export default function App() {
  const basePath = new URL(import.meta.env.BASE_URL, window.location.origin).pathname.replace(/\/$/, "");
  const routePath = window.location.pathname.slice(basePath.length) || "/";
  const isAdmin = routePath === "/admin" || routePath.startsWith("/admin/");
  return isAdmin ? <AdminApp /> : <MontagePage />;
}
