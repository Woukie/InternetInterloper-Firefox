export function positionElement(element, proportionX, positionY) {
  let xPos = (window.innerWidth - element.clientWidth) * proportionX;

  element.style.left = `${xPos}px`;
  element.style.top = `${positionY}px`;
}
