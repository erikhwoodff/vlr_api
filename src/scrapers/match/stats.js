const axios = require('axios');
const cheerio = require('cheerio');

function cleanString(str) {
    return str.replace(/[\n\t\r]+/g, ' ').replace(/\s\s+/g, ' ').trim();
}

const fetchStatsMatch = async (matchId) => {
    try {
        const response = await axios.get(`https://www.vlr.gg/${matchId}`);
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
        
                $(".vm-stats-gamesnav-item.js-map-switch[data-game-id]").each((gameIndex, gameElement) => {
                    const game_id = $(gameElement).attr("data-game-id");
                    const href = $(gameElement).data("href");
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
                    $(`.vm-stats-container .vm-stats-game[data-game-id='${game_id}'] .wf-table-inset.mod-overview tr`).each((playerIndex, playerElement) => {
                        const player = {};
                        const playerNameWithExtra = $(playerElement).find(".mod-player").text();
                        player.name = cleanString(playerNameWithExtra);
                        
                        const playerLink = $(playerElement).find(".mod-player a").attr("href");
                        Player.player_id = playerLink ? playerLink.split('/')[2] : null;
                        Player.stats = {};
                    
                        // Extract each stat for the player
                        player.stats = {};

                $(playerElement).find("td[class*='mod-stat']").each((statIndex, statElement) => {
                    const statName = $(statElement).attr('class').split(' ').find(cls => cls.includes('mod-vlr')).split('-').pop();
                    let statValueWithExtra = $(statElement).find('.stats-sq').text();
                    player.stats[statName] = cleanString(statValueWithExtra);
                });

                game.players.push(player);
            });

            Match.games.push(game);
        });

        return Match; // Resolve the promise with the match data
    } catch (err) {
        throw err; // Reject the promise with an error
    }
}

module.exports = { fetchStatsMatch };
