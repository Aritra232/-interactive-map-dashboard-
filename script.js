const map = L.map('map');

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);
const drawControl = new L.Control.Draw({
    draw: {
        rectangle: true,
        polyline: false,
        polygon: false,
        circle: false,
        marker: false
    },
    edit: {
        featureGroup: drawnItems,
        edit: false,
        remove: false
    }
});
map.addControl(drawControl);

async function fetchReverseGeocoding(lat, lon) {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    const data = await response.json();
    return data;
}

async function updateSidebar(bounds) {
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const center = bounds.getCenter();

    const reverseGeocodingData = await fetchReverseGeocoding(center.lat, center.lng);

    const areaName = reverseGeocodingData.display_name;

    document.getElementById("details").innerHTML = `
        <p><strong>Details:</strong> ${areaName}</p>
    `;
}

map.on(L.Draw.Event.CREATED, function(event) {
    const layer = event.layer;
    const bounds = layer.getBounds();
    placeRectangle(bounds);

    map.once('click', function(event) {
        if (rectangle) {
            map.removeLayer(rectangle);
            rectangle = null; 
        }
        document.getElementById("details").innerHTML = ''; 
    });
});

let rectangle;

function placeRectangle(bounds) {
    if (rectangle) {
        map.removeLayer(rectangle);
    }

    rectangle = L.rectangle(bounds, {color: "#ff7800", weight: 1}).addTo(map);

    updateSidebar(rectangle.getBounds());
}

navigator.geolocation.getCurrentPosition(function(position) {
    const { latitude, longitude } = position.coords;
    map.setView([latitude, longitude],18); 
});
