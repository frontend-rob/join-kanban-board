fetch("./templates/sidebar.html")
  .then((response) => response.text())
  .then((data) => {
    document.querySelector("nav").innerHTML = data;
  });

fetch("./templates/header.html")
  .then((response) => response.text())
  .then((data) => {
    document.querySelector("header").innerHTML = data;
  });
