
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".publication-entry__cite");

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const entry = button.closest(".publication-entry");
      const source = entry?.querySelector(".publication-entry__bibtex");

      if (!source) return;

      const bibtex = source.value.trim();
      const original = button.textContent.trim();

      try {
        await navigator.clipboard.writeText(bibtex);

        button.classList.add("is-copied");
        button.textContent = "Copied ✓";

        window.setTimeout(() => {
          button.textContent = original;
          button.classList.remove("is-copied");
        }, 1600);
      } catch (error) {
        console.error("Could not copy BibTeX:", error);
      }
    });
  });
});
