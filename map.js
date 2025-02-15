// Harita başlangıç noktası (dünya merkezi)
const map = L.map('map').setView([30, 0], 2);

// Uydu görüntüsü katmanı
const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19
}).addTo(map);

// Etiketler katmanı (sokak isimleri ve önemli yerler)
const labels = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CartoDB',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

// İşaretçi stilini özelleştir
function addMarker(lat, lng, title) {
    const customIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    L.marker([lat, lng], {icon: customIcon})
        .bindPopup(`<div style="color: #f1c40f; font-weight: bold">${title}</div>`)
        .addTo(map);
}

// Örnek bazı lokasyonlar ekleyelim
addMarker(41.0082, 28.9784, 'İstanbul, Türkiye');
addMarker(48.8566, 2.3522, 'Paris, Fransa');
addMarker(40.7128, -74.0060, 'New York, ABD');

// Harita kontrollerini özelleştir
map.zoomControl.setPosition('bottomright');

// Katman kontrolü ekle
const baseMaps = {
    "Uydu Görüntüsü": satellite
};

const overlayMaps = {
    "Etiketler": labels
};

L.control.layers(baseMaps, overlayMaps, {position: 'topright'}).addTo(map); 