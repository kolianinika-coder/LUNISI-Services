
(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");

  // Mobile navigation
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute(
        "aria-label",
        open ? "Close navigation" : "Open navigation"
      );
    });

    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation");
      });
    });
  }

  // Light / Dark Mode
  const themeToggle = document.querySelector(".theme-toggle");

  const applyTheme = theme => {
    document.documentElement.setAttribute("data-theme", theme);

    // Switch logos according to the selected theme.
    // The HTML pages and images folder are in the project root.
    document.querySelectorAll(".brand-logo").forEach(logo => {
      const logoPath = theme === "dark"
        ? "./images/logo-dark.png"
        : "./images/logo.png";

      logo.onerror = () => {
        console.error("Could not load logo:", logoPath);
      };

      logo.src = logoPath;
    });

    if (themeToggle) {
      const dark = theme === "dark";

      themeToggle.setAttribute(
        "aria-label",
        dark ? "Switch to light mode" : "Switch to dark mode"
      );

      themeToggle.setAttribute(
        "title",
        dark ? "Switch to light mode" : "Switch to dark mode"
      );
    }
  };

  // Restore the saved theme
  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem("lunisi-theme");
  } catch (error) {
    console.warn("Theme preference could not be loaded.");
  }

  applyTheme(savedTheme === "dark" ? "dark" : "light");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme =
        document.documentElement.getAttribute("data-theme");

      const nextTheme = currentTheme === "dark" ? "light" : "dark";

      applyTheme(nextTheme);

      try {
        localStorage.setItem("lunisi-theme", nextTheme);
      } catch (error) {
        console.warn("Theme preference could not be saved.");
      }
    });
  }

  // Current year in footer
  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Quote form conditional fields
  const serviceSelect = document.getElementById("service-select");
  const binOptions = document.getElementById("bin-options");
  const photoInput = document.getElementById("photos");

  if (serviceSelect) {
    const params = new URLSearchParams(window.location.search);

    const serviceMap = {
      "house-cleaning": "House Cleaning",
      "driveway-cleaning": "Driveway Cleaning",
      "junk-removal": "Junk Removal",
      "trash-bin-cleaning": "Trash Bin Cleaning"
    };

    const selected = serviceMap[params.get("service")];

    if (selected) {
      serviceSelect.value = selected;
    }

    const updateConditionalFields = () => {
      const isBins =
        serviceSelect.value === "Trash Bin Cleaning";

      if (binOptions) {
        binOptions.hidden = !isBins;
      }

      if (photoInput) {
        photoInput.required = false;
        photoInput.setAttribute(
          "aria-label",
          "Upload up to five photos"
        );
      }
    };

    serviceSelect.addEventListener(
      "change",
      updateConditionalFields
    );

    updateConditionalFields();
  }

  // Validate uploaded photos
  if (photoInput) {
    photoInput.addEventListener("change", () => {
      const status = document.getElementById("form-status");
      const files = Array.from(photoInput.files || []);

      const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp"
      ];

      const invalid =
        files.length > 5 ||
        files.some(file =>
          !allowed.includes(file.type) ||
          file.size > 5 * 1024 * 1024
        );

      if (invalid) {
        photoInput.value = "";

        if (status) {
          status.textContent =
            "Please choose up to 5 JPG, PNG, or WebP images, each no larger than 5 MB.";

          status.className = "form-status error";
        }
      }
    });
  }

  // Quote request submission
  const form = document.getElementById("quote-form");

  if (form) {
    form.addEventListener("submit", async event => {
      event.preventDefault();

      const status = document.getElementById("form-status");
      const button = form.querySelector(
        'button[type="submit"]'
      );

      const files = Array.from(photoInput?.files || []);

      if (
        files.length > 5 ||
        files.some(file => file.size > 5 * 1024 * 1024)
      ) {
        if (status) {
          status.textContent =
            "Please upload no more than 5 images, up to 5 MB each.";

          status.className = "form-status error";
        }

        return;
      }

      if (!form.reportValidity()) {
        return;
      }

      if (status) {
        status.textContent = "";
        status.className = "form-status";
      }

      if (button) {
        button.disabled = true;
        button.textContent = "Sending...";
      }

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: {
            Accept: "application/json"
          }
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result.error ||
            "The request could not be sent. Please try again later."
          );
        }

        if (status) {
          status.textContent =
            "Thank you! Your request has been submitted.";

          status.className = "form-status success";
        }

        form.reset();

        if (binOptions) {
          binOptions.hidden = true;
        }
      } catch (error) {
        if (status) {
          status.textContent =
            error.message ||
            "The form service is not configured yet. Please contact the business directly.";

          status.className = "form-status error";
        }
      } finally {
        if (button) {
          button.disabled = false;
          button.innerHTML =
            'Send Quote Request <span aria-hidden="true">→</span>';
        }
      }
    });
  }
})();
