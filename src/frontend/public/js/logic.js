// Sotrable
const { Sortable } = require("@shopify/draggable");

const sortable = new Sortable(document.querySelectorAll(".container"), {
    draggable: ".cam",
    delay: { mouse: 150 }
});

/* sortable.on("sortable:sort", () => console.log("sortable:sort"));
sortable.on("sortable:start", () => console.log("sortable:sort"));
sortable.on("drag:pressure", () => console.log("drag:pressure"));
sortable.on("drag:over", () => console.log("drag:over")); */
sortable.on("drag:start", (e) => {
    console.log("drag:start", e.source);
});

// Remove demo window
setTimeout(() => {
    const demo = document.querySelector(".demo");
    if (demo) {
        demo.remove();
        console.log("remove");
    }
}, 6000);

// Debug Logic (нужно раскомментировать debug purpose в html файле)
const vcMenu = require("./incude/menu");
const { getRandomArbitrary } = require("@raz1el/util");

const teams = [document.querySelector(".team-a"), document.querySelector(".team-b")];
const borders = ["border-a", "border-b"];
const a = document.querySelector(".button-a");
const b = document.querySelector(".button-b");
let count = 0;

if (a)
    a.addEventListener("click", () => {
        create("debug-a");
    });

if (b)
    b.addEventListener("click", () => {
        create("debug-b");
    });

function create(className) {
    if (count >= 12) {
        window.alert("Достигнут лимит камер 12/12");
        return;
    }
    count++;
    const index = count % 2;
    const div = document.createElement("div");
    div.classList.add("cam", className, borders[index], "debug");
    div.innerHTML = "Удерживайте левую кнопку мыши, чтобы переместить окно<br><br>Нажмите правую кнопку мыши, чтобы открыть меню команд";
    div.style.backgroundColor = `rgb(${getRandomArbitrary(0, 255)},${getRandomArbitrary(0, 255)},${getRandomArbitrary(0, 255)})`;
    vcMenu(div);

    const btn = document.createElement("div");
    btn.classList.add("close");
    btn.textContent = "Наведите курсор, чтобы закрыть";
    addCloseListener(btn);

    const span = document.createElement("span");
    span.classList.add("nickname");
    span.setAttribute("role", "textbox");
    span.setAttribute("contenteditable", "true");
    span.textContent = "Введите ник";

    div.append(span);
    div.append(btn);
    teams[index].append(div);
}

function addCloseListener(element) {
    element.addEventListener("click", () => {
        console.log("click");
        // remove(element);
    });
    element.addEventListener("mouseover", () => {
        console.log("mouseover");
        element.timeout = setTimeout(() => {
            remove(element);
        }, 1000);
    });
    element.addEventListener("mouseout", () => {
        console.log("mouseout");
        if (element.timeout)
            clearTimeout(element.timeout);
    });
}

function remove(element) {
    count--;
    element.parentElement.remove();
}

/* eslint-disable */
document.querySelectorAll(".close").forEach(addCloseListener);
document.querySelectorAll(".cam").forEach(vcMenu);
/* eslint-enable */