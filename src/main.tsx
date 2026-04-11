import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ComingSoon from "./pages/ComingSoon.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ComingSoon />
  </StrictMode>,
);
