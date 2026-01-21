import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompanyProvider } from "@/contexts/CompanyContext";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <CompanyProvider>
      <App />
    </CompanyProvider>
  </AuthProvider>
);