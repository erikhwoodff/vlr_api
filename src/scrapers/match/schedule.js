const axios = require('axios');
const cheerio = require('cheerio');

const fetchScheduleIds = async () => {
    try {
        const response = await axios.get(`https://www.vlr.gg/matches`);
        const $ = cheerio.load(response.data);
        const matchIds = [];
        
        const matchLinks = $("a[href*='/matches/']");
        
        matchLinks.each((i, element) => {
            const href = $(element).attr("href");
            const matchId = href.split('/')[2];
            if (matchId && /^\d+$/.test(matchId)) {
                matchIds.push(matchId);
            }
        });

        return matchIds;
    } catch (err) {
        console.error(`Error fetching match IDs: ${err}`);
        throw err;
    }
};

module.exports = fetchScheduleIds;
