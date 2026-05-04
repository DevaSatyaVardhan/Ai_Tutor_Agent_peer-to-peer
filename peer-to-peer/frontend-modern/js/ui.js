// Shared UI helpers for frontend-modern (no-build)

(function () {
  const BRAND_GRADIENT = "from-indigo-500 to-purple-500";

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }

  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = String(text ?? "");
    return div.innerHTML;
  }

  function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  function formatTime(date = new Date()) {
    try {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }

  function attachPageFadeIn() {
    document.documentElement.classList.add("scroll-smooth");
    document.body.classList.add("edtech-fade-in");
  }

  function toast(message, type = "info") {
    const color =
      type === "success"
        ? "bg-emerald-600"
        : type === "warning"
        ? "bg-amber-600"
        : type === "error"
        ? "bg-rose-600"
        : `bg-gradient-to-r ${BRAND_GRADIENT}`;

    const el = document.createElement("div");
    el.className = `fixed right-4 top-4 z-[9999] ${color} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 max-w-[92vw]`;
    el.innerHTML = `<span class="text-sm font-semibold">${escapeHtml(message)}</span>`;
    document.body.appendChild(el);

    setTimeout(() => {
      el.style.transition = "opacity 140ms ease, transform 140ms ease";
      el.style.opacity = "0";
      el.style.transform = "translateY(-6px)";
      setTimeout(() => el.remove(), 180);
    }, 3600);
  }

  function animateCounter(el, toValue, durationMs = 900) {
    if (!el) return;
    const startValue = 0;
    const endValue = Number(toValue) || 0;
    const start = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(startValue + (endValue - startValue) * eased);
      el.textContent = String(current);
      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  // Expose minimal API
  window.EdTechUI = {
    qs,
    qsa,
    escapeHtml,
    formatDate,
    formatTime,
    attachPageFadeIn,
    toast,
    animateCounter,
  };
})();
