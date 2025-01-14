function onCreated() {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  } else {
    console.log("Item created successfully");
  }
}

browser.menus.create({
  id: "add-note",
  title: "Add Note",
  contexts: ["all"]
}, onCreated);

browser.menus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case "add-note":
      browser.tabs.executeScript({
        code: "addNote();",
      });
      break;
  }
});
