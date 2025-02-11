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

    // Extracting team names and IDs
    const teams = $(".match-header-link").map((i, elem) => {
        const teamName = $(elem).find('.wf-title-med').text().trim();
        const href = $(elem).attr('href');
        const teamId = href.split('/')[2]; // The team ID is the third part of the URL path
        return {
            id: teamId,
            name: teamName,
            players: []
        };
    }).get();

    // Extracting player names and IDs for all teams
    $(".vm-stats-game[data-game-id='all'] .wf-table-inset.mod-overview .mod-player").each((i, playerElem) => {
        const playerLink = $(playerElem).find("a").attr("href");
        const playerId = playerLink ? playerLink.split('/')[2] : null;
        let playerName = $(playerElem).find('.text-of').text().trim(); // Grab the clean player's name
        playerName = playerName.replace(/[^\w\s]/gi, '').trim(); // Clean up the player's name

        // Assign the player to the corresponding team
        if (i < 5) {
            teams[0].players.push({ name: playerName, player_id: playerId });
        } else {
            teams[1].players.push({ name: playerName, player_id: playerId });
        }
    });

    return {
        matchId,
        datetime,
        teams
    };
};


// ... rest of the script


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
