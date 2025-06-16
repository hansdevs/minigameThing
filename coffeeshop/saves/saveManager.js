project="game-landing-page"
file="save/saveManager.js"
type="code"
document.addEventListener('DOMContentLoaded', function() {
    const playerNameInput = document.getElementById('playerNameInput');
    const playerScoreInput = document.getElementById('playerScoreInput');
    const saveButton = document.getElementById('saveButton');
    const loadButton = document.getElementById('loadButton');
    const clearButton = document.getElementById('clearButton');
    const saveDataDisplay = document.getElementById('saveDataDisplay');
    
    // New file handling elements
    const fileDropArea = document.getElementById('fileDropArea');
    const fileInput = document.getElementById('fileInput');
    const fileSelectButton = document.getElementById('fileSelectButton');
    const jsonPasteArea = document.getElementById('jsonPasteArea');
    const loadFromPasteButton = document.getElementById('loadFromPasteButton');

    const COFFEE_SHOP_SAVE_KEY = 'coffeeShopGameSaveData';

    // Function to display messages or data
    function displayData(message, type = 'info') {
        if (type === 'json') {
            saveDataDisplay.innerHTML = `<pre>${JSON.stringify(message, null, 2)}</pre>`;
        } else {
            saveDataDisplay.innerHTML = `<span class="${type}">${message}</span>`;
        }
    }

    // Function to generate filename based on player name
    function generateFileName(playerName) {
        const namePrefix = playerName.substring(0, 5).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const saveCountKey = `saveCount_${namePrefix}`;
        let saveCount = parseInt(localStorage.getItem(saveCountKey) || '0', 10) + 1;
        localStorage.setItem(saveCountKey, saveCount.toString());
        return `${namePrefix}${saveCount}.json`;
    }

    // Function to download JSON file
    function downloadJSON(data, filename) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Function to load save data into form
    function loadSaveIntoForm(saveData) {
        try {
            playerNameInput.value = saveData.playerName || '';
            playerScoreInput.value = saveData.playerScore || '';
            
            // Also save to session storage
            sessionStorage.setItem(COFFEE_SHOP_SAVE_KEY, JSON.stringify(saveData));
            
            displayData(saveData, 'json');
            displayData('Save data loaded successfully!', 'success');
        } catch (e) {
            displayData('Error loading save data into form.', 'error');
            console.error('Error loading save data:', e);
        }
    }

    // Function to validate JSON save data
    function validateSaveData(data) {
        return data && 
               typeof data === 'object' && 
               data.playerName && 
               typeof data.playerName === 'string' &&
               data.hasOwnProperty('playerScore');
    }

    // Function to save data and download JSON file
    function saveData() {
        const playerName = playerNameInput.value.trim();
        const playerScore = parseInt(playerScoreInput.value, 10) || 0;

        if (!playerName) {
            displayData('Player Name cannot be empty.', 'error');
            return;
        }

        const saveData = {
            playerName: playerName,
            playerScore: playerScore,
            lastSaved: new Date().toISOString(),
            gameType: 'coffeeShop',
            version: '1.0'
        };

        try {
            // Save to sessionStorage
            sessionStorage.setItem(COFFEE_SHOP_SAVE_KEY, JSON.stringify(saveData));
            
            // Generate filename and download JSON file
            const filename = generateFileName(playerName);
            downloadJSON(saveData, filename);
            
            displayData(`Save successful! File "${filename}" downloaded and stored in session.`, 'success');
        } catch (e) {
            displayData('Error saving data.', 'error');
            console.error("Error saving data:", e);
        }
    }

    // Function to load data from sessionStorage
    function loadData() {
        const loadedDataString = sessionStorage.getItem(COFFEE_SHOP_SAVE_KEY);
        if (loadedDataString) {
            try {
                const loadedData = JSON.parse(loadedDataString);
                displayData(loadedData, 'json');
                playerNameInput.value = loadedData.playerName || '';
                playerScoreInput.value = loadedData.playerScore || '';
            } catch (e) {
                displayData('Error parsing saved data from session.', 'error');
                console.error("Error parsing JSON from sessionStorage:", e);
            }
        } else {
            displayData('No save data found in this session.', 'info');
        }
    }

    // Function to clear data
    function clearData() {
        sessionStorage.removeItem(COFFEE_SHOP_SAVE_KEY);
        displayData('Session save data cleared.', 'success');
        playerNameInput.value = '';
        playerScoreInput.value = '';
    }

    // Function to handle file reading
    function handleFile(file) {
        if (file && file.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const saveData = JSON.parse(e.target.result);
                    if (validateSaveData(saveData)) {
                        loadSaveIntoForm(saveData);
                    } else {
                        displayData('Invalid save file format. Missing required fields.', 'error');
                    }
                } catch (error) {
                    displayData('Error reading JSON file. Please check the file format.', 'error');
                    console.error('JSON parse error:', error);
                }
            };
            reader.readAsText(file);
        } else {
            displayData('Please select a valid JSON file.', 'error');
        }
    }

    // Function to load from pasted JSON
    function loadFromPaste() {
        const pastedData = jsonPasteArea.value.trim();
        if (!pastedData) {
            displayData('Please paste JSON data first.', 'error');
            return;
        }

        try {
            const saveData = JSON.parse(pastedData);
            if (validateSaveData(saveData)) {
                loadSaveIntoForm(saveData);
                jsonPasteArea.value = ''; // Clear paste area after successful load
            } else {
                displayData('Invalid JSON format. Missing required fields (playerName, playerScore).', 'error');
            }
        } catch (error) {
            displayData('Invalid JSON format. Please check your pasted data.', 'error');
            console.error('JSON parse error:', error);
        }
    }

    // Event Listeners
    if (saveButton) {
        saveButton.addEventListener('click', saveData);
    }
    if (loadButton) {
        loadButton.addEventListener('click', loadData);
    }
    if (clearButton) {
        clearButton.addEventListener('click', clearData);
    }

    // File selection button
    if (fileSelectButton) {
        fileSelectButton.addEventListener('click', () => fileInput.click());
    }

    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0]);
            }
        });
    }

    // Drag and drop functionality
    if (fileDropArea) {
        fileDropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileDropArea.classList.add('drag-over');
        });

        fileDropArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            fileDropArea.classList.remove('drag-over');
        });

        fileDropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileDropArea.classList.remove('drag-over');
            
            if (e.dataTransfer.files.length > 0) {
                handleFile(e.dataTransfer.files[0]);
            }
        });

        // Click to select file
        fileDropArea.addEventListener('click', () => fileInput.click());
    }

    // Load from paste button
    if (loadFromPasteButton) {
        loadFromPasteButton.addEventListener('click', loadFromPaste);
    }

    // Initial message
    displayData('Enter player details and save. Load to retrieve.', 'info');
});