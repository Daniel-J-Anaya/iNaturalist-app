const API_URL = "https://api.inaturalist.org/v1";

const form = document.getElementById('search-form');
const placeInput = document.getElementById('place');
const suggestionsList = document.getElementById('suggestions');
const resultsDiv = document.getElementById('results');

let selectedPlaceId = null;

// Fetch place suggestions from iNaturalist API
placeInput.addEventListener('input', async () => {
    const query = placeInput.value.trim();
    if (query.length < 3) return;
    
    const response = await fetch(`${API_URL}/places/autocomplete?q=${query}`);
    const data = await response.json();
    
    suggestionsList.innerHTML = "";
    data.results.forEach(place => {
        const li = document.createElement('li');
        li.textContent = place.display_name;
        li.addEventListener('click', () => {
            placeInput.value = place.display_name;
            selectedPlaceId = place.id;
            suggestionsList.innerHTML = "";
        });
        suggestionsList.appendChild(li);
    });
});

// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedPlaceId) {
        alert("Please select a valid place from the suggestions.");
        return;
    }

    const url = `${API_URL}/observations?place_id=${selectedPlaceId}&order=desc&order_by=created_at`;

    const response = await fetch(url);
    const data = await response.json();
    
    displayResults(data.results);
});

// Display results and remove duplicates
function displayResults(observations) {
    resultsDiv.innerHTML = "";
    const seenSpecies = new Set();

    observations.forEach(obs => {
        if (!obs.taxon || seenSpecies.has(obs.taxon.id)) return;
        seenSpecies.add(obs.taxon.id);

        const card = document.createElement('div');
        card.className = 'card';

        const img = document.createElement('img');
        img.src = obs.taxon.default_photo ? obs.taxon.default_photo.medium_url : 'https://via.placeholder.com/150';
        img.alt = obs.taxon.name;

        const name = document.createElement('p');
        name.textContent = obs.taxon.preferred_common_name || obs.taxon.name;

        card.appendChild(img);
        card.appendChild(name);
        resultsDiv.appendChild(card);
    });
}
