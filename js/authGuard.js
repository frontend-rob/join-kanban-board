/**
 * checks if a user is logged in. 
 * redirects to the index page if not found and prevents back navigation 
 * to restricted pages by managing the browser's history.
 * 
 * @constant {string|null} user - the username stored in localstorage, or null if not found.
 */
const user = localStorage.getItem('userName');

if (!user) {
    window.location.replace('../index.html');

    // prevent back navigation
    history.pushState(null, '', window.location.href);

     // block back navigation with a popstate event listener
    window.addEventListener('popstate', () => {
        history.pushState(null, '', window.location.href);
    });
}