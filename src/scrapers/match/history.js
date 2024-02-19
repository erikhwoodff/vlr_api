const axios = require('axios');
const cheerio = require('cheerio');

const fetchMatchIds = async (teamId) => {
    if (!teamId.match(/^[0-9]+$/)) {
        throw new Error("Invalid ID");
    }

    try {
        // Fetch the page
        const response = await axios.get(`https://www.vlr.gg/team/matches/${teamId}`);
        const $ = cheerio.load(response.data);
        const matchIds = [];
        
        // Target only <a> elements within divs with the class "mod-dark"
        const matchLinks = $("div.mod-dark a");

        matchLinks.each((i, element) => {
            const href = $(element).attr("href");
            console.log(`Processing href: ${href}`);
            
            // Split the href and extract the match ID, which is the second segment
            const parts = href.split('/');
            // Check if the second segment is a number, which is the match ID
            if (parts.length > 1 && /^\d+$/.test(parts[1])) {
                const matchId = parts[1];
                matchIds.push(matchId);
                console.log(`Extracted matchId: ${matchId}`);
            }
        });

        console.log('Match IDs fetched:', matchIds);
        return matchIds;
    } catch (err) {
        console.error(`Error fetching match IDs: ${err}`);
        throw err;
    }
};

module.exports = { fetchMatchIds };
