function positionElement(element, proportionX, positionY) {
  let xPos = (window.innerWidth - element.clientWidth) * proportionX;

  element.style.left = `${xPos}px`;
  element.style.top = `${positionY}px`;
}

// Load notes from the server and clear existing notes
async function reloadNotes() {
  await fetch("http://localhost:3000/notes/get", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ "url": window.location.href }),
  })
  .then((response) => response.json())
  .then((data) => {
      JSON.parse(data).forEach((note) => {
        const noteElement = document.createElement("div");
        noteElement.onclick = () => {
          noteElement.remove();
        };
        noteElement.note = note;
        noteElement.className = "interloper-note";
        document.getElementById("interloper-note-" + note.id)?.remove();
        noteElement.id = "interloper-note-" + note.id;
        noteElement.title = note.user.username + "#" + note.user.id + " at " + new Date(note.createdAt).toLocaleString();
    
        const textElement = document.createElement("span");
        textElement.innerText = note.text;
    
        positionElement(noteElement, note.x, note.y);
        
        document.body.appendChild(noteElement);
        noteElement.appendChild(textElement);
      });    
    })
    .catch((error) => {
      console.error("Error getting interloper notes: ", error);
    });
}

// Reposition all notes
function updateNotePositions() {
  const noteElements = document.getElementsByClassName("interloper-note");
  for (let i = 0; i < noteElements.length; i++) {
    let noteElement = noteElements[i];
    positionElement(noteElement, noteElement.note.x, noteElement.note.y);
  }
}

let editorPosition = { x: 0, y: 0 };

let editorElement = null;
let editorInputElement = null;
let editorPlaceholderElement = null;

let placingEditor = false;

// Create editor element if it doesn't exist
function getEditorElement() {
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

function updateEditorPosition() {
  if (editorElement) {
    positionElement(editorElement, editorPosition.x, editorPosition.y);
  }
}

function enterPlacementMode() {
  getEditorElement();
  editorElement.style.visibility = "visible";
  editorInputElement.textContent = "";
  editorPlaceholderElement.textContent = "Click to place...";
  updateEditorPosition();
  placingEditor = true;
}

function closeEditor() {
  placingEditor = false;
  editorElement.style.visibility = "hidden";
}

function injectCSS() {
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = browser.runtime.getURL("css/style.css");
  document.head.appendChild(css);
}

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
