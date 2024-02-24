// External Libs
const axios = require('axios');
const cheerio = require('cheerio');

const fetchGamesMatch = async (matchId) => {
    return new Promise((resolve, reject) => {
        axios.get(`https://www.vlr.gg/${matchId}`)
            .then((response) => {
                let $ = cheerio.load(response.data);
                const Match = {};
                Match.match_id = matchId;

                // Extract the main Event name and clean up whitespace and newline characters
                let rawMainEvent = $(".match-header-super div[style*='font-weight: 700;']").first().text();
                Match.event_name = rawMainEvent.replace(/\s+/g, ' ').trim(); 

                // Extract the Sub Event
                let rawSubEvent = $(".match-header-super .match-header-event-series").first().text();
                Match.sub_event = rawSubEvent.replace(/\s+/g, ' ').trim(); 

                // Extract the event ID from the href attribute
                const eventHref = $("div.match-header-super a.match-header-event").attr("href");
                Match.event_id = eventHref ? eventHref.split('/')[2] : null;

                // Extract the timestamp from the data-utc-ts attribute
                const eventDateElement = $(".moment-tz-convert").first();
                Match.event_utc_ts = eventDateElement.length ? eventDateElement.data("utc-ts") : null;

                // Logic to extract games data
                Match.games = [];

                $(".vm-stats-gamesnav-item.js-map-switch[data-game-id]").each((i, element) => {
                    const game_id = $(element).attr("data-game-id");
                    const href = $(element).data("href");
                    const mapNumber = href ? href.split('=')[1] : null;

                    // Skip if the game_id or mapNumber is 'all'
                    if (game_id === "all" || mapNumber === "all") return;

                    // Find the map name using the game_id to select the right .vm-stats-game element
                    let mapNameSelector = `.vm-stats-container .vm-stats-game[data-game-id='${game_id}'] .map`;
                    let mapName = $(mapNameSelector).text().trim().split("\t")[0].trim();

                    // If the map name is empty, skip this game
                    if (!mapName) return;

                   // Extracting team names, scores, and ELO ratings
                    let teamData = $(`.vm-stats-container .vm-stats-game[data-game-id='${game_id}']`);
                    let teamNames = teamData.find(".team-name").map((idx, el) => $(el).text().trim()).get();
                    let mod_cts = teamData.find(".mod-ct").map((idx, el) => $(el).text().trim()).get();
                    let mod_ts = teamData.find(".mod-t").map((idx, el) => $(el).text().trim()).get();
                    let mod_ots = teamData.find(".mod-ot").map((idx, el) => $(el).text().trim()).get();
                    
                    let headerData = $(".match-header-vs .match-header-link");
                    let headerElos = headerData.find(".match-header-link-name-elo").map((idx, el) => $(el).text().trim().replace(/\[|\]/g, '')).get();
                    
                    // Construct the game data object with extracted ELOs
                    let gameData = {
                        game_id: game_id,
                        map_number: mapNumber,
                        map_name: mapName,
                        teams: [
                            {
                                name: teamNames[0],
                                mod_ct: mod_cts[0],
                                mod_t: mod_ts[0],
                                mod_ot: mod_ots[0] || "0",
                                elo: headerElos[0] // ELO for the first team
                            },
                            {
                                name: teamNames[1],
                                mod_ct: mod_cts[1],
                                mod_t: mod_ts[1],
                                mod_ot: mod_ots[1] || "0",
                                elo: headerElos[1] // ELO for the second team
                            }
                        ]
                    };

                    // Add the game data to the Match.games array
                    Match.games.push(gameData);
                });

                resolve(Match);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

module.exports = { fetchGamesMatch };
