
/**
 * loads html content into elements with the 'include-html' attribute.
 * replaces the element's inner html with the fetched file content, or shows 'page not found' if the fetch fails.
 * 
 * @async
 * @function
 * @returns {Promise<void>} - returns a promise that resolves when all HTML includes are loaded.
 */
async function includeHTML() {
    let includeElements = document.querySelectorAll('[include-html]');

    let promises = Array.from(includeElements).map(async (element) => {
        const file = element.getAttribute("include-html");
        let resp = await fetch(file);
        if (resp.ok) {
            element.innerHTML = await resp.text();
        } else {
            element.innerHTML = 'page not found';
        }
    });

    await Promise.all(promises);
}