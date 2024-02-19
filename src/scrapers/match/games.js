

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

                    // Find the map name by getting the text content of the span inside the following div
                    // This assumes the map name span is the only span in the div
                    const mapName = $(element).next().find('span').text().trim();

                    if (game_id !== "all" && mapNumber !== "all") {
                        Match.games.push({
                            game_id: game_id,
                            map_number: mapNumber,
                            map_name: mapName // Updated to capture the map name correctly
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


