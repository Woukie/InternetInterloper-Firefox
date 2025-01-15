import { enterPlacementMode, updateEditorPosition } from "./editor";
import { reloadNotes, updateNotePositions } from "./notes";
import injectCSS from "./injectCSS";

// Init
injectCSS();
reloadNotes();

// Move notes and editor when resizing
window.addEventListener('resize', () => {
  updateNotePositions();
  updateEditorPosition();
});

// Triggered by background
function addNote() {
  enterPlacementMode();
}
