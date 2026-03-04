document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // 1. Remove 'active' class from all buttons and content sections
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // 2. Add 'active' class to the clicked button
      button.classList.add("active");

      // 3. Find the matching content section using the data-target attribute and show it
      const targetId = button.getAttribute("data-target");
      document.getElementById(targetId).classList.add("active");
    });
  });

  // Form Submission Logic (from earlier)
  const profileForm = document.getElementById("editProfileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", function (e) {
      e.preventDefault();
      // Grab inputs
      const updatedUsername = document.getElementById("usernameInput").value;
      // Update UI immediately (Optimistic UI update)
      document.getElementById("displayUsername").textContent = updatedUsername;

      alert("Profile staged for Firebase update!");
    });
  }
  

  // --- AVATAR CUSTOMIZER LOGIC ---
  const headerAvatarBg = document.getElementById("mainHeaderAvatar");
  const headerAvatarFace = document.getElementById("mainHeaderFace");
  const previewBg = document.getElementById("layer-bg");
  const previewFace = document.getElementById("layer-face");

  // 1. Change Background Color
  document.querySelectorAll(".color-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const newColor = this.getAttribute("data-val");
      // Update customizer box
      previewBg.style.backgroundColor = newColor;
      // Update header avatar instantly
      headerAvatarBg.style.backgroundColor = newColor;
    });
  });

  // 2. Change Emoji Expression
  document.querySelectorAll(".asset-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const newEmoji = this.textContent; // Grabs the emoji from the button
      // Update customizer box
      previewFace.textContent = newEmoji;
      // Update header avatar instantly
      headerAvatarFace.textContent = newEmoji;

      // Add a quick visual "pop" animation to the preview box
      const previewBox = document.getElementById("avatarPreviewBox");
      previewBox.style.transform = "scale(1.05)";
      setTimeout(() => {
        previewBox.style.transform = "scale(1)";
      }, 150);
    });
  });
});
