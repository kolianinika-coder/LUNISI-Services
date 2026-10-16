
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
  // QUOTE FORM
  // =========================================
  const form = document.getElementById("quote-form");

  if (!form) return;

  const status = document.getElementById("form-status");
  const submitButton = form.querySelector('button[type="submit"]');
  const serviceSelect = document.getElementById("service-select");
  const binOptions = document.getElementById("bin-options");

  const photoUploadList =
    document.getElementById("photo-upload-list");

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
  // PRESELECT SERVICE FROM URL
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
  // DYNAMIC PHOTO FIELDS (+ / -)
  // =========================================
  const getPhotoInputs = () => {
    if (!photoUploadList) return [];

    return Array.from(
      photoUploadList.querySelectorAll('input[type="file"]')
    );
  };

  const renumberPhotoInputs = () => {
    if (!photoUploadList) return;

    const rows = Array.from(
      photoUploadList.querySelectorAll(".photo-upload-row")
    );

    rows.forEach((row, index) => {
      const input = row.querySelector('input[type="file"]');
      const number = index + 1;

      if (input) {
        input.name = `photo_${number}`;
        input.id = `photo-${number}`;
        input.accept = "image/jpeg,image/png,image/webp";
      }

      const label = row.querySelector("label");

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
    if (!photoUploadList) return;

    const rows = Array.from(
      photoUploadList.querySelectorAll(".photo-upload-row")
    );

    rows.forEach((row, index) => {
      const addButton =
        row.querySelector(".add-photo-button");

      const removeButton =
        row.querySelector(".remove-photo-button");

      if (addButton) {
        addButton.hidden =
          index !== rows.length - 1 ||
          rows.length >= MAX_PHOTOS;
      }

      if (removeButton) {
        removeButton.hidden = rows.length <= 1;
      }
    });
  };

  const validatePhotos = () => {
    const files = getPhotoInputs()
      .map(input => input.files?.[0])
      .filter(Boolean);

    if (files.length > MAX_PHOTOS) {
      return "You can upload a maximum of 5 photos.";
    }

    if (files.some(file => !allowedTypes.includes(file.type))) {
      return "Please upload JPG, PNG, or WebP images only.";
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
    // Make sure the first field has the correct structure.
    let rows = Array.from(
      photoUploadList.querySelectorAll(".photo-upload-row")
    );

    if (rows.length === 0) {
      const firstInput =
        photoUploadList.querySelector('input[type="file"]');

      if (firstInput) {
        const row = document.createElement("div");
        row.className = "photo-upload-row";

        firstInput.parentNode.insertBefore(row, firstInput);
        row.appendChild(firstInput);

        const addButton = document.createElement("button");
        addButton.type = "button";
        addButton.className = "add-photo-button";
        addButton.textContent = "+";
        addButton.setAttribute("aria-label", "Add another photo");

        row.appendChild(addButton);
      }
    }

    photoUploadList.addEventListener("click", event => {
      const addButton =
        event.target.closest(".add-photo-button");

      const removeButton =
        event.target.closest(".remove-photo-button");

      if (addButton) {
        const currentRows =
          photoUploadList.querySelectorAll(".photo-upload-row");

        if (currentRows.length >= MAX_PHOTOS) return;

        const row = document.createElement("div");
        row.className = "photo-upload-row";

        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/jpeg,image/png,image/webp";

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "remove-photo-button";
        remove.textContent = "−";
        remove.setAttribute("aria-label", "Remove photo");

        const add = document.createElement("button");
        add.type = "button";
        add.className = "add-photo-button";
        add.textContent = "+";
        add.setAttribute("aria-label", "Add another photo");

        row.append(input, remove, add);
        photoUploadList.appendChild(row);

        renumberPhotoInputs();
        updatePhotoButtons();
        showStatus("");
      }

      if (removeButton) {
        const row = removeButton.closest(".photo-upload-row");

        if (row) row.remove();

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
    });

    renumberPhotoInputs();
    updatePhotoButtons();
  }

  // =========================================
  // SUBMIT FORM TO NETLIFY FORMS
  // =========================================
  form.addEventListener("submit", async event => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const photoError = validatePhotos();

    if (photoError) {
      showStatus(photoError, "error");
      return;
    }

    showStatus("");

    const originalButtonHTML = submitButton
      ? submitButton.innerHTML
      : "";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    try {
      const formData = new FormData(form);

      // Required by Netlify Forms.
      formData.set("form-name", form.getAttribute("name") || "quote-request");

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

      // Keep one photo field after successful submission.
      if (photoUploadList) {
        const rows = Array.from(
          photoUploadList.querySelectorAll(".photo-upload-row")
        );

        rows.slice(1).forEach(row => row.remove());

        renumberPhotoInputs();
        updatePhotoButtons();
      }
    } catch (error) {
      console.error("Quote submission failed:", error);

      showStatus(
        error.message ||
          "Something went wrong. Please try again.",
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
