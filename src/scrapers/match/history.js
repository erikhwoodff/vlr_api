const axios = require('axios');
const cheerio = require('cheerio');

const fetchMatchIds = async (teamId) => {
    if (!teamId.match(/^[0-9]+$/)) throw new Error("Invalid ID");

    try {
        const response = await axios.get(`https://www.vlr.gg/team/matches/${teamId}`);
        const $ = cheerio.load(response.data);
        const matchIds = [];
        const matchLinks = $(".col.mod-1 .wf-card a");

        matchLinks.each((i, element) => {
            const href = $(element).attr("href");
            console.log(`Processing href: ${href}`); // Log the href value
            const matchId = href ? href.split('/')[1] : null;
            console.log(`Extracted matchId: ${matchId}`); // Log the extracted matchId
            if (matchId && matchId.match(/^[0-9]+$/)) {
                matchIds.push(matchId);
            }
        });

        return matchIds;
    } catch (err) {
        console.error(`Error fetching match IDs: ${err}`);
        throw err;
    }
};


module.exports = { fetchMatchIds };
