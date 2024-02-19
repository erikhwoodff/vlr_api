

// External Libs
const axios = require('axios');
const cheerio = require('cheerio');

const fetchGamesMatch = async (matchId) => {
    return new Promise(async (resolve, reject) => {
        // Fetch the page
        axios.get(`https://www.vlr.gg/${matchId}`)
            .then((response) => {
                // Parse the page
                let $ = cheerio.load(response.data);
                const Match = {};

                // Extract match_id from the URL
                Match.match_id = matchId;

                // Extract game_ids, map numbers, and map names, ignoring the "all" entries
                Match.games = [];
                $(".vm-stats-gamesnav-item.js-map-switch[data-game-id]").each((i, element) => {
                    const game_id = $(element).attr("data-game-id");
                    const mapNumber = $(element).data("href").split('=')[1];

                    // Assuming the map name is the next text node after the span containing the map number
                    const mapName = $(element).next('div').contents().filter(function() {
                        return this.type === 'text';
                    }).text().trim();

                    if (game_id !== "all" && mapNumber !== "all" && mapName) {
                        Match.games.push({
                            game_id: game_id,
                            map_number: mapNumber,
                            map_name: mapName // Add map name to our game object
                        });
                    }
                });

                resolve(Match);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

module.exports = { fetchGamesMatch };

