export function createElement(tag, options = {}) {
    const element = document.createElement(tag);
    
    // Set properties
    Object.keys(options).forEach(key => {
      if (key === 'textContent') {
        element.textContent = options[key];
      } else if (key === 'innerHTML') {
        element.innerHTML = options[key];
      } else if (key === 'className') {
        element.className = options[key];
      } else if (key === 'id') {
        element.id = options[key];
      } else {
        element.setAttribute(key, options[key]);
      }
    });
    
    return element;
  }
  
  export function clearElement(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
  
  export function appendChildren(parent, children) {
    children.forEach(child => parent.appendChild(child));
  }