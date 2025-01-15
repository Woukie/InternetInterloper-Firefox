import { positionElement } from "./positioning";

// Load notes from the server and clear existing notes
export async function reloadNotes() {
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
export function updateNotePositions() {
  const noteElements = document.getElementsByClassName("interloper-note");
  for (let i = 0; i < noteElements.length; i++) {
    let noteElement = noteElements[i];
    positionElement(noteElement, noteElement.note.x, noteElement.note.y);
  }
}
