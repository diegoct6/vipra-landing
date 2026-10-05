// Every install button reads this one value. It points at #pricing until the
// Chrome Web Store listing exists. An absolute URL is copied onto each
// [data-install] link as-is. A hash is prefixed with data-install-home on
// inner pages so they still reach pricing.
var VIPRA_INSTALL_URL = "#pricing";

document.querySelectorAll("[data-install]").forEach(function (node) {
  var url = VIPRA_INSTALL_URL;
  if (url.charAt(0) === "#") {
    var home = node.getAttribute("data-install-home");
    if (home) url = home + url;
  }
  node.href = url;
});

(function () {
  const field = document.getElementById("demoField");
  const review = document.getElementById("demoReview");
  const capsule = document.getElementById("demoCapsule");
  const phase = document.getElementById("demoPhase");
  const protect = document.getElementById("demoProtect");
  const clearLine = document.getElementById("demoClear");
  const live = document.getElementById("demoLive");
  const configEl = document.getElementById("demoConfig");
  if (!field || !review || !capsule || !phase || !protect || !clearLine || !live || !configEl) return;

  let config;
  try {
    config = JSON.parse(configEl.textContent);
  } catch (err) {
    return;
  }
  const parts = config.parts;
  if (!Array.isArray(parts) || !parts.length) return;

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function setPhase(label, on) {
    phase.textContent = label;
    phase.classList.toggle("is-on", !!on);
  }

  function render(mode) {
    field.replaceChildren();
    parts.forEach((part) => {
      if (part.kind === "text") {
        field.append(document.createTextNode(part.value));
        return;
      }
      const span = document.createElement("span");
      span.className = "hit";
      if (mode === "wash") span.classList.add("wash");
      if (mode === "tokens") span.classList.add("tok");
      span.textContent = mode === "tokens" ? part.token : part.value;
      field.append(span);
    });
  }

  function setClear(visible) {
    clearLine.classList.toggle("is-visible", !!visible);
  }

  function showFound(found) {
    capsule.hidden = !found;
    review.classList.toggle("is-waiting", !found);
    setClear(false);
    protect.classList.remove("is-pressed");
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    render("wash");
    showFound(true);
    setPhase(config.phaseFound, true);
    return;
  }

  let announced = false;
  function say(message, lock) {
    if (announced) return;
    live.textContent = message;
    if (lock) announced = true;
  }

  async function playOnce() {
    field.replaceChildren();
    showFound(false);
    setPhase(config.phaseBefore, false);

    const nodes = parts.map((part) => {
      if (part.kind === "text") {
        const node = document.createTextNode("");
        field.append(node);
        return node;
      }
      const span = document.createElement("span");
      span.className = "hit";
      field.append(span);
      return span;
    });
    const caret = document.createElement("span");
    caret.className = "caret";
    caret.setAttribute("aria-hidden", "true");
    field.append(caret);

    const chars = [];
    parts.forEach((part, index) => {
      for (const ch of part.value) chars.push({ index, ch });
    });
    for (let i = 0; i < chars.length; i++) {
      const item = chars[i];
      const node = nodes[item.index];
      node.textContent += item.ch;
      await sleep(22);
    }
    caret.remove();
    await sleep(320);

    nodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) node.classList.add("wash");
    });
    showFound(true);
    setPhase(config.phaseFound, true);
    say(config.liveFound, false);
    await sleep(1500);

    nodes.forEach((node, index) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      node.textContent = parts[index].token;
      node.classList.remove("wash");
      node.classList.add("tok");
    });
    protect.classList.add("is-pressed");
    setClear(true);
    setPhase(config.phaseProtected, true);
    say(config.liveProtected, true);
    await sleep(2300);

    field.style.opacity = "0";
    await sleep(280);
    field.style.opacity = "";
  }

  async function loop() {
    while (true) await playOnce();
  }

  loop();
})();
