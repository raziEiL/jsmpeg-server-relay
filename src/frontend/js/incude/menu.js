// Context menu
const menu = document.querySelector(".menu");
const opt0 = document.querySelector(".menu--opt-0");
const opt1 = document.querySelector(".menu--opt-1");
const opt2 = document.querySelector(".menu--opt-2");
const borderClasses = ["border-a", "border-b", "border-c"];
const opts = [opt0, opt1, opt2];

for (const [i, e] of opts.entries()) {
    e.addEventListener("click", () => {
        console.log("click menu", i);
        if (e.menuParent) {
            e.menuParent.classList.remove(...borderClasses);
            e.menuParent.classList.add(borderClasses[i]);
        }
    });
}

//exit the context menu
window.addEventListener("click", () => {
    if (menu.style.display === "block") {
        menu.style.display = "none";
        console.log("menu hide");
    }
});

module.exports = function addMenuListener(element) {
    element.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        console.log("menu show");
        // Show the context menu
        menu.style.display = "block";

        // set position X of the menu
        if ((window.innerWidth - e.clientX) > menu.offsetWidth + 10) {
            menu.style.left = e.clientX + "px";
        }
        else {
            menu.style.left = (e.clientX - menu.offsetWidth) + "px";
        }
        // set position Y of the menu
        if ((window.innerHeight - e.clientY) > menu.offsetHeight + 10) {
            menu.style.top = e.clientY + "px";
        }
        else {
            menu.style.top = (e.clientY - menu.offsetHeight) + "px";
        }

        for (const e of opts) e.menuParent = element;
    });
};
