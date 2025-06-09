import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import store from "./store";
import { AuthProvider } from "./contexts/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import "./index.css"; // если нужно, можно подключить Tailwind или свои стили

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");
ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Provider store={store}>
      <AuthProvider>
      <BrowserRouter>
          <App />
        </BrowserRouter>
        </AuthProvider>
      </Provider>
    </React.StrictMode>
  );
  