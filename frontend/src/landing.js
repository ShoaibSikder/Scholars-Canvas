// The static homepage exposes every sample even when scripting is unavailable.
import { warmupBackend } from "./api/warmup";

warmupBackend({ keepalive: true }).catch(() => {
  // The landing page remains usable while Render starts on demand.
});

const demo = document.querySelector(".workspace-demo");
const links = demo ? [...demo.querySelectorAll(".tool-menu a")] : [];
const panels = links.map(link => document.getElementById(link.hash.slice(1)));

function showPreview(index) {
  panels.forEach((panel, position) => {
    panel.hidden = position !== index;
    if (position === index) {
      links[position].setAttribute("aria-current", "true");
    } else {
      links[position].removeAttribute("aria-current");
    }
  });
}

function followFragment() {
  const index = links.findIndex(link => link.hash === location.hash);
  if (index >= 0) {
    showPreview(index);
  } else if (!location.hash) {
    showPreview(0);
  }
}

if (demo) {
  demo.classList.add("is-interactive");
  showPreview(0);
  followFragment();
  window.addEventListener("hashchange", followFragment);
}

links.forEach((link, index) => {
  link.addEventListener("click", event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, "", link.hash);
    showPreview(index);
  });
});

document.querySelectorAll(".feature-card[data-preview]").forEach(card => {
  card.addEventListener("click", event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const index = links.findIndex(link => link.hash === `#${card.dataset.preview}`);
    if (index < 0) return;
    event.preventDefault();
    showPreview(index);
    history.pushState(null, "", card.hash);
    document.querySelector("#tools")?.scrollIntoView({ behavior: "smooth", block: "start" });
    panels[index]?.focus({ preventScroll: true });
  });
});

const themeToggle = document.querySelector(".theme-toggle");
function syncThemeButton() {
  const dark = document.documentElement.classList.contains("dark");
  themeToggle?.setAttribute("aria-pressed", String(dark));
  themeToggle?.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} theme`);
}
syncThemeButton();
themeToggle?.addEventListener("click", () => {
  const root = document.documentElement;
  const dark = root.classList.toggle("dark");
  try {
    const preferences = JSON.parse(localStorage.getItem("studentassistant_preferences") || "{}");
    localStorage.setItem("studentassistant_preferences", JSON.stringify({ ...preferences, dark_mode: dark }));
  } catch { /* The selected theme still applies for this page view. */ }
  syncThemeButton();
});
