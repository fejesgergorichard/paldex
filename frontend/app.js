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

function toHumanReadable(str) {
    return str
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function storeData(data) {
    localStorage.setItem(dataKey, JSON.stringify(data));
}

function loadData() {
    const stored = localStorage.getItem(dataKey);
    if (stored) {
        console.log(stored);
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

    // sort by key
    palPedia.sort((a, b) => a.key.localeCompare(b.key));

    // show captured filter
    palPedia = showCapturedFilter ? palPedia
        : palPedia.filter(pal => activeTodos.some(a => a.name.toLowerCase() === pal.name.toLowerCase()));

    // search filter
    palPedia = palPedia.filter(pal =>
        pal.name.toLowerCase().includes(searchTerm) ||
        pal.key.toLowerCase().includes(searchTerm) ||
        pal.drops.some(drop => toHumanReadable(drop).toLowerCase().includes(searchTerm))
    );

    // Render
    palPedia.forEach((pal, index) => {
        const li = document.createElement("li");
        const isCaptured = !activeTodos.some(a => a.name.toLowerCase() === pal.name.toLowerCase());
        li.className = `${isCaptured ? "bg-gray-900" : "bg-gray-700"} text-white flex items-center justify-between border border-gray-200 rounded-md p-2 gap-12`;
        
        const indexer = document.createElement("div");
        indexer.className ="flex items-center shrink-0"
        addNumber();
        addImage();
        addDropItems();
        addWorkSuitabilities();
        li.appendChild(indexer);
        addContent();
        addDeleteButton();

        activeList.appendChild(li);

        function addNumber() {
            const span = document.createElement("span");
            span.className = "flex w-8 mr-2 left justify-around";
            span.innerText = pal.key
            indexer.appendChild(span);
        }

        function addImage() {
            const imgDiv = document.createElement("div");
            imgDiv.className = "cursor-pointer right";
            const img = document.createElement("img");
            img.className = "h-16 md:h-24";
            img.src = getImageById(pal.key);
            img.dataset.key = pal.key;
            img.dataset.palName = pal.name;
            imgDiv.appendChild(img);
            indexer.appendChild(imgDiv);
        }

        function addDropItems() {
            const dropsDiv = document.createElement("div");
            dropsDiv.className = "flex flex-col gap-1 w-48 ml-2";

            pal.drops.forEach(element => {
                const row = document.createElement("div");
                row.className = "flex items-center gap-2";

                const elementImg = document.createElement("img");
                elementImg.src = getImage(`../public/images/items/${element}.png`);
                elementImg.className = "h-8 w-8 object-contain";
                elementImg.title = element;

                const label = document.createElement("span");
                label.className = "text-xs text-gray-200 whitespace-nowrap";
                label.textContent = toHumanReadable(element);

                row.appendChild(elementImg);
                row.appendChild(label);
                dropsDiv.appendChild(row);
            });

            indexer.appendChild(dropsDiv);
        }

        function addWorkSuitabilities() {
            const workDiv = document.createElement("div");
            workDiv.className = "flex flex-col gap-1 w-32 ml-2"; // Increased width for 2 items

            // Group suitabilities in pairs
            for (let i = 0; i < pal.suitability.length; i += 2) {
                const rowContainer = document.createElement("div");
                rowContainer.className = "flex items-center gap-2";

                // Add first item in the pair
                const item1 = createSuitabilityItem(pal.suitability[i]);
                rowContainer.appendChild(item1);

                // Add second item if it exists
                if (i + 1 < pal.suitability.length) {
                    const item2 = createSuitabilityItem(pal.suitability[i + 1]);
                    rowContainer.appendChild(item2);
                }

                workDiv.appendChild(rowContainer);
            }

            indexer.appendChild(workDiv);
        }

        function createSuitabilityItem(suitability) {
            const item = document.createElement("div");
            item.className = "flex items-center gap-1";

            const suitabilityImg = document.createElement("img");
            suitabilityImg.src = getImage(`../public/images/works/${suitability.type}.png`);
            suitabilityImg.className = "h-6 w-6 object-contain";
            suitabilityImg.title = suitability.type;

            const label = document.createElement("span");
            label.className = "text-xs text-gray-200 whitespace-nowrap";
            label.textContent = suitability.level;

            item.appendChild(suitabilityImg);
            item.appendChild(label);

            return item;
        }


        function addContent() {
            const div = document.createElement("div");
            div.className = "flex flex-col"
            const textDiv = document.createElement("div");
            textDiv.className = "flex justify-center text-center text-white-800";
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
                    <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-900 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                    <span class="text-sm text-white-900 dark:text-white-300 w-16 inline-block">${isCaptured ? "Captured" : ""}</span>
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

    // removedList.innerHTML = "";
    // activeTodos.forEach(todo => {
    //     const li = document.createElement("li");
    //     li.className = "border border-gray-200 rounded-md p-2 text-white-500";
    //     li.textContent = todo.name;
    //     removedList.appendChild(li);
    // });
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
        const header = document.getElementById("pal-modal-text");
        header.innerText = img.dataset.palName;
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