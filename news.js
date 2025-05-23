// news.js

document.getElementById('newsBtn').addEventListener('click', function() {
    document.getElementById('newsModal').style.display = "block";
    loadNewsContent();
});

function closeNewsModal() {
    document.getElementById('newsModal').style.display = "none";
}

window.onclick = function(event) {
    if (event.target == document.getElementById('newsModal')) {
        document.getElementById('newsModal').style.display = "none";
    }
}

const newsContent = {
	    upcoming: `
        <h3>Upcoming Changes</h3>
        <ul>
			<li>Long term memory.</li>
            <li>More model support.</li>            
			<li>Fix integer bug on null Claude values.</li>
            <li>Add starter characters for each model.</li>            
			<li>Voice and TTS support.</li>
            <li>Image generation support.</li>
        </ul>
    `,
    current: `
        <h3> 1.4: Current Patch Notes</h3>
        <ul>
			<li>Color-scheme shift.</li>
			<li>Borders added.</li>
            <li>Mobile functionality cleaned up.</li>
            <li>Visibility issues fixed.</li>
        </ul>
    `,
		prioronedotthree: `
        <h3> 1.3: Current Patch Notes</h3>
        <ul>
			<li>Appearance tab added.</li>
			<li>Edit any visual value of the entire application.</li>
			<li>Import function for appearance tab added.</li>
            <li>Export function for appearance tab added</li>
            <li>Clear visual data button added.</li>
        </ul>
    `,
	    prioronedottwo: `
        <h3> 1.2: News Udpdate</h3>
        <ul>
			<li>Fixed scrolling bug.</li>
			<li>Fixed an issue where Cohere would not send messages.</li>
            <li>Added  news panel.</li>
            <li>Added patch notes.</li>
        </ul>
    `,
	    prioronedotone: `
        <h3> 1.1: Cohere Patch</h3>
        <ul>
            <li>Added Cohere provider with Command R Plus model.</li>
            <li>Fixed a bug where you coould not close out of an error popup.</li>            
			<li>Added editing for initial messages too.</li>
            <li>Added better error reporting.</li>
        </ul>
    `,
	    initialonedot: `
        <h3> 1.0: Initial Patch Notes</h3>
        <ul>
            <li>GPT and Claude added.</li>
            <li>Individual threads added.</li>            
			<li>User settings added.</li>
            <li>Data purge added.</li>            
			<li>Character cards added.</li>
            <li>Model settings and presets added.</li>            
			<li>Starter characters added.</li>
            <li>Share characters feature added.</li>
			<li>Edit and delete functions added.</li>
            <li>Reroll message function added.</li>
        </ul>
    `,
};

function loadNewsContent() {
    const selectedNews = document.getElementById('newsSelect').value;
    document.getElementById('newsDetails').innerHTML = newsContent[selectedNews];
}

// Expose functions to global scope
window.closeNewsModal = closeNewsModal;
window.loadNewsContent = loadNewsContent;
