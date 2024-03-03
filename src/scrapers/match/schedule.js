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

    // Extracting datetime
    const datetime = $(".moment-tz-convert[data-utc-ts]").first().attr("data-utc-ts");

    // Extracting team names
    const teams = $(".match-header-link-name .wf-title-med").map((i, elem) => {
        return { name: $(elem).text().trim(), players: [] };
    }).get();

    // Extracting player names for each team
    $(`.vm-stats-game[data-game-id='all'] .wf-table-inset.mod-overview`).each((index, element) => {
        if (index < 2) { // Assuming there are only two teams per match
            const playerNames = $(element).find('.mod-player').map((i, playerElem) => {
                return $(playerElem).text().trim();
            }).get().slice(0, 5); // Take only the first 5 players for each team
            teams[index].players = playerNames;
        }
    });

    return {
        matchId,
        datetime,
        teams
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
