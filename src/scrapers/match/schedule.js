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
        // Select anchor tags within elements that have the class 'wf-card'
        const matchLinks = $("div.wf-card > a[href*='/matches/']");

        // If no match links are found, log an appropriate message
        if (matchLinks.length === 0) {
            console.log('No match links found with the current selector.');
            return []; // Return an empty array as there are no match IDs
        }

        console.log(`Found ${matchLinks.length} match links, extracting IDs...`);
        const matchIds = matchLinks.map((i, element) => {
            const href = $(element).attr('href');
            console.log(`Processing href: ${href}`); // Log the href being processed
            // Extract the match ID from the href
            const matchIdParts = href.split('/');
            const matchId = matchIdParts[1]; // The match ID is the second part of the URL path
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

