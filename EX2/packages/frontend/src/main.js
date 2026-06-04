import "./style.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { LearningStudio } from "./LearningStudio.jsx";

const learningStudio = document.querySelector("#learning-studio");

if (learningStudio) {
  createRoot(learningStudio).render(React.createElement(LearningStudio));
}

const app = document.querySelector("#app");

if (app) {
  app.innerHTML = `
    <main class="page">
      <section class="card">
        <h1>ברוכים הבאים</h1>
        <p>זהו פרויקט Vite JavaScript נקי.</p>

        <div class="actions">
          <a href="https://vite.dev/" target="_blank">תיעוד Vite</a>
          <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">תיעוד JavaScript</a>
        </div>
      </section>
    </main>
  `;
}
