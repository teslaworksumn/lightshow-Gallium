
/* Sets up Gallium's global settings for the current page.
 * index.html has galliumGlobals defined. We might be in an iframe.
 * So, we find galliumGlobals in our parent and set it for the current window
*/
if (window.parent !== null && window.parent !== 'undefined') {
    const parent = window.parent;
    if (parent.galliumGlobals !== null && parent.galliumGlobals !== 'undefined') {
        window.galliumGlobals = parent.galliumGlobals;
    }
}
