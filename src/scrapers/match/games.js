

// External Libs
const axios = require('axios');
const cheerio = require('cheerio');

const fetchGamesMatch = async (matchId) => {
    return new Promise(async (resolve, reject) => {
        axios.get(`https://www.vlr.gg/${matchId}`)
            .then((response) => {
                let $ = cheerio.load(response.data);
                const Match = {};

                Match.match_id = matchId;
                Match.games = [];

                $(".vm-stats-gamesnav-item.js-map-switch[data-game-id]").each((i, element) => {
                    const game_id = $(element).attr("data-game-id");
                    const mapNumber = $(element).data("href").split('=')[1];
                    
                    // Skip if the game_id or mapNumber is 'all'
                    if (game_id === "all" || mapNumber === "all") return;

                    // Using the .map class to find the map name
                    let mapName = $(`.vm-stats-container .vm-stats-game[data-game-id='${game_id}']`).find(".map").text().trim().split("\t")[0].trim();

                    Match.games.push({
                        game_id: game_id,
                        map_number: mapNumber,
                        map_name: mapName // Using the map name found using the .map class
                    });
                });

                resolve(Match);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

module.exports = { fetchGamesMatch };
