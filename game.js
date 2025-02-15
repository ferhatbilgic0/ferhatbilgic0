const socket = io();
let map;
let currentCountryLayer;
let score = 0;

// Harita başlangıç ayarları
function initMap() {
    map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Oyun başlatma
socket.on('gameStart', (data) => {
    document.getElementById('waiting-screen').style.display = 'none';
    document.getElementById('answer-form').style.display = 'block';
    document.getElementById('game-status').innerHTML = 'Oyun başladı! Ülkeyi tahmin edin.';
    showCountryOnMap(data.country);
});

// Ülkeyi haritada gösterme
function showCountryOnMap(countryData) {
    if (currentCountryLayer) {
        map.removeLayer(currentCountryLayer);
    }
    
    currentCountryLayer = L.geoJSON(countryData.geometry, {
        style: {
            color: '#3498db',
            weight: 2,
            opacity: 1,
            fillColor: '#3498db',
            fillOpacity: 0.7
        }
    }).addTo(map);
    
    map.fitBounds(currentCountryLayer.getBounds(), {
        padding: [50, 50],
        maxZoom: 5
    });
}

// Tahmin gönderme
document.getElementById('answer-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const answer = document.getElementById('answer-input').value;
    socket.emit('submitAnswer', { answer });
    document.getElementById('answer-input').value = '';
});

// Sonuç alma
socket.on('answerResult', (data) => {
    if (data.correct) {
        score += 10;
        document.getElementById('score').innerHTML = `Skor: ${score}`;
        document.getElementById('game-status').innerHTML = 'Doğru tahmin! Yeni oyun başlıyor...';
    } else {
        document.getElementById('game-status').innerHTML = 'Yanlış tahmin! Devam edin...';
    }
});

// Oyun sonu
socket.on('gameOver', (data) => {
    document.getElementById('game-status').innerHTML = `Oyun bitti! ${data.winner} kazandı!`;
    document.getElementById('answer-form').style.display = 'none';
});

// Bağlantı hatası
socket.on('disconnect', () => {
    document.getElementById('game-status').innerHTML = 'Bağlantı kesildi! Sayfayı yenileyin.';
});

// Haritayı başlat
initMap(); 