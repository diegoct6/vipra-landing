(function () {
  const field = document.getElementById("demoField");
  const review = document.getElementById("demoReview");
  const capsule = document.getElementById("demoCapsule");
  const phase = document.getElementById("demoPhase");
  const protect = document.getElementById("demoProtect");
  const clearLine = document.getElementById("demoClear");
  const live = document.getElementById("demoLive");
  if (!field || !review || !capsule || !phase || !protect || !clearLine || !live) return;

  const parts = [
    { kind: "text", value: "Can you email " },
    { kind: "hit", value: "Diego Cuartas", token: "[PERSON_1]" },
    { kind: "text", value: " at " },
    { kind: "hit", value: "diego@example.com", token: "[EMAIL_1]" },
    { kind: "text", value: " or call " },
    { kind: "hit", value: "+34 600 000 000", token: "[PHONE_1]" },
    { kind: "text", value: " about Thursday?" }
  ];

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

  function showFound(found) {
    capsule.hidden = !found;
    review.classList.toggle("is-waiting", !found);
    clearLine.hidden = true;
    protect.classList.remove("is-pressed");
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    render("wash");
    showFound(true);
    setPhase("Found 3", true);
    return;
  }

  let announced = false;
  function say(message) {
    if (announced) return;
    live.textContent = message;
    if (message.indexOf("Protected") === 0) announced = true;
  }

  async function playOnce() {
    field.replaceChildren();
    showFound(false);
    setPhase("Before you send", false);

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
    setPhase("Found 3", true);
    say("Found a name, an email, and a phone number.");
    await sleep(1500);

    nodes.forEach((node, index) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      node.textContent = parts[index].token;
      node.classList.remove("wash");
      node.classList.add("tok");
    });
    protect.classList.add("is-pressed");
    clearLine.hidden = false;
    setPhase("Protected", true);
    say("Protected. Swapped for [PERSON_1], [EMAIL_1], and [PHONE_1] before send.");
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
