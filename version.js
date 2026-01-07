function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hashText(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return toHex(hash);
}

async function computeVersion() {
  const files = [
    "app.js",
    "styles.css",
    "phrases.js",
    "stickers.js",
    "index.html",
  ];
  const contents = await Promise.all(
    files.map((file) =>
      fetch(file, { cache: "no-store" })
        .then((res) => (res.ok ? res.text() : ""))
        .catch(() => "")
    )
  );
  const combined = contents.join("|");
  if (!combined.trim()) {
    return `dev-${document.lastModified || "unknown"}`;
  }
  const hash = await hashText(combined);
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}-${hash.slice(0, 6)}`;
}

window.APP_VERSION = "dev";
computeVersion()
  .then((version) => {
    window.APP_VERSION = version;
    window.dispatchEvent(new CustomEvent("app-version", { detail: version }));
  })
  .catch(() => {
    const lastModified = document.lastModified || "unknown";
    window.APP_VERSION = `dev-${lastModified}`;
    window.dispatchEvent(
      new CustomEvent("app-version", { detail: window.APP_VERSION })
    );
  });
