const screens = [...document.querySelectorAll(".app-screen")];
const navigationItems = [...document.querySelectorAll("[data-screen], [data-open-screen]")];
const importButton = document.querySelector("#import-model");
const modelFileInput = document.querySelector("#model-file");
const darkModeToggle = document.querySelector("#dark-mode");
const themeDescription = document.querySelector("#theme-description");

function showScreen(screenName) {
  screens.forEach((screen) => {
    screen.hidden = screen.id !== `${screenName}-screen`;
  });

  document.querySelectorAll(".nav-item").forEach((item) => {
    const active = item.dataset.screen === screenName;
    item.classList.toggle("is-active", active);
    if (active) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

navigationItems.forEach((item) => {
  item.addEventListener("click", () => showScreen(item.dataset.screen || item.dataset.openScreen));
});

document.querySelector("#ticket-form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector("#classification-result").hidden = false;
});

importButton.addEventListener("click", () => modelFileInput.click());

modelFileInput.addEventListener("change", async () => {
  const [file] = modelFileInput.files;
  if (!file) return;

  const fileName = document.querySelector("#model-filename");
  const fileDetail = document.querySelector("#model-file-detail");
  const importStatus = document.querySelector("#import-status");
  const modelState = document.querySelector("#model-state");
  const modelBadge = document.querySelector("#model-badge");

  fileName.textContent = file.name;
  fileDetail.textContent = `${formatFileSize(file.size)} · checking JSON`;
  importStatus.textContent = "";

  try {
    const contents = await file.text();
    JSON.parse(contents);
    fileDetail.textContent = `${formatFileSize(file.size)} · JSON parsed, schema not validated`;
    modelState.textContent = "Local file selected · not active";
    modelBadge.textContent = "NOT VALIDATED";
    importStatus.textContent = "The file was read locally. A model schema is required before it can classify tickets.";
  } catch {
    fileDetail.textContent = `${formatFileSize(file.size)} · invalid JSON`;
    modelState.textContent = "Model file could not be read";
    modelBadge.textContent = "INVALID FILE";
    importStatus.textContent = "Choose a valid JSON file. The model has not been activated.";
  }
});

function formatFileSize(bytes) {
  if (bytes < 1_000_000) return `${Math.max(1, Math.round(bytes / 1_000))} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

function applyTheme(isDark) {
  document.body.classList.toggle("theme-dark", isDark);
  darkModeToggle.checked = isDark;
  themeDescription.textContent = `Currently using ${isDark ? "dark" : "light"} mode`;
  document.querySelector('meta[name="theme-color"]').content = isDark ? "#101e2d" : "#f3f5f9";
}

darkModeToggle.addEventListener("change", () => {
  const isDark = darkModeToggle.checked;
  applyTheme(isDark);
  localStorage.setItem("support-ticket-theme", isDark ? "dark" : "light");
});

applyTheme(localStorage.getItem("support-ticket-theme") === "dark");