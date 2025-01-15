import { reloadNotes } from "./notes";
import { positionElement } from "./positioning";

let editorPosition = { x: 0, y: 0 };

let editorElement = null;
let editorInputElement = null;
let editorPlaceholderElement = null;

let placingEditor = false;

// Create editor element if it doesn't exist
export function getEditorElement() {
  if (editorElement) {
    return editorElement;
  }

  editorElement = document.createElement("div");
  editorElement.id = "interloper-editor";
  editorElement.className = "interloper-editor";

  editorInputElement = document.createElement("span");
  editorInputElement.className = ".interloper-editor-input";
  editorInputElement.contentEditable = "true"; 
  
  // Get rid of the ugly blue border when focused
  editorInputElement.addEventListener('focus', () => {
    editorInputElement.style.outline = "none";
  });

  editorPlaceholderElement = document.createElement("span");
  editorPlaceholderElement.className = "interloper-editor-placeholder";
  
  // Placeholder behavior when typing
  editorInputElement.addEventListener('input', (e) => {
    const brs = editorInputElement.querySelectorAll('br');
    brs.forEach(br => {
      if (br.parentNode === editorInputElement && editorInputElement.childNodes.length === 1) {
        br.remove();
      }
    });

    if (editorInputElement.outerText) {
      editorPlaceholderElement.textContent = "";
    } else {
      editorPlaceholderElement.textContent = "Your message to the world...";
    }

    updateEditorPosition();
  });
  
  editorElement.addEventListener('click', () => {
    editorInputElement.focus();
  });

  document.body.appendChild(editorElement);
  editorElement.appendChild(editorInputElement);
  editorElement.appendChild(editorPlaceholderElement);

  // Track mouse movement
  document.addEventListener('mousemove', (event) => {
    if (placingEditor) {
      editorPosition = { x: event.clientX / window.innerWidth, y: event.clientY + window.scrollY };
      updateEditorPosition();
    }
  });

  // Place on click
  document.addEventListener('mousedown', (event) => {
    if (placingEditor) {
      event.preventDefault();
      placingEditor = false;
      editorPlaceholderElement.textContent = "Your message to the world...";
      updateEditorPosition();
      editorInputElement.focus();
    }
  });

  // Close on escape
  document.addEventListener('keydown', (event) => {
    if (event.key === "Escape") {
      closeEditor();
    }
  });

  // Send on enter
  editorInputElement.addEventListener('keydown', (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      editorInputElement.blur();
      closeEditor();
      reloadNotes();
    }
  });
}

export function updateEditorPosition() {
  if (editorElement) {
    positionElement(editorElement, editorPosition.x, editorPosition.y);
  }
}

export function enterPlacementMode() {
  getEditorElement();
  editorElement.style.visibility = "visible";
  editorInputElement.textContent = "";
  editorPlaceholderElement.textContent = "Click to place...";
  updateEditorPosition();
  placingEditor = true;
}

export function closeEditor() {
  placingEditor = false;
  editorElement.style.visibility = "hidden";
}