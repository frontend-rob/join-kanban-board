/**
 * checks for a user in localStorage. 
 * redirects to the index page if not found,
 * and prevents back navigation to restricted pages.
 */
const user = localStorage.getItem('userName');

if (!user) {
    window.location.replace('../index.html');

    // prevent back navigation
    history.pushState(null, '', window.location.href);

    /**
     * event listener for the popstate event to block back navigation.
     */
    window.addEventListener('popstate', () => {
        history.pushState(null, '', window.location.href);
    });
}
