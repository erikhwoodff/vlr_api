

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

                    // The map name seems to be the text node immediately following the map number span
                    // This will get the text node directly after the span containing the map number
                    let mapName = $(element).next('div').find('span').first().next().text().trim();

                    Match.games.push({
                        game_id: game_id,
                        map_number: mapNumber,
                        map_name: mapName
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
