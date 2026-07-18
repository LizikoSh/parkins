(() => {
  "use strict";

  const body = document.body;
  const root = document.documentElement;

  // ---------------------------------------------------------------------------
  // Mobile navigation
  // ---------------------------------------------------------------------------
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      siteNav.classList.toggle("is-open", !isOpen);
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuToggle.setAttribute("aria-expanded", "false");
        siteNav.classList.remove("is-open");
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Accessibility: font size
  // ---------------------------------------------------------------------------
  const FONT_MIN = 0.9;
  const FONT_MAX = 1.25;
  const FONT_STEP = 0.1;
  let fontScale = Number(localStorage.getItem("parkinsFontScale")) || 1;

  const applyFontScale = () => {
    fontScale = Math.min(FONT_MAX, Math.max(FONT_MIN, fontScale));
    root.style.setProperty("--font-scale", fontScale.toFixed(2));
    localStorage.setItem("parkinsFontScale", fontScale.toFixed(2));
  };

  applyFontScale();

  document.querySelectorAll("[data-font-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.fontAction;
      fontScale += action === "increase" ? FONT_STEP : -FONT_STEP;
      applyFontScale();
    });
  });

  // ---------------------------------------------------------------------------
  // Accessibility: high contrast
  // ---------------------------------------------------------------------------
  const contrastToggle = document.getElementById("contrastToggle");
  const savedContrast = localStorage.getItem("parkinsContrast") === "true";

  body.classList.toggle("high-contrast", savedContrast);
  contrastToggle?.setAttribute("aria-pressed", String(savedContrast));

  contrastToggle?.addEventListener("click", () => {
    const enabled = !body.classList.contains("high-contrast");
    body.classList.toggle("high-contrast", enabled);
    contrastToggle.setAttribute("aria-pressed", String(enabled));
    localStorage.setItem("parkinsContrast", String(enabled));
  });

  // ---------------------------------------------------------------------------
  // Site search
  // ---------------------------------------------------------------------------
  const searchInput = document.getElementById("searchInput");
  const searchClear = document.getElementById("searchClear");
  const searchStatus = document.getElementById("searchStatus");
  const searchableItems = Array.from(document.querySelectorAll(".searchable"));

  const normalise = (value) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const runSearch = () => {
    const query = normalise(searchInput?.value || "");
    let visibleCount = 0;

    searchableItems.forEach((item) => {
      const content = normalise(
        `${item.dataset.search || ""} ${item.textContent || ""}`
      );
      const matches = !query || content.includes(query);
      item.classList.toggle("is-hidden", !matches);
      if (matches) visibleCount += 1;
    });

    if (!searchStatus) return;

    if (!query) {
      searchStatus.textContent = "";
    } else if (visibleCount === 0) {
      searchStatus.textContent =
        "Нічого не знайдено. Спробуйте коротше слово або іншу форму запиту.";
    } else {
      searchStatus.textContent = `Знайдено матеріалів: ${visibleCount}`;
    }
  };

  searchInput?.addEventListener("input", runSearch);

  searchClear?.addEventListener("click", () => {
    if (!searchInput) return;
    searchInput.value = "";
    runSearch();
    searchInput.focus();
  });

  // ---------------------------------------------------------------------------
  // Accordions
  // ---------------------------------------------------------------------------
  document.querySelectorAll(".accordion__button").forEach((button) => {
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      const panel = button.closest(".accordion")?.querySelector(".accordion__panel");

      button.setAttribute("aria-expanded", String(!expanded));
      if (panel) panel.hidden = expanded;
    });
  });

  // ---------------------------------------------------------------------------
  // Exercise filters
  // ---------------------------------------------------------------------------
  const filterButtons = document.querySelectorAll(".filter-button");
  const exerciseCards = document.querySelectorAll(".exercise-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });

      exerciseCards.forEach((card) => {
        const matches = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-filtered", !matches);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Modals with basic focus management
  // ---------------------------------------------------------------------------
  let activeModal = null;
  let previouslyFocused = null;

  const closeModal = () => {
    if (!activeModal) return;
    activeModal.hidden = true;
    body.classList.remove("is-modal-open");
    previouslyFocused?.focus();
    activeModal = null;
    previouslyFocused = null;
  };

  const openModal = (modal) => {
    if (!modal) return;

    activeModal = modal;
    previouslyFocused = document.activeElement;
    modal.hidden = false;
    body.classList.add("is-modal-open");

    const closeButton = modal.querySelector(".modal__close");
    closeButton?.focus();
  };

  document.querySelectorAll(".modal-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const modal = document.getElementById(trigger.dataset.modal);
      openModal(modal);
    });
  });

  document.querySelectorAll("[data-modal-close]").forEach((closeControl) => {
    closeControl.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }

    if (event.key === "Tab" && activeModal) {
      const focusable = Array.from(
        activeModal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hasAttribute("disabled"));

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  // ---------------------------------------------------------------------------
  // Print checklist
  // ---------------------------------------------------------------------------
  document.getElementById("printChecklist")?.addEventListener("click", () => {
    window.print();
  });

  // ---------------------------------------------------------------------------
  // Disabled demo links
  // ---------------------------------------------------------------------------
  document.querySelectorAll(".disabled-link").forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
  });

  // ---------------------------------------------------------------------------
  // Footer year
  // ---------------------------------------------------------------------------
  const currentYear = document.getElementById("currentYear");
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
})();
