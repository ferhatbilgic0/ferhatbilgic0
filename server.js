const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

const waitingPlayers = [];
const activeGames = new Map();
const countries = require('./countries.json'); // GeoJSON ülke verileri

function createGame(player1, player2) {
    const gameId = `game_${Date.now()}`;
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    
    const gameState = {
        players: [player1, player2],
        currentCountry: randomCountry,
        answers: new Map(),
        started: Date.now()
    };
    
    activeGames.set(gameId, gameState);
    
    // Her iki oyuncuya da oyunun başladığını bildir
    player1.emit('gameStart', {
        country: {
            geometry: randomCountry.geometry
        }
    });
    
    player2.emit('gameStart', {
        country: {
            geometry: randomCountry.geometry
        }
    });
    
    return gameId;
}

io.on('connection', (socket) => {
    console.log('Yeni oyuncu bağlandı');
    
    if (waitingPlayers.length > 0) {
        const opponent = waitingPlayers.pop();
        createGame(socket, opponent);
    } else {
        waitingPlayers.push(socket);
        socket.emit('waiting');
    }
    
    socket.on('submitAnswer', (data) => {
        const game = Array.from(activeGames.values()).find(g => 
            g.players.includes(socket)
        );
        
        if (!game) return;
        
        if (data.answer.toLowerCase() === game.currentCountry.properties.name.toLowerCase()) {
            socket.emit('answerResult', { correct: true });
            game.players.forEach(player => {
                if (player !== socket) {
                    player.emit('gameOver', { winner: 'Rakip' });
                } else {
                    player.emit('gameOver', { winner: 'Siz' });
                }
            });
            
            // Oyunu temizle
            activeGames.delete(Array.from(activeGames.entries())
                .find(([key, value]) => value === game)[0]);
        } else {
            socket.emit('answerResult', { correct: false });
        }
    });
    
    socket.on('disconnect', () => {
        const waitingIndex = waitingPlayers.indexOf(socket);
        if (waitingIndex > -1) {
            waitingPlayers.splice(waitingIndex, 1);
        }
        
        // Aktif oyunları kontrol et ve rakibi bilgilendir
        for (const [gameId, game] of activeGames.entries()) {
            if (game.players.includes(socket)) {
                game.players.forEach(player => {
                    if (player !== socket) {
                        player.emit('gameOver', { winner: 'Rakip bağlantısı kesildi' });
                    }
                });
                activeGames.delete(gameId);
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
}); 