const css = document.createElement("link");
css.rel = "stylesheet";
css.href = browser.runtime.getURL("css/style.css");
document.head.appendChild(css);

let editorPosition = { x: 0, y: 0 };

let editor = null;
let editorSpan = null;
let editorSpanPlaceholder = null;

let placingEditor = false;

async function fetchNotes(callback) {
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
        }
        noteElement.note = note;
        noteElement.className = "interloper-note";
    
        const textElement = document.createElement("span");
        textElement.innerText = note.text;
    
        positionNoteElement(noteElement, note.x, note.y);
        
        document.body.appendChild(noteElement);
        noteElement.appendChild(textElement);
      });    
    })
    .catch((error) => {
      console.error("Error getting interloper notes: ", error);
    });
  };

fetchNotes();

function positionNoteElement(element, proportionX, positionY) {
  let xPos = (window.innerWidth - element.clientWidth) * proportionX;

  element.style.left = `${xPos}px`;
  element.style.top = `${positionY}px`;
}

// Move everyting when resizing
window.addEventListener('resize', () => {
  const noteElements = document.getElementsByClassName("interloper-note");
  for (let i = 0; i < noteElements.length; i++) {
    let element = noteElements[i];
    positionNoteElement(element, element.note.x, element.note.y);
  }

  if (editor) {
    positionNoteElement(editor, editorPosition.x, editorPosition.y);
  }
});

// Keep track of mouse position when selecting
document.addEventListener('mousemove', (event) => {
  if (placingEditor) {
    editorPosition = { x: event.clientX / window.innerWidth, y: event.clientY + window.scrollY };
    positionNoteElement(editor, editorPosition.x, editorPosition.y);
  }
});

function addNote() {
  if (!editor) {
    editor = document.createElement("div");
    editor.id = "interloper-note-editor";
    editor.className = "interloper-note-editor";

    editorSpan = document.createElement("span");
    editorSpan.className = "interloper-note-editor-span";
    editorSpan.contentEditable = "true"; 
    
    // Get rid of the ugly blue border when focused
    editorSpan.addEventListener('focus', () => {
      editorSpan.style.outline = "none";
    });

    editorSpanPlaceholder = document.createElement("span");
    editorSpanPlaceholder.className = "interloper-note-editor-span-placeholder";
    
    editorSpan.addEventListener('input', (e) => {
      const brs = editorSpan.querySelectorAll('br');
      brs.forEach(br => {
        if (br.parentNode === editorSpan && editorSpan.childNodes.length === 1) {
          br.remove();
        }
      });

      if (editorSpan.textContent !== "") {
        editorSpanPlaceholder.textContent = "";
      } else {
        editorSpanPlaceholder.textContent = "Your message to the world...";
      }

      positionNoteElement(editor, editorPosition.x, editorPosition.y);
    });
    
    editor.addEventListener('click', () => {
      editorSpan.focus();
    });

    // Close and save buttons
    const closeButton = document.createElement("button");
    closeButton.className = "interloper-note-editor-close";
    // Keep whitespace
    closeButton.style.whiteSpace = "pre";
    closeButton.textContent = "X ";
    closeButton.addEventListener('click', () => {
      editor.style.visibility = "hidden";
      placingEditor = false;
    });
    
    const saveButton = document.createElement("button");
    saveButton.className = "interloper-note-editor-save";
    saveButton.style.whiteSpace = "pre";
    saveButton.textContent = "Save ";
    saveButton.addEventListener('click', () => {
      if (editorSpan.textContent !== "") {
        fetch("http://localhost:3000/notes/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "url": window.location.href,
            "text": editorSpan.textContent,
            "x": editorPosition.x,
            "y": editorPosition.y,
          }),
        })
        .then(() => {
          editor.style.visibility = "hidden";
          
          const noteElements = document.getElementsByClassName("interloper-note");
          for (let i = 0; i < noteElements.length; i++) {
            noteElements[i].remove();
          }

          fetchNotes();
        })
        .catch((error) => {
          console.error("Error adding interloper note: ", error);
        });
      }
    });
    
    document.body.appendChild(editor);
    editor.appendChild(closeButton);
    editor.appendChild(saveButton);
    editor.appendChild(editorSpan);
    editor.appendChild(editorSpanPlaceholder);
  }
  
  editor.style.visibility = "visible";
  editorSpan.textContent = "";
  editorSpanPlaceholder.textContent = "Click to place...";
  positionNoteElement(editor, editorPosition.x, editorPosition.y);
  editor.style.visibility = "visible";
  placingEditor = true;
}

// Stop tracking after clicking
document.addEventListener('mousedown', (event) => {
  if (placingEditor) {
    event.preventDefault();
    placingEditor = false;
    editorSpanPlaceholder.textContent = "Your message to the world...";  }
});

// Reset on url changes, this method catches all cases but only updates every second
let currentUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;

    const noteElements = document.getElementsByClassName("interloper-note");
    for (let i = 0; i < noteElements.length; i++) {
      noteElements[i].remove();
    }

    fetchNotes();
  }
}, 1000);
