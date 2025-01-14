const css = document.createElement("link");
css.rel = "stylesheet";
css.href = browser.runtime.getURL("css/style.css");
document.head.appendChild(css);

let noteEditorProportion = { x: 0, y: 0 };

let noteEditor = null;
let noteEditorSpan = null;
let noteEditorSpanPlaceholder = null;

let movingNoteEditor = false;

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
    
        const textElement = document.createElement("p");
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

function positionNoteElement(element, proportionX, proportionY) {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  let xPos = screenWidth * proportionX;
  let yPos = screenHeight * proportionY;

  xPos -= element.clientWidth * proportionX;
  yPos -= element.clientHeight * proportionY;

  element.style.left = `${xPos}px`;
  element.style.top = `${yPos}px`;
}

// Move everyting when resizing
window.addEventListener('resize', () => {
  const noteElements = document.getElementsByClassName("interloper-note");
  for (let i = 0; i < noteElements.length; i++) {
    let element = noteElements[i];
    positionNoteElement(element, element.note.x, element.note.y);
  }

  if (noteEditor) {
    positionNoteElement(noteEditor, noteEditorProportion.x, noteEditorProportion.y);
  }
});

// Keep track of mouse position when selecting
document.addEventListener('mousemove', (event) => {
  if (movingNoteEditor) {
    noteEditorProportion = { x: event.clientX / window.innerWidth, y: event.clientY / window.innerHeight };
    positionNoteElement(noteEditor, noteEditorProportion.x, noteEditorProportion.y);
  }
});

function addNote() {
  if (!noteEditor) {
    noteEditor = document.createElement("div");
    noteEditor.id = "interloper-note-editor";
    noteEditor.className = "interloper-note-editor";

    noteEditorSpan = document.createElement("span");
    noteEditorSpan.className = "interloper-note-editor-span";
    noteEditorSpan.contentEditable = "true"; 
    noteEditorSpan.style.whiteSpace = "normal";
    
    // Get rid of the ugly blue border when focused
    noteEditorSpan.addEventListener('focus', () => {
      noteEditorSpan.style.outline = "none";
    });

    noteEditorSpanPlaceholder = document.createElement("span");
    noteEditorSpanPlaceholder.className = "interloper-note-editor-span-placeholder";
    
    noteEditorSpan.addEventListener('input', (e) => {
      const brs = noteEditorSpan.querySelectorAll('br');
      brs.forEach(br => {
        if (br.parentNode === noteEditorSpan && noteEditorSpan.childNodes.length === 1) {
          br.remove();
        }
      });

      if (noteEditorSpan.textContent !== "") {
        noteEditorSpanPlaceholder.textContent = "";
      } else {
        noteEditorSpanPlaceholder.textContent = "Your message to the world...";
      }

      positionNoteElement(noteEditor, noteEditorProportion.x, noteEditorProportion.y);
    });
    
    noteEditor.addEventListener('click', () => {
      noteEditorSpan.focus();
    });
    
    document.body.appendChild(noteEditor);
    noteEditor.appendChild(noteEditorSpan);
    noteEditor.appendChild(noteEditorSpanPlaceholder);
  }
  
  noteEditorSpan.textContent = "";
  noteEditorSpanPlaceholder.textContent = "Click to place...";
  positionNoteElement(noteEditor, noteEditorProportion.x, noteEditorProportion.y);
  noteEditor.style.visibility = "visible";
  movingNoteEditor = true;
}

// Stop tracking after clicking
document.addEventListener('mousedown', (event) => {
  if (movingNoteEditor) {
    event.preventDefault();
    movingNoteEditor = false;
    noteEditorSpanPlaceholder.textContent = "Your message to the world...";  }
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
