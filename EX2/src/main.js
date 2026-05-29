import "./style.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

const rootEl = document.getElementById("app") || document.getElementById("root") || document.getElementById("learning-studio");

if (rootEl) {
  createRoot(rootEl).render(React.createElement(App));
}
