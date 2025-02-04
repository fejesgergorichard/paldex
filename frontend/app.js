import { initialData } from "./initialData.js";

const dataKey = "dddd";
const apiUrl = "http://192.168.0.229:3000"

async function getDataForName(name) {
    try {
        const response = await fetch(
            `${apiUrl}/?page=1&limit=10&name=${name}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.content[0];
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function getImageForPal(name) {
    const data = await getDataForName(name);
    return getImage(data.image);
}

function getImage(imagePath) {
    return `${apiUrl}${imagePath}`;
}

async function getWikiLink(name) {
    const data = await getDataForName(name);
    return data.wiki;
}

async function getElements(name) {
    const data = await getDataForName(name);
    return data.types;
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
            isDone: false,
            element: "fire"
        }));
        storeData(initialDataToStore);
        return initialDataToStore;
    }
}

let todosData = loadData();

// DOM Elements
const searchInput = document.getElementById("searchInput");
const newTodoInput = document.getElementById("newTodoInput");
const addButton = document.getElementById("addButton");
const activeList = document.getElementById("activeList");
const removedList = document.getElementById("removedList");

function renderTodos() {
    activeList.innerHTML = "";
    removedList.innerHTML = "";
    const searchTerm = searchInput.value.toLowerCase();

    // Filter active todos (isDone false) based on search term
    const activeTodos = todosData.filter(
        todo => !todo.isDone && todo.name.toLowerCase().includes(searchTerm)
    );
    // Filter removed todos (isDone true) -- no search filtering for removed list
    const removedTodos = todosData.filter(todo => todo.isDone);

    // Render active todos
    activeTodos.forEach((todo, index) => {
        const li = document.createElement("li");
        li.className = "flex items-center justify-between border border-gray-200 rounded-md p-2";

        addImage();
        addContent();
        addDeleteButton();

        activeList.appendChild(li);

        function addImage() {
            const a = document.createElement("a");
                getWikiLink(todo.name).then(res => 
                    a.href = res
                );
                a.target = '_blank';
                const img = document.createElement("img");
                getImageForPal(todo.name).then(res =>
                    img.src = res
                );
                img.className = "h-24 mr-2";
                a.appendChild(img);
            li.appendChild(a);
        }

        function addContent() {
            const div = document.createElement("div");
            div.className = "flex flex-col"
                const textDiv = document.createElement("div");
                textDiv.className = "flex justify-center text-gray-800";
                textDiv.textContent = todo.name;
                div.appendChild(textDiv);

                
                const elementsDiv = document.createElement("div");
                elementsDiv.className = "flex justify-around";
                getElements(todo.name).then(elementsResult =>
                    elementsResult.forEach(element => {
                        const elementImg = document.createElement("img");
                        elementImg.src = getImage(element.image);
                        elementImg.className = "h-8";
                        elementsDiv.appendChild(elementImg);
                    })
                );
                div.appendChild(elementsDiv);

            li.appendChild(div);
        }

        function addDeleteButton() {
            const delButton = document.createElement("button");
            delButton.className = "text-red-500 hover:text-red-700 focus:outline-none";
            delButton.textContent = "Delete";

            delButton.addEventListener("click", () => {
                const target = todosData.find(item => item.name === todo.name && !item.isDone);
                if (target) {
                    target.isDone = true;
                    storeData(todosData);
                    renderTodos();
                }
            });

            li.appendChild(delButton);
        }
    });

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