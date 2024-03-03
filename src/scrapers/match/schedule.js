const axios = require('axios');
const cheerio = require('cheerio');

const fetchScheduleIds = async () => {
    try {
        const response = await axios.get(`https://www.vlr.gg/matches`);
        const $ = cheerio.load(response.data);

        // Log the beginning of the HTML content to check
        console.log($.html().substring(0, 500));

        const matchIds = [];
        const matchLinks = $("a[href*='/matches/']");

        // If no match links are found, log an appropriate message
        if (matchLinks.length === 0) {
            console.log('No match links found with the current selector.');
            return matchIds; // Return an empty array as there are no match IDs
        }

        matchLinks.each((i, element) => {
            const href = $(element).attr("href");
            const matchId = href.split('/')[2];
            if (matchId && /^\d+$/.test(matchId)) {
                matchIds.push(matchId);
            }
        });

        console.log('Match IDs fetched:', matchIds);
        return matchIds;
    } catch (err) {
        console.error(`Error fetching match IDs: ${err}`);
        throw err;
    }
};

module.exports = { fetchScheduleIds };

