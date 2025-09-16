import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "sonner";
import { store, persistor } from "./store";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./index.css";
import App from "./App.tsx";
import { initSocket } from "@/lib/socket";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          {/* Initialize WebSocket connection */}
          {initSocket() && null}
          <App />
          <Toaster
            position="top-right"
            richColors
            expand={true}
            duration={4000}
          />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
