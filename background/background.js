import { getAccount } from './account.js';

getAccount();

// Add note in right-click menu
browser.menus.create({
  id: "add-note",
  title: "Add Note",
  contexts: ["all"]
});

browser.menus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case "add-note":
      browser.tabs.executeScript({
        code: "addNote();",
      });
      break;
  }
});
