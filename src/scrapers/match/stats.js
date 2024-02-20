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

                // Initialize the players array
                Match.players = [];

                // Iterate over each player row in the table
                $(".wf-table-inset.mod-overview tr").each((index, element) => {
                    if ($(element).find(".mod-player a div:nth-child(1)").text().trim() === "") return;

                    const Player = {};
                    Player.name = $(element).find(".mod-player a div:nth-child(1)").text().trim();
                    Player.team = $(element).find(".mod-player a div:nth-child(2)").text().trim();
                    Player.player_id = $(element).find(".mod-player a").attr("href").split('/')[2];
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

                    Match.players.push(Player);
                });

                resolve(Match);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

module.exports = { fetchStatsMatch };
