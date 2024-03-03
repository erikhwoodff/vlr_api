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
        // We target any 'a' element with an href attribute containing '/matches/', inside 'div.wf-card'
        const matchLinks = $("div.wf-card a[href*='/matches/']");

        // If no match links are found, log an appropriate message
        if (matchLinks.length === 0) {
            console.log('No match links found with the current selector.');
            return []; // Return an empty array as there are no match IDs
        }

        console.log(`Found ${matchLinks.length} match links, extracting IDs...`);
        const matchIds = matchLinks.map((i, element) => {
            const href = $(element).attr('href');
            // Split the href by '/' and get the second element (index 1), which should be the match ID
            const matchId = href.split('/')[0];
            console.log(`Match ID: ${matchId}`); // Log the match ID
            return matchId;
        }).get(); // Convert cheerio object to array

        console.log('Match IDs fetched:', matchIds);
        return matchIds;
    } catch (err) {
        console.error(`Error fetching match IDs: ${err}`);
        throw err;
    }
};

module.exports = { fetchScheduleIds };

