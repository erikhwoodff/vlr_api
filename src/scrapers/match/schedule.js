const axios = require('axios');
const cheerio = require('cheerio');

const fetchScheduleIds = async () => {
    console.log('Starting to fetch schedule IDs...');
    try {
        console.log('Sending request to vlr.gg/matches...');
        const response = await axios.get(`https://www.vlr.gg/matches`);
        console.log('Response received, loading HTML into cheerio...');
        const $ = cheerio.load(response.data);

        console.log('Selecting match links from HTML...');
        // Select anchor tags that have an href attribute starting with "/" followed by digits
        const matchLinks = $("div.wf-card a[href^='/'][href*='/']");

        // If no match links are found, log an appropriate message
        if (matchLinks.length === 0) {
            console.log('No match links found with the current selector.');
            return []; // Return an empty array as there are no match IDs
        }

        console.log(`Found ${matchLinks.length} match links, extracting IDs...`);
        const matchIds = matchLinks.map((i, element) => {
            const href = $(element).attr('href');
            // The match ID is the numeric part right after the first "/"
            const matchId = href.split('/')[1];
            console.log(`Processing href: ${href}`); // Log the href being processed
            if (/^\d+$/.test(matchId)) { // Make sure it's a number
                console.log(`Match ID: ${matchId}`); // Log the match ID
                return matchId;
            }
        }).get().filter(id => id); // Remove undefined values and convert to an array

        console.log('Match IDs fetched:', matchIds);
        return matchIds;
    } catch (err) {
        console.error(`Error fetching match IDs: ${err}`);
        throw err;
    }
};

module.exports = { fetchScheduleIds };


