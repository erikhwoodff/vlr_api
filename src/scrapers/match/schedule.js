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

    // Extracting player names for each team
    const teamPlayers = $(".vm-stats-game[data-game-id='all'] .wf-table-inset.mod-overview").map((index, element) => {
        const playerNames = $(element).find('.mod-player').map((i, playerElem) => {
            let playerName = $(playerElem).find('.text-of').text().trim(); // This should grab the player's name cleanly
            // Remove any additional text such as team tags if they are not part of the actual name
            return playerName.replace(/[^\w\s]/gi, '').trim(); // Adjust regex as necessary
        }).get().slice(0, 5); // Take only the first 5 players for each team
        return playerNames;
    }).get();

    // Assuming there are only two teams, associate the players with the correct teams
    if (teams.length === 2) {
        return {
            matchId,
            datetime,
            teams: [
                { name: teams[0], players: teamPlayers[0] },
                { name: teams[1], players: teamPlayers[1] }
            ]
        };
    } else {
        // Handle cases where there are not exactly two teams
        console.error('Unexpected number of teams found');
        return { matchId, datetime, teams: [] };
    }
};

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
