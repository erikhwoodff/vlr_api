const axios = require('axios');
const cheerio = require('cheerio');

function cleanString(str) {
    return str.replace(/[\n\t]/g, '').trim().replace(/\s\s+/g, ' ');
}

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
                        if ($(playerElement).find(".mod-player").text().trim() === "") return;
                    
                        const Player = {};
                        const playerNameWithExtra = $(playerElement).find(".mod-player").text();
                        const playerName = cleanString(playerNameWithExtra); // Cleaned player name
                        
                        const playerLink = $(playerElement).find(".mod-player a").attr("href");
                        Player.player_id = playerLink ? playerLink.split('/')[2] : null;

                        const playerAgentImage = $(playerElement).find(".mod-agents img").attr("title");
                        Player.agent = playerAgentImage ? playerAgentImage.trim() : null;
                        
                        Player.stats = {};
                    
                        // Extract each stat for the player
                        $(playerElement).find("td[class*='mod-stat']").each((statIndex, statElement) => {
                            // Safely get the class name containing the stat
                            const classList = $(statElement).attr('class').split(' ');
                            const statClass = classList.find(cls => cls.includes('mod-vlr'));
                            // If a statClass isn't found, or doesn't contain a '-', skip this element
                            if (!statClass || !statClass.includes('-')) return;
                        
                            const statNameParts = statClass.split('-');
                            // Check if statNameParts has the expected length
                            if (statNameParts.length < 3) return;
                        
                            const statName = statNameParts[2]; // This is the stat name
                            let statValue = $(statElement).find('.stats-sq').text();
                        
                            // Clean up the statValue by removing newlines, tabs, and multiple spaces
                            statValue = statValue.replace(/[\n\t]+/g, '').trim(); // Remove newlines and tabs
                            statValue = statValue.replace(/\s\s+/g, ' '); // Replace multiple spaces with a single space
                        
                            Player.stats[statName] = statValue;
                        });
                    
                        game.players.push(Player);
                    });

                    // Add the game object to the Match.games array
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
