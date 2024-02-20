const axios = require('axios');
const cheerio = require('cheerio');

const fetchStatsMatch = async (matchId) => {
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

                // Initialize the games array
                Match.games = [];

                // Iterate over each game
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

                    // Initialize the game object
                    const game = {
                        game_id: game_id,
                        map_number: mapNumber,
                        map_name: mapName,
                        players: []
                    };

                    // Iterate over each player row in the table for this game
                    $(`.vm-stats-container .vm-stats-game[data-game-id='${game_id}'] .wf-table-inset.mod-overview tr`).each((index, element) => {
                        if ($(element).find(".mod-player a div:nth-child(1)").text().trim() === "") return;

                        const Player = {};
                        Player.name = $(element).find(".mod-player a div:nth-child(1)").text().trim();
                        Player.team = $(element).find(".mod-player a div:nth-child(2)").text().trim();
                        const playerLink = $(element).find(".mod-player a").attr("href");
                        Player.player_id = playerLink ? playerLink.split('/')[2] : null;
                        Player.statsadvanced = {};
                        Player.stats = {};

                        const playerStats = $(element).find(".mod-stat");
                        playerStats.each((i, element) => {
                            const ct = $(element).find(".mod-ct").text().trim();
                            const t = $(element).find(".mod-t").text().trim();
                            const ot = $(element).find(".mod-ot").text().trim();
                            const both = $(element).find(".mod-both").text().trim();
                            const data = {
                                ct: ct,
                                t: t,
                                ot: ot
                            };
                            switch (i) {
                                case 0:
                                    Player.statsadvanced.kdr = data;
                                    Player.stats.kdr = both;
                                    break;
                                case 1:
                                    Player.statsadvanced.acs = data;
                                    Player.stats.acs = both;
                                    break;
                                case 2:
                                    Player.statsadvanced.k = data;
                                    Player.stats.k = both;
                                    break;
                                case 3:
                                    Player.statsadvanced.d = data;
                                    Player.stats.d = both;
                                    break;
                                case 4:
                                    Player.statsadvanced.a = data;
                                    Player.stats.a = both;
                                    break;
                                case 5:
                                    Player.statsadvanced.kdb = data;
                                    Player.stats.kdb = both;
                                    break;
                                case 6:
                                    Player.statsadvanced.kast = data;
                                    Player.stats.kast = both;
                                    break;
                                case 7:
                                    Player.statsadvanced.adr = data;
                                    Player.stats.adr = both;
                                    break;
                                case 8:
                                    Player.statsadvanced.hs = data;
                                    Player.stats.hs = both;
                                    break;
                                case 9:
                                    Player.statsadvanced.fk = data;
                                    Player.stats.fk = both;
                                    break;
                                case 10:
                                    Player.statsadvanced.fd = data;
                                    Player.stats.fd = both;
                                    break;
                                case 11:
                                    Player.statsadvanced.fkdb = data;
                                    Player.stats.fkdb = both;
                                    break;
                                default:
                                    break;
                            }
                        });

                        game.players.push(Player);
                    });

                    Match.games.push(game);
                });

                resolve(Match);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

module.exports = { fetchStatsMatch };

