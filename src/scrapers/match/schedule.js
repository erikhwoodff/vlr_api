const axios = require('axios');
const cheerio = require('cheerio');

const fetchScheduleIds = async () => {
    try {
        // Fetch the page
        const response = await axios.get(`https://www.vlr.gg/matches`);
        const $ = cheerio.load(response.data);
        const matchIds = [];
        
        // Target only <a> elements that contain 'matches' in the href attribute
        const matchLinks = $("a[href*='/matches/']");

        matchLinks.each((i, element) => {
            const href = $(element).attr("href");
            console.log(`Processing href: ${href}`);
            
            // Extract the match ID, which is the number after 'matches/'
            const matchId = href.split('/')[2]; // Assuming the number after 'matches/' is the ID
            if (matchId && /^\d+$/.test(matchId)) { // Check if extracted part is a number
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

// Usage
fetchScheduleIds().then(matchIds => {
    console.log(matchIds);
}).catch(err => {
    console.error(err);
});
