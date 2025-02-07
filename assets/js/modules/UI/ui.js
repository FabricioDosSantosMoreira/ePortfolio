/**
 * @fileoverview 'ui.js' is responsible for changing styles in a page
 * @author Fabricio dos Santos Moreira <dev.fabriciodossantosmoreira@gmail.com>
 * @version 1.0.0
*/


document.addEventListener("DOMContentLoaded", function () {
    
    // Activate a line under the current header item
    // NOTE: I know this is kinda messy, but works for now.
    // I had to do this because of html's folder structure.
    const menuItems = document.querySelectorAll(".header__menu-item");

    let currentPage = window.location.pathname.split('/')[length - 1];
    if (currentPage === undefined) {
        currentPage = '.';
    }

    menuItems.forEach(item => {
        let itemPath = item.getAttribute("href").split('/');
        let itemLength = itemPath.length;

        if (itemPath[itemLength - 2] === currentPage) {
            item.classList.add("active");
        }
    });
});