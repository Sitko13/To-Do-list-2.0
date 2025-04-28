const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const listTitle = document.getElementById("list-title");
const tabsDiv = document.querySelector(".tabs");
const addTabButton = document.getElementById("add-tab-btn");

let lists = [];
let currentListId = null;

function loadLists() {
    const storedLists = localStorage.getItem('todoAppLists');
    if (storedLists) {
        lists = JSON.parse(storedLists);
    } else {
        lists = [{ id: `list-${Date.now()}`, name: 'To-Do list' }];
    }
    currentListId = localStorage.getItem('lastActiveListId');
    const activeListExists = lists.some(list => list.id === currentListId);
    if (!currentListId || !activeListExists) {
        currentListId = lists.length > 0 ? lists[0].id : null;
    }
}

function saveLists() {
    localStorage.setItem('todoAppLists', JSON.stringify(lists));
    if (currentListId) {
        localStorage.setItem('lastActiveListId', currentListId);
    } else {
        localStorage.removeItem('lastActiveListId');
    }
}

function renderTabs() {
    tabsDiv.innerHTML = '';
    if (lists.length === 0) {
        listTitle.innerHTML = 'No lists <img src="images/ikon.png">';
        listContainer.innerHTML = '';
        return;
    }

    lists.forEach(list => {
        const tabButton = document.createElement('button');
        tabButton.classList.add('tab-button');
        tabButton.dataset.listId = list.id;

        const tabNameSpan = document.createElement('span');
        tabNameSpan.classList.add('tab-name');
        tabNameSpan.textContent = list.name;
        tabButton.appendChild(tabNameSpan);

        const deleteBtn = document.createElement('i');
        deleteBtn.classList.add('fas', 'fa-times', 'tab-delete-btn');
        deleteBtn.title = 'Delete list';
        deleteBtn.onclick = (event) => {
            event.stopPropagation();
            deleteList(list.id);
        };
        tabButton.appendChild(deleteBtn);

        if (list.id === currentListId) {
            tabButton.classList.add('active');
            listTitle.innerHTML = `${list.name} <img src="images/ikon.png">`;
        }

        tabButton.addEventListener('click', () => {
            switchList(list.id);
        });

        tabButton.addEventListener('dblclick', () => {
            editListName(list.id, tabButton, tabNameSpan);
        });

        tabsDiv.appendChild(tabButton);
    });

    if (currentListId) {
        showTask();
    } else {
        listContainer.innerHTML = '';
    }
}

function addNewList() {
    const listName = prompt("Enter a name for the new list:");
    if (listName && listName.trim() !== '') {
        const newList = {
            id: `list-${Date.now()}`,
            name: listName.trim()
        };
        lists.push(newList);
        currentListId = newList.id;
        saveLists();
        renderTabs();
    } else if (listName !== null) {
        alert("The list name cannot be empty.");
    }
}

function deleteList(listIdToDelete) {
    const listToDelete = lists.find(list => list.id === listIdToDelete);
    if (!listToDelete) return;

    if (confirm(`Do you really want to delete the list? "${listToDelete.name}"? The tasks in it will be lost!`)) {
        lists = lists.filter(list => list.id !== listIdToDelete);

        localStorage.removeItem(`todoData-${listIdToDelete}`);

        if (currentListId === listIdToDelete) {
            currentListId = lists.length > 0 ? lists[0].id : null;
        }

        saveLists();
        renderTabs();
    }
}

function editListName(listId, tabButton, nameSpan) {
    const currentName = nameSpan.textContent;
    nameSpan.style.display = 'none';
    const deleteBtn = tabButton.querySelector('.tab-delete-btn');
    if (deleteBtn) deleteBtn.style.display = 'none';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.classList.add('edit-input');

    tabButton.prepend(input);
    input.focus();

    const finishEdit = () => {
        const newName = input.value.trim();
        nameSpan.style.display = '';
        if (deleteBtn) deleteBtn.style.display = '';

        if (newName && newName !== currentName) {
            const listIndex = lists.findIndex(list => list.id === listId);
            if (listIndex !== -1) {
                lists[listIndex].name = newName;
                nameSpan.textContent = newName;
                saveLists();
                if (currentListId === listId) {
                    listTitle.innerHTML = `${newName} <img src="images/ikon.png">`;
                }
            }
        } else if (!newName) {
            nameSpan.textContent = currentName;
            alert("The name cannot be empty.");
        } else {
            nameSpan.textContent = currentName;
        }
        if (input.parentNode) {
            input.remove();
        }
        input.removeEventListener('blur', finishEdit);
        input.removeEventListener('keypress', handleKeyPress);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            finishEdit();
        } else if (event.key === 'Escape') {
            input.value = currentName;
            finishEdit();
        }
    };

    input.addEventListener('blur', finishEdit);
    input.addEventListener('keypress', handleKeyPress);
}

function addTask() {
    if (!currentListId) {
        alert("First you need to create a list!");
        return;
    }
    if (inputBox.value === "") {
        alert("You have to write something!");
    } else {
        let li = document.createElement("li");
        li.innerHTML = inputBox.value;
        listContainer.appendChild(li);

        let span = document.createElement("span");
        span.innerHTML = "\u00d7";
        li.appendChild(span);
    }
    inputBox.value = "";
    saveTaskData();
}

listContainer.addEventListener("click", function (e) {
    if (!currentListId) return;

    if (e.target.tagName === "LI") {
        e.target.classList.toggle("checked");
        saveTaskData();
    } else if (e.target.tagName === "SPAN") {
        e.target.parentElement.remove();
        saveTaskData();
    }
}, false);

inputBox.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addTask();
    }
});

function saveTaskData() {
    if (!currentListId) return;
    const storageKey = `todoData-${currentListId}`;
    localStorage.setItem(storageKey, listContainer.innerHTML);
}

function showTask() {
    if (!currentListId) {
        listContainer.innerHTML = '';
        return;
    }
    const storageKey = `todoData-${currentListId}`;
    listContainer.innerHTML = localStorage.getItem(storageKey) || "";
}

function switchList(newListId) {
    if (newListId === currentListId) {
        return;
    }

    if (currentListId) {
        saveTaskData();
    }

    currentListId = newListId;
    saveLists();
    renderTabs();
}

function initializeApp() {
    loadLists();
    renderTabs();
    addTabButton.addEventListener('click', addNewList);
}

initializeApp();
