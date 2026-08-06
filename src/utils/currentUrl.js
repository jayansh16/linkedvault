// Get the current tab's URL.
// In Chrome extension: queries the active tab
// In web preview: falls back to window.location.href

function getChrome() {
  return window.chrome;
}

export async function getCurrentTabInfo() {
  const c = getChrome();
  if (c && c.tabs && c.tabs.query) {
    return new Promise((resolve) => {
      c.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs && tabs[0];
        resolve({
          url: tab ? tab.url || "" : "",
          title: tab ? tab.title || "" : "",
        });
      });
    });
  }
  // Fallback for web preview / dev
  return {
    url: window.location.href,
    title: document.title,
  };
}
