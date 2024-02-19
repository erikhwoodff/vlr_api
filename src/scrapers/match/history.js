const axios = require('axios');
const cheerio = require('cheerio');

const fetchMatchIds = async (teamId) => {
    // ...rest of your code

    try {
        // ...rest of your code to fetch the page

        const $ = cheerio.load(response.data);
        const matchIds = [];
        // Target only <a> elements within divs with the class "mod-dark"
        const matchLinks = $("div.mod-dark a");

        matchLinks.each((i, element) => {
            const href = $(element).attr("href");
            // Log the href value for debugging
            console.log(`Processing href: ${href}`);
            // Extract the numerical part of the href if it's in the correct format
            const matchId = href && href.split('/')[1].match(/^[0-9]+$/) ? href.split('/')[1] : null;
            // Log the extracted matchId for debugging
            console.log(`Extracted matchId: ${matchId}`);
            if (matchId) {
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
