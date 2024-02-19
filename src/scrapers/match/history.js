const fetchMatchIds = async (teamId) => {
    if (!teamId.match(/^[0-9]+$/)) throw new Error("Invalid ID");

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
            
            // Check if href is valid and contains numbers after /matches/
            const parts = href.split('/');
            const matchId = parts.length > 2 && parts[2].match(/^[0-9]+$/) ? parts[2] : null;
            console.log(`Extracted matchId: ${matchId}`);
            if (matchId) {
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

module.exports = { fetchMatchIds };
