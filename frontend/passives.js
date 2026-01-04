let passivesData = [];
let currentSort = { column: null, ascending: true };
const apiUrl = "/api"; //"http://localhost:3000";

const tierOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'X': 5, 'Y': 6, 'Z': 7 };

async function loadPassives() {
    try {
        passivesData = await getPassives();
        renderPassives(passivesData);
    } catch (error) {
        console.error('Error loading passives:', error);
        document.getElementById('passivesTableBody').innerHTML =
            '<tr><td colspan="3" class="px-2 py-2 text-center text-red-400">Error loading passives data</td></tr>';
    }
}

async function getPassives() {
    try {
        const response = await fetch(
            `${apiUrl}/passives`,
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

function renderPassives(data) {
    const tbody = document.getElementById('passivesTableBody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="px-2 py-2 text-center text-gray-400">No passives found</td></tr>';
        return;
    }

    data.forEach(passive => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-700';
        row.innerHTML = `
          <td class="px-2 py-2">${passive.name}</td>
          <td class="px-2 py-2"><img src="../public/images/tiers/${passive.tier}.png" /> </td>
          <td class="px-2 py-2">${passive.description}</td>
        `;
        tbody.appendChild(row);
    });
}

function sortPassives(column) {
    // Toggle sort direction if clicking same column
    if (currentSort.column === column) {
        currentSort.ascending = !currentSort.ascending;
    } else {
        currentSort.column = column;
        currentSort.ascending = true;
    }

    // Update sort indicators
    document.getElementById('sort-name').textContent = '';
    document.getElementById('sort-tier').textContent = '';
    document.getElementById(`sort-${column}`).textContent = currentSort.ascending ? '▲' : '▼';

    // Sort data
    const sorted = [...passivesData].sort((a, b) => {
        let compareA, compareB;

        if (column === 'tier') {
            compareA = tierOrder[a.tier] || 999;
            compareB = tierOrder[b.tier] || 999;
        } else {
            compareA = a[column].toLowerCase();
            compareB = b[column].toLowerCase();
        }

        if (compareA < compareB) return currentSort.ascending ? -1 : 1;
        if (compareA > compareB) return currentSort.ascending ? 1 : -1;
        return 0;
    });

    renderPassives(sorted);
}

function filterPassives(searchTerm) {
    const filtered = passivesData.filter(passive => {
        const term = searchTerm.toLowerCase();
        return passive.name.toLowerCase().includes(term) ||
            passive.description.toLowerCase().includes(term);
    });
    renderPassives(filtered);
}

document.getElementById('passiveSearch').addEventListener('input', (e) => {
    filterPassives(e.target.value);
});

document.getElementById('sortPassivesByTier').addEventListener('click', () => 
    sortPassives('tier')
);

document.getElementById('sortPassivesByName').addEventListener('click', () => 
    sortPassives('name')
);


loadPassives();