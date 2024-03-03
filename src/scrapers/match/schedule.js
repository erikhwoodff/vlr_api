const axios = require('axios');
const cheerio = require('cheerio');

const fetchScheduleIds = async () => {
    console.log('Starting to fetch schedule IDs...');
    const response = await axios.get(`https://www.vlr.gg/matches`);
    const $ = cheerio.load(response.data);

    const matchLinks = $("div.wf-card a[href^='/'][href*='/']");
    const matchIds = matchLinks.map((i, element) => {
        const href = $(element).attr('href');
        const matchId = href.split('/')[1];
        if (/^\d+$/.test(matchId)) {
            return matchId;
        }
    }).get().filter(id => id);

    console.log('Match IDs fetched:', matchIds);
    return matchIds;
};

const fetchMatchDetails = async (matchId) => {
    const matchUrl = `https://www.vlr.gg/${matchId}`;
    const response = await axios.get(matchUrl);
    const $ = cheerio.load(response.data);

    const datetime = $(".moment-tz-convert[data-utc-ts]").first().attr("data-utc-ts");
    const teams = $(".match-header-link-name .wf-title-med").map((i, elem) => $(elem).text().trim()).get();

    // Assuming there's only one game per match page for simplicity
    const game_id = 1; // If there are multiple, you'll need to adjust this
    const players = $(`.vm-stats-container .vm-stats-game[data-game-id='${game_id}'] .wf-table-inset.mod-overview tr`).map((playerIndex, playerElement) => {
        const playerNameWithExtra = $(playerElement).find(".mod-player").text().trim();
        // Assuming cleanString is a function you've defined to clean the player name
        const playerName = playerNameWithExtra; // Use your cleanString function instead if needed
        return playerName;
    }).get();

    return {
        matchId,
        datetime,
        teams,
        players
    };
};

const fetchSchedule = async () => {
    try {
        const matchIds = await fetchScheduleIds();
        const scheduleDetails = []; // Initialize an array to hold all match details

        for (const matchId of matchIds) {
            const matchDetails = await fetchMatchDetails(matchId);
            scheduleDetails.push(matchDetails); // Add the details to the array
        }

        return scheduleDetails; // Return the array containing all the match details
    } catch (err) {
        console.error('An error occurred:', err);
        throw err; // Rethrow the error to be handled by the caller
    }
};

module.exports = { fetchSchedule };
module.exports = { fetchSchedule };
