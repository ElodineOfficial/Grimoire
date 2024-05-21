let cssRules = {};  // Define cssRules in the global scope
let originalCssRules = {};  // Define originalCssRules to store original CSS

async function init() {
    const response = await fetch('/grimoire/styles222.css'); // Ensure the path is correct
    const cssText = await response.text();
    cssRules = parseCSS(cssText);  // Initialize cssRules with parsed CSS
    originalCssRules = JSON.parse(JSON.stringify(cssRules));  // Deep copy original CSS rules
    populateDropdown(cssRules);
}

function parseCSS(cssText) {
    const rules = {};
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(cssText);

    for (let rule of styleSheet.cssRules) {
        if (rule.type === CSSRule.STYLE_RULE) {
            const selector = rule.selectorText;
            const styles = {};
            for (let style of rule.style) {
                styles[style] = rule.style.getPropertyValue(style);
            }
            rules[selector] = styles;
        }
    }
    return rules;
}

function populateDropdown(cssRules) {
    const dropdown = document.getElementById('cssClassSelect');
    dropdown.innerHTML = '';

    for (const selector in cssRules) {
        const option = document.createElement('option');
        option.value = selector;
        option.textContent = selector;
        dropdown.appendChild(option);
    }
}

function displayCSSProperties(cssRules, selectedClass) {
    const propertiesContainer = document.getElementById('cssProperties');
    propertiesContainer.innerHTML = '';

    const properties = cssRules[selectedClass];
    for (const property in properties) {
        const propertyRow = document.createElement('div');
        propertyRow.className = 'property-row';

        const label = document.createElement('label');
        label.textContent = property;
        propertyRow.appendChild(label);

        const input = document.createElement('input');
        input.type = 'text';
        input.value = properties[property];
        input.dataset.property = property;
        propertyRow.appendChild(input);

        propertiesContainer.appendChild(propertyRow);
    }
}

function saveCSSProperties(cssRules, selectedClass) {
    const propertiesContainer = document.getElementById('cssProperties');
    const inputs = propertiesContainer.querySelectorAll('input');

    inputs.forEach(input => {
        const property = input.dataset.property;
        const value = input.value;
        cssRules[selectedClass][property] = value;
        document.querySelector(selectedClass).style.setProperty(property, value);
    });

    // Save changes to local storage
    localStorage.setItem('cssRules', JSON.stringify(cssRules));

    // Close the modal after saving
    document.getElementById('appearanceModal').style.display = 'none';
}

function loadCSSFromLocalStorage() {
    const savedCssRules = JSON.parse(localStorage.getItem('cssRules'));
    if (savedCssRules) {
        for (const selector in savedCssRules) {
            if (document.querySelector(selector)) {  // Check if element exists
                for (const property in savedCssRules[selector]) {
                    document.querySelector(selector).style.setProperty(property, savedCssRules[selector][property]);
                }
            }
        }
    }
}

function exportCSSProfile() {
    const cssRules = JSON.parse(localStorage.getItem('cssRules'));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cssRules));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "cssProfile.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importCSSProfile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        const importedCssRules = JSON.parse(event.target.result);

        // Merge imported rules with existing ones
        const savedCssRules = JSON.parse(localStorage.getItem('cssRules')) || {};
        for (const selector in importedCssRules) {
            if (!savedCssRules[selector]) {
                savedCssRules[selector] = {};
            }
            for (const property in importedCssRules[selector]) {
                savedCssRules[selector][property] = importedCssRules[selector][property];
            }
        }

        // Save merged rules to local storage and update the cssRules variable
        cssRules = savedCssRules;
        localStorage.setItem('cssRules', JSON.stringify(cssRules));
        loadCSSFromLocalStorage();  // Apply the merged rules
    };
    reader.readAsText(file);
}

function resetCSSToOriginal() {
    cssRules = JSON.parse(JSON.stringify(originalCssRules));  // Reset cssRules to original values

    // Apply original CSS rules to elements
    for (const selector in cssRules) {
        if (document.querySelector(selector)) {  // Check if element exists
            for (const property in cssRules[selector]) {
                document.querySelector(selector).style.setProperty(property, cssRules[selector][property]);
            }
        }
    }

    // Save original CSS rules to local storage
    localStorage.setItem('cssRules', JSON.stringify(cssRules));

    // Update the displayed properties in the modal if it's open
    const selectedClass = document.getElementById('cssClassSelect').value;
    if (selectedClass) {
        displayCSSProperties(cssRules, selectedClass);
    }
}

document.getElementById('importCssInput').addEventListener('change', importCSSProfile);
document.getElementById('exportCssButton').addEventListener('click', exportCSSProfile);
document.getElementById('cssClassSelect').addEventListener('change', function() {
    const selectedClass = this.value;
    displayCSSProperties(cssRules, selectedClass);
});
document.getElementById('saveCssButton').addEventListener('click', function() {
    const selectedClass = document.getElementById('cssClassSelect').value;
    saveCSSProperties(cssRules, selectedClass);
});
document.getElementById('appearanceBtn').addEventListener('click', function() {
    document.getElementById('appearanceModal').style.display = 'block';
    init();
});
document.querySelector('#appearanceModal .close').addEventListener('click', function() {
    document.getElementById('appearanceModal').style.display = 'none';
});
document.querySelector('#clearCssButton').addEventListener('click', resetCSSToOriginal);

// Call this function on page load
window.onload = loadCSSFromLocalStorage;
