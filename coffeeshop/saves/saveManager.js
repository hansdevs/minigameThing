project="game-landing-page"
file="saves/saveManager.js"
type="code"
document.addEventListener('DOMContentLoaded', function() {
    const playerNameInput = document.getElementById('playerNameInput');
    const playerScoreInput = document.getElementById('playerScoreInput'); // New input field
    const saveButton = document.getElementById('saveButton');
    const loadButton = document.getElementById('loadButton');
    const clearButton = document.getElementById('clearButton');
    const saveDataDisplay = document.getElementById('saveDataDisplay');

    const COFFEE_SHOP_SAVE_KEY = 'coffeeShopGameSaveData'; // Key for sessionStorage

    // Function to display messages or data
    function displayData(message, type = 'info') {
        if (type === 'json') {
            // Pretty print JSON
            saveDataDisplay.innerHTML = `<pre>${JSON.stringify(message, null, 2)}</pre>`;
        } else {
            saveDataDisplay.innerHTML = `<span class="${type}">${message}</span>`;
        }
    }

    // Function to save data as JSON
    function saveData() {
        const playerName = playerNameInput.value.trim();
        const playerScore = parseInt(playerScoreInput.value, 10) || 0; // Default to 0 if not a number

        if (!playerName) {
            displayData('Player Name cannot be empty.', 'error');
            return;
        }

        const saveData = {
            playerName: playerName,
            playerScore: playerScore,
            lastSaved: new Date().toISOString(),
            // You can add more game-specific fields here
            // coffeeShopProgress: { level: 1, beansCollected: 150 }
        };

        try {
            sessionStorage.setItem(COFFEE_SHOP_SAVE_KEY, JSON.stringify(saveData));
            displayData('Data saved successfully!', 'success');
            // Optionally clear inputs after saving
            // playerNameInput.value = '';
            // playerScoreInput.value = '';
        } catch (e) {
            displayData('Error saving data. Storage might be full or unavailable.', 'error');
            console.error("Error saving to sessionStorage:", e);
        }
    }

    // Function to load data from JSON
    function loadData() {
        const loadedDataString = sessionStorage.getItem(COFFEE_SHOP_SAVE_KEY);
        if (loadedDataString) {
            try {
                const loadedData = JSON.parse(loadedDataString);
                displayData(loadedData, 'json'); // Display the parsed JSON object

                // Populate input fields
                playerNameInput.value = loadedData.playerName || '';
                playerScoreInput.value = loadedData.playerScore || '';

            } catch (e) {
                displayData('Error parsing saved data. It might be corrupted.', 'error');
                console.error("Error parsing JSON from sessionStorage:", e);
            }
        } else {
            displayData('No save data found for Coffee Shop game in this session.', 'info');
        }
    }

    // Function to clear data
    function clearData() {
        sessionStorage.removeItem(COFFEE_SHOP_SAVE_KEY);
        displayData('Coffee Shop game save data has been cleared from this session.', 'success');
        playerNameInput.value = '';
        playerScoreInput.value = '';
    }

    // Attach event listeners
    if (saveButton) {
        saveButton.addEventListener('click', saveData);
    }
    if (loadButton) {
        loadButton.addEventListener('click', loadData);
    }
    if (clearButton) {
        clearButton.addEventListener('click', clearData);
    }

    // Initial message
    displayData('Enter player details and save. Load to retrieve.', 'info');
});