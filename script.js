async function includeHTML() {
  let includeElements = document.querySelectorAll('[include-html]');
  for (let i = 0; i < includeElements.length; i++) {
      const element = includeElements[i];
      const file = element.getAttribute("include-html");
      let resp = await fetch(file);
      if (resp.ok) {
          element.innerHTML = await resp.text();
      } else {
          element.innerHTML = 'page not found';
      }
  }
}