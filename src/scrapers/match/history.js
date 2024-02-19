const axios = require('axios');
const cheerio = require('cheerio');

const fetchMatchIds = async (teamId) => {
    // Validate input
    if (!teamId.match(/^[0-9]+$/)) throw new Error("Invalid ID");

    try {
        // Fetch the page
        const response = await axios.get(`https://www.vlr.gg/team/matches/${teamId}`);
        // Parse the page
        const $ = cheerio.load(response.data);

        // Get all Matches
        const matchIds = [];
        const matchLinks = $(".col.mod-1 .wf-card a");

        matchLinks.each((i, element) => {
            const href = $(element).attr("href");
            const matchId = href.split('/')[1]; // Assuming the match ID is always the second element after split
            if (matchId && matchId.match(/^[0-9]+$/)) { // Ensure that matchId is defined and only numbers are pushed as IDs
                matchIds.push(matchId);
}

            if (matchId.match(/^[0-9]+$/)) { // Ensure that only numbers are pushed as IDs
                matchIds.push(matchId);
            }
        });

        return matchIds;
    } catch (err) {
        throw err;
    }
};

module.exports = { fetchMatchIds };
