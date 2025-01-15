export default function injectCSS() {
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = browser.runtime.getURL("css/style.css");
  document.head.appendChild(css);
}