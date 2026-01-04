const capturedDataKey = "Captured_pals";
const apiUrl = "/api";  // from nginx reverse proxy

async function getPals() {
    try {
        const response = await fetch(
            `${apiUrl}/pals`,
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
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

function getImage(imagePath) {
    return `../${imagePath}`;
}

function getElementImage(elementType) {
    return `../public/images/elements/${elementType}.png`;
}
function getPaldeckImageById(palId) {
    return `../public/images/paldeck/${palId}.png`;
}

function toHumanReadable(str) {
    return str
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function storeCapturedData(data) {
    localStorage.setItem(capturedDataKey, JSON.stringify(data));
}

function loadCapturedData() {
    var stored = localStorage.getItem(capturedDataKey);
    if (stored) {
        console.log(stored);
        return JSON.parse(stored);
    } else {
        console.log("No entries found. Initializing empty list.");
        var emptyData = [];
        storeCapturedData(emptyData);
        return emptyData;
    }
}

let capturedData = loadCapturedData();
const searchInput = document.getElementById("searchInput");
const activeList = document.getElementById("activeList");
const showCapturedCheckbox = document.getElementById("captured");

document.addEventListener("DOMContentLoaded", renderTodos);

async function renderTodos() {
    const showCapturedFilter = showCapturedCheckbox.checked;
    const capturedList = capturedData;
    const searchTerm = searchInput.value.toLowerCase();

    const selectedElements = Array.from(document.querySelectorAll('input[name="element"]:checked'))
        .map(checkbox => checkbox.value.toLowerCase());
    
    const pals = await getPals();

    activeList.innerHTML = "";

    // element filter
    var palPedia = pals.filter (pal =>  
        (selectedElements.length === 0 || pal.types.some(type => selectedElements.includes(type.toLowerCase())))
    );

    // sort by key
    palPedia.sort((a, b) => a.key.localeCompare(b.key));

    // show captured filter
    palPedia = showCapturedFilter ? palPedia
        : palPedia.filter(pal => !capturedList.some(capturedListItem => capturedListItem.toLowerCase() === pal.name.toLowerCase()));

    // search filter
    palPedia = palPedia.filter(pal =>
        pal.name.toLowerCase().includes(searchTerm) ||
        pal.key.toLowerCase().includes(searchTerm) ||
        pal.drops.some(drop => toHumanReadable(drop).toLowerCase().includes(searchTerm))
    );

    // Render
    palPedia.forEach((pal, index) => {
        const li = document.createElement("li");
        const isCaptured = capturedList.some(capturedListItem => capturedListItem.toLowerCase() === pal.name.toLowerCase());
        li.className = `${isCaptured ? "bg-gray-900" : "bg-gray-700"} text-white flex items-center justify-between border border-gray-800 rounded-md p-2 gap-12`;
        
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
            span.className = "flex w-8 mr-1 md:mr-2 text-xs md:text-base left justify-around";
            span.innerText = pal.key
            indexer.appendChild(span);
        }

        function addImage() {
            const imgDiv = document.createElement("div");
            imgDiv.className = "cursor-pointer right hover:saturate-50";
            const img = document.createElement("img");
            img.className = "h-10 md:h-24";
            img.src = getPaldeckImageById(pal.key);
            img.dataset.key = pal.key;
            img.dataset.palName = pal.name;
            img.title = "Show habitat map"
            imgDiv.appendChild(img);
            indexer.appendChild(imgDiv);
        }

        function addDropItems() {
            const dropsDiv = document.createElement("div");
            dropsDiv.className = "flex flex-col gap-1 w-4 md:w-48 ml-2";

            pal.drops.forEach(element => {
                const row = document.createElement("div");
                row.className = "flex items-center gap-2";

                const elementImg = document.createElement("img");
                elementImg.src = getImage(`../public/images/items/${element}.png`);
                elementImg.className = "h-4 w-4 md:h-8 md:w-8 object-contain";
                elementImg.title = element;

                const label = document.createElement("span");
                label.className = "hidden md:inline text-xs text-gray-200 whitespace-nowrap";
                label.textContent = toHumanReadable(element);

                row.appendChild(elementImg);
                row.appendChild(label);
                dropsDiv.appendChild(row);
            });

            indexer.appendChild(dropsDiv);
        }

        function addWorkSuitabilities() {
            const workDiv = document.createElement("div");
            workDiv.className = "hidden md:inline flex flex-col gap-1 w-8 md:w-32 ml-2"; // Increased width for 2 items

            // Group suitabilities in pairs
            for (let i = 0; i < pal.suitability.length; i += 2) {
                const rowContainer = document.createElement("div");
                rowContainer.className = "flex items-center gap-1";

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
            suitabilityImg.className = "h-3 w-3 md:h-6 md:w-6 object-contain";
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
            textDiv.className = "flex justify-center text-xs md:text-base text-center text-white-800 hover:text-blue-400";
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
            pal.types.forEach(type => {
                const typeImg = document.createElement("img");
                typeImg.src = getElementImage(type);
                typeImg.title = type;
                typeImg.className = "h-4 md:h-8";
                elementsDiv.appendChild(typeImg);
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
                if (checkbox.checked) {
                    capturedData.push(pal.name);
                } else {
                    const index = capturedData.findIndex(item => item === pal.name);
                    if (index > -1) {
                        capturedData.splice(index, 1);
                    }
                }
                
                setTimeout(() => {
                    storeCapturedData(capturedData);
                    renderTodos();
                }, 150);
            });
            
            li.appendChild(container);

        }
    });
}

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