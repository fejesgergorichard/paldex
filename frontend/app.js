import { initialData } from "./initialData.js";

const dataKey = "dddd";
const apiUrl = "http://192.168.0.229:3000"

async function getPals() {
    try {
        const response = await fetch(
            `${apiUrl}?limit=200`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            }
        );

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.content;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

function getImage(imagePath) {
    return `../${imagePath}`;
}

function storeData(data) {
    localStorage.setItem(dataKey, JSON.stringify(data));
}

function loadData() {
    const stored = localStorage.getItem(dataKey);
    if (stored) {
        return JSON.parse(stored);
    } else {
        // Initialize with default values if nothing is stored
        const initialDataToStore = initialData.map(name => ({
            name,
            isDone: false
        }));
        storeData(initialDataToStore);
        return initialDataToStore;
    }
}

let todosData = loadData();
const searchInput = document.getElementById("searchInput");
const newTodoInput = document.getElementById("newTodoInput");
const addButton = document.getElementById("addButton");
const activeList = document.getElementById("activeList");
const removedList = document.getElementById("removedList");

function renderTodos() {
    const removedTodos = todosData.filter(todo => todo.isDone);
    const searchTerm = searchInput.value.toLowerCase();
    const activeTodos = todosData.filter(
        todo => !todo.isDone && todo.name.toLowerCase().includes(searchTerm)
    );
    const selectedElements = Array.from(document.querySelectorAll('input[name="element"]:checked'))
        .map(checkbox => checkbox.value.toLowerCase());

    getPals().then(pals => {
        activeList.innerHTML = "";

        const palPedia = pals.filter(pal =>
            // Name filtering
            activeTodos.some(a => a.name.toLowerCase() === pal.name.toLowerCase()) &&
            // Element type filtering
            (selectedElements.length === 0 || pal.types.some(type => selectedElements.includes(type.name.toLowerCase())))
        );

        console.log("kugi");

        // Render active todos
        palPedia.forEach((pal, index) => {
            const li = document.createElement("li");
            li.className = "flex items-center justify-between border border-gray-200 rounded-md p-2";

            addImage();
            addContent();
            addDeleteButton();

            activeList.appendChild(li);

            function addImage() {
                const img = document.createElement("img");
                img.src = getImage(pal.image);
                img.className = "h-24 mr-2 cursor-pointer";
                img.dataset.key = pal.key
                li.appendChild(img);
            }

            function addContent() {
                const div = document.createElement("div");
                div.className = "flex flex-col"
                const textDiv = document.createElement("div");
                textDiv.className = "flex justify-center text-gray-800";
                const a = document.createElement("a");
                a.href = pal.wiki;
                a.target = '_blank';
                a.textContent = pal.name;
                a.title = "Wiki";
                textDiv.appendChild(a);
                div.appendChild(textDiv);


                const elementsDiv = document.createElement("div");
                elementsDiv.className = "flex justify-around";
                pal.types.forEach(element => {
                    const elementImg = document.createElement("img");
                    elementImg.src = getImage(element.image);
                    elementImg.className = "h-8";
                    elementsDiv.appendChild(elementImg);
                })
                div.appendChild(elementsDiv);

                li.appendChild(div);
            }

            function addDeleteButton() {
                const delButton = document.createElement("button");
                delButton.className = "text-red-500 hover:text-red-700 focus:outline-none";
                delButton.textContent = "Delete";

                delButton.addEventListener("click", () => {
                    const target = todosData.find(item => item.name === pal.name && !item.isDone);
                    if (target) {
                        target.isDone = true;
                        storeData(todosData);
                        renderTodos();
                    }
                });

                li.appendChild(delButton);
            }
        });
    });

    removedList.innerHTML = "";
    removedTodos.forEach(todo => {
        const li = document.createElement("li");
        li.className = "border border-gray-200 rounded-md p-2 text-gray-500";
        li.textContent = todo.name;
        removedList.appendChild(li);
    });
}

addButton.addEventListener("click", () => {
    const value = newTodoInput.value.trim();
    if (value !== "") {
        todosData.push({
            name: value,
            isDone: false
        });
        newTodoInput.value = "";
        storeData(todosData);
        renderTodos();
    }
});

searchInput.addEventListener("input", renderTodos);

document.addEventListener("DOMContentLoaded", renderTodos);
document.getElementById('element-filters').addEventListener('click', (event) => {
    const wrapper = event.target.closest('.element-wrapper'); // Find the nearest wrapper div

    if (wrapper) {
        const checkbox = wrapper.querySelector('input[type="checkbox"]');

        if (checkbox) {
            checkbox.checked = !checkbox.checked;

            const img = wrapper.querySelector('.element-icon');
            if (img) {
                img.classList.toggle('opacity-25', !checkbox.checked);
                img.classList.toggle('opacity-100', checkbox.checked);
            }

            renderTodos();
        }
    }
});

document.getElementById("activeList").addEventListener("click", (event) => {
    const img = event.target.closest("img");
    if (img && img.dataset.key) {
        const palId = img.dataset.key; 
        const modalImage = document.getElementById("modal-image");
        modalImage.src = `../public/images/maps/${palId}-day.png`;

        // Show the modal
        document.getElementById("pal-modal").classList.remove("hidden");
    }
});

// Close Modal on Button Click
document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("pal-modal").classList.add("hidden");
});

// Close Modal on Click Outside
document.getElementById("pal-modal").addEventListener("click", (event) => {
    if (event.target === document.getElementById("pal-modal")) {
        document.getElementById("pal-modal").classList.add("hidden");
    }
});