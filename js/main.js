
(() => {
  // =========================================
  // MOBILE NAVIGATION
  // =========================================
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");

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

  // =========================================
  // LIGHT / DARK MODE
  // =========================================
  const themeToggle = document.querySelector(".theme-toggle");

  const applyTheme = theme => {
    document.documentElement.setAttribute("data-theme", theme);

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

  try {
    applyTheme(
      localStorage.getItem("lunisi-theme") === "dark"
        ? "dark"
        : "light"
    );
  } catch (error) {
    applyTheme("light");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current =
        document.documentElement.getAttribute("data-theme");

      const next = current === "dark" ? "light" : "dark";

      applyTheme(next);

      try {
        localStorage.setItem("lunisi-theme", next);
      } catch (error) {
        console.warn("Theme preference could not be saved.");
      }
    });
  }

  // =========================================
  // FOOTER YEAR
  // =========================================
  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // =========================================
  // QUOTE FORM ELEMENTS
  // =========================================
  const form = document.getElementById("quote-form");

  // Other pages do not contain the quote form.
  if (!form) return;

  const status = document.getElementById("form-status");
  const submitButton = form.querySelector('button[type="submit"]');
  const serviceSelect = document.getElementById("service-select");
  const binOptions = document.getElementById("bin-options");
  const photoUploadList = document.getElementById("photo-upload-list");

  const MAX_PHOTOS = 5;
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const MAX_TOTAL_SIZE = 7 * 1024 * 1024;

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  const showStatus = (message, type = "") => {
    if (!status) return;

    status.textContent = message;
    status.className = `form-status ${type}`.trim();
  };

  // =========================================
  // SERVICE PRESELECTION AND BIN OPTIONS
  // =========================================
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
      if (binOptions) {
        binOptions.hidden =
          serviceSelect.value !== "Trash Bin Cleaning";
      }
    };

    serviceSelect.addEventListener(
      "change",
      updateConditionalFields
    );

    updateConditionalFields();
  }

  // =========================================
  // PHOTO UPLOAD FIELDS (+ / -)
  // =========================================
  const getPhotoRows = () => {
    if (!photoUploadList) return [];

    return Array.from(
      photoUploadList.querySelectorAll(".photo-upload-row")
    );
  };

  const getPhotoInputs = () =>
    getPhotoRows()
      .map(row => row.querySelector('input[type="file"]'))
      .filter(Boolean);

  const renumberPhotoInputs = () => {
    getPhotoRows().forEach((row, index) => {
      const number = index + 1;
      const input = row.querySelector('input[type="file"]');
      const label = row.querySelector("label");

      if (input) {
        input.id = `photo-${number}`;
        input.name = `photo_${number}`;
        input.accept = "image/jpeg,image/png,image/webp";
      }

      if (label && input) {
        label.htmlFor = input.id;
      }

      const removeButton =
        row.querySelector(".remove-photo-button");

      if (removeButton) {
        removeButton.setAttribute(
          "aria-label",
          `Remove photo ${number}`
        );
      }
    });
  };

  const updatePhotoButtons = () => {
    const rows = getPhotoRows();

    rows.forEach((row, index) => {
      const input = row.querySelector('input[type="file"]');
      const addButton = row.querySelector(".add-photo-button");
      const removeButton = row.querySelector(".remove-photo-button");

      // Show the first field and any field with a selected photo.
      row.hidden = index > 0 && !input?.files?.length;

      // The plus button appears only on the last visible field.
      if (addButton) {
        addButton.hidden =
          row.hidden ||
          index !== rows.filter(item => !item.hidden).length - 1 ||
          rows.length >= MAX_PHOTOS;
      }

      // The first photo field cannot be removed.
      if (removeButton) {
        removeButton.hidden = index === 0 || row.hidden;
      }
    });
  };

  const validatePhotos = () => {
    const files = getPhotoInputs()
      .map(input => input.files?.[0])
      .filter(Boolean);

    if (files.length > MAX_PHOTOS) {
      return "Please upload a maximum of 5 photos.";
    }

    if (files.some(file => !allowedTypes.includes(file.type))) {
      return "Please use JPG, PNG, or WebP images only.";
    }

    if (files.some(file => file.size > MAX_FILE_SIZE)) {
      return "Each photo must be 5 MB or smaller.";
    }

    const totalSize = files.reduce(
      (total, file) => total + file.size,
      0
    );

    if (totalSize > MAX_TOTAL_SIZE) {
      return "The combined photo size must be under 7 MB.";
    }

    return "";
  };

  if (photoUploadList) {
    const initialRows = getPhotoRows();

    // Ensure the initial HTML has the expected five rows.
    // The additional rows remain hidden until needed.
    if (initialRows.length > 0) {
      initialRows.forEach((row, index) => {
        if (index > 0) {
          row.hidden = true;
        }

        const input = row.querySelector('input[type="file"]');

        if (input) {
          input.accept = "image/jpeg,image/png,image/webp";
        }

        // Make sure each row has its own remove button.
        if (
          index > 0 &&
          !row.querySelector(".remove-photo-button")
        ) {
          const remove = document.createElement("button");

          remove.type = "button";
          remove.className = "remove-photo-button";
          remove.textContent = "−";
          remove.setAttribute("aria-label", "Remove photo");
          remove.title = "Remove photo";

          row.appendChild(remove);
        }
      });

      renumberPhotoInputs();
      updatePhotoButtons();
    }

    photoUploadList.addEventListener("click", event => {
      const addButton = event.target.closest(".add-photo-button");
      const removeButton = event.target.closest(".remove-photo-button");

      if (addButton) {
        const rows = getPhotoRows();
        const visibleRows = rows.filter(row => !row.hidden);

        if (visibleRows.length >= MAX_PHOTOS) {
          showStatus("You can upload a maximum of 5 photos.", "error");
          return;
        }

        // Prefer revealing the next pre-existing Netlify field.
        const nextRow = rows.find(row => row.hidden);

        if (nextRow) {
          nextRow.hidden = false;
          renumberPhotoInputs();
          updatePhotoButtons();

          const input = nextRow.querySelector('input[type="file"]');

          if (input) input.focus();

          showStatus("");
        }

        return;
      }

      if (removeButton) {
        const row = removeButton.closest(".photo-upload-row");

        if (!row) return;

        const input = row.querySelector('input[type="file"]');

        if (input) {
          input.value = "";
        }

        // Keep the field in the HTML for Netlify.
        // Hide it rather than deleting it.
        const rowIndex = getPhotoRows().indexOf(row);

        if (rowIndex > 0) {
          row.hidden = true;
        }

        renumberPhotoInputs();
        updatePhotoButtons();
        showStatus("");
      }
    });

    photoUploadList.addEventListener("change", event => {
      if (!event.target.matches('input[type="file"]')) return;

      const error = validatePhotos();

      if (error) {
        event.target.value = "";
        showStatus(error, "error");
      } else {
        showStatus("");
      }

      updatePhotoButtons();
    });
  }

  // =========================================
  // NETLIFY FORMS SUBMISSION
  // =========================================
  form.addEventListener("submit", async event => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const photoError = validatePhotos();

    if (photoError) {
      showStatus(photoError, "error");
      return;
    }

    const originalButtonHTML = submitButton
      ? submitButton.innerHTML
      : "";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    showStatus("");

    try {
      const formData = new FormData(form);

      // Netlify Forms requires this field.
      formData.set(
        "form-name",
        form.getAttribute("name") || "quote-request"
      );

      // Submit multipart form data without manually setting Content-Type.
      const response = await fetch("/", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(
          "Your request could not be submitted. Please try again."
        );
      }

      showStatus(
        "Thank you! Your quote request has been submitted.",
        "success"
      );

      form.reset();

      if (binOptions) {
        binOptions.hidden = true;
      }

      // Reset photo fields to one visible upload row.
      if (photoUploadList) {
        getPhotoRows().forEach((row, index) => {
          row.hidden = index > 0;

          const input = row.querySelector('input[type="file"]');

          if (input) input.value = "";
        });

        renumberPhotoInputs();
        updatePhotoButtons();
      }
    } catch (error) {
      console.error("Quote submission failed:", error);

      showStatus(
        error.message ||
          "Something went wrong. Please try again or contact us directly.",
        "error"
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonHTML;
      }
    }
  });
})();
