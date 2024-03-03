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

    // Extracting player names for all teams
    const allPlayers = $(".vm-stats-game[data-game-id='all'] .wf-table-inset.mod-overview .mod-player").map((i, playerElem) => {
        let playerName = $(playerElem).find('.text-of').text().trim(); // Grab the clean player's name
        // Clean up the player's name further if necessary
        playerName = playerName.replace(/[^\w\s]/gi, '').trim(); // Adjust regex as needed
        return playerName;
    }).get();

    // Split the players into two groups of five
    const teamOnePlayers = allPlayers.slice(0, 5);
    const teamTwoPlayers = allPlayers.slice(5, 10);

    // Associate the players with their respective teams
    const teamDetails = teams.map((teamName, index) => {
        return {
            name: teamName,
            players: index === 0 ? teamOnePlayers : teamTwoPlayers
        };
    });

    return {
        matchId,
        datetime,
        teams: teamDetails
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
