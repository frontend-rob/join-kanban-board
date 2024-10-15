document.addEventListener("DOMContentLoaded", function() {
    var includes = document.querySelectorAll('[include-html]');
    includes.forEach(function(include) {
        var file = include.getAttribute('include-html');
        fetch(file)
            .then(response => response.text())
            .then(data => {
                include.innerHTML = data;
                include.removeAttribute('include-html');
            })
            .catch(error => console.error('Error loading include-html:', error));
    });
});
