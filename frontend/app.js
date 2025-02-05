import { initialData } from "./initialData.js";

const dataKey = "CapturedPalz";
const apiUrl = "/api";
// const apiUrl = "http://localhost:3000";

async function getPals(limit=300) {
    try {
        const response = await fetch(
            `${apiUrl}?limit=${limit}`,
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
function getImageById(palId) {
    return `../public/images/paldeck/${palId}.png`;
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
        const initialDataToStore = initialData.map(name => ({name}));
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
const showCapturedCheckbox = document.getElementById("captured");

document.addEventListener("DOMContentLoaded", renderTodos);

async function renderTodos() {
    console.log("render todos enter");
    const showCapturedFilter = showCapturedCheckbox.checked;
    const activeTodos = todosData;
    const searchTerm = searchInput.value.toLowerCase();

    const selectedElements = Array.from(document.querySelectorAll('input[name="element"]:checked'))
        .map(checkbox => checkbox.value.toLowerCase());
    
    const pals = await getPals();

    activeList.innerHTML = "";

    // element filter
    var palPedia = pals.filter (pal =>  
        (selectedElements.length === 0 || pal.types.some(type => selectedElements.includes(type.name.toLowerCase())))
    );

    // sor by key
    palPedia.sort((a, b) => a.key.localeCompare(b.key));

    // show captured filter
    palPedia = showCapturedFilter ? palPedia
        : palPedia.filter(pal => activeTodos.some(a => a.name.toLowerCase() === pal.name.toLowerCase()));

    // search filter
    palPedia = palPedia.filter(pal => pal.name.toLowerCase().includes(searchTerm));

    // Render
    palPedia.forEach((pal, index) => {
        const li = document.createElement("li");
        const isCaptured = !activeTodos.some(a => a.name.toLowerCase() === pal.name.toLowerCase());
        li.className = `${isCaptured ? "" : "bg-gray-50"} flex items-center justify-between border border-gray-200 rounded-md p-2 gap-12`;
        
        const indexer = document.createElement("div");
        indexer.className ="flex items-center"
        addNumber();
        addImage();
        li.appendChild(indexer);
        addContent();
        addDeleteButton();

        activeList.appendChild(li);

        function addImage() {
            const img = document.createElement("img");
            img.src = getImageById(pal.key);
            img.className = "h-16 md:h-24 mr-2 cursor-pointer";
            img.dataset.key = pal.key
            indexer.appendChild(img);
        }

        function addNumber() {
            const span = document.createElement("span");
            span.className = "flex w-12 mr-2 left justify-around";
            span.innerText = pal.key
            indexer.appendChild(span);
        }

        function addContent() {
            const div = document.createElement("div");
            div.className = "flex flex-col"
            const textDiv = document.createElement("div");
            textDiv.className = "flex justify-center text-center text-gray-800";
            const a = document.createElement("a");
            a.href = pal.wiki;
            a.target = '_blank';
            a.textContent = pal.name;
            a.title = "Wiki";
            textDiv.appendChild(a);
            div.appendChild(textDiv);

            // Elements
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
            const container = document.createElement('div');
            container.className = "toggle-container flex";
            const toggleHTML = `
                <label class="flex-col justify-around cursor-pointer">
                    <input type="checkbox" value="" class="sr-only peer" ${isCaptured ? 'checked' : ''}>
                    <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                    <span class="text-sm text-gray-900 dark:text-gray-300 w-16 inline-block">${isCaptured ? "Captured" : ""}</span>
                </label>
            `;
            container.innerHTML = toggleHTML;
            const checkbox = container.querySelector("input[type='checkbox']");

            checkbox.addEventListener("change", () => {
                if (!checkbox.checked) {
                    todosData.push({ name: pal.name });
                } else {
                    const index = todosData.findIndex(item => item.name === pal.name);
                    if (index > -1) {
                        todosData.splice(index, 1);
                    }
                }
                
                setTimeout(() => {
                    storeData(todosData);
                    renderTodos();
                }, 150);
            });
            
            li.appendChild(container);

        }
    });

    removedList.innerHTML = "";
    activeTodos.forEach(todo => {
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

showCapturedCheckbox.addEventListener('click', () => renderTodos());

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
        modalImage.src = `../public/images/maps/${palId}.png`;
        document.getElementById("pal-modal").classList.remove("hidden");
    }
});

document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("pal-modal").classList.add("hidden");
});

document.getElementById("pal-modal").addEventListener("click", (event) => {
    if (event.target === document.getElementById("pal-modal")) {
        document.getElementById("pal-modal").classList.add("hidden");
    }
});