

// External Libs
const axios = require('axios');
const cheerio = require('cheerio');

const fetchGamesMatch = async (matchId) => {
  return new Promise(async (resolve, reject) => {
    axios.get(`https://www.vlr.gg/${matchId}`)
      .then((response) => {
        let $ = cheerio.load(response.data);
        const Match = {};

        Match.match_id = matchId;
        Match.games = [];

        // Find each game within the match
        $(".vm-stats-gamesnav-item.js-map-switch[data-game-id]").each((i, element) => {
          const game_id = $(element).attr("data-game-id");
          const mapNumber = $(element).data("href").split('=')[1];

          // Skip if the game_id or mapNumber is 'all'
          if (game_id === "all" || mapNumber === "all") return;

          // Find the corresponding map name using the game_id
          let mapNameSelector = `.vm-stats-container .vm-stats-game[data-game-id='${game_id}'] .map`;
          let mapName = $(mapNameSelector).text().trim().split("\t")[0].trim();

          // Find the team details
          let gameDetails = $(`.vm-stats-container .vm-stats-game[data-game-id='${game_id}']`);
          let teamNames = gameDetails.find(".team-name").map((idx, el) => $(el).text().trim()).get();
          let mod_cts = gameDetails.find(".mod-ct").map((idx, el) => $(el).text().trim()).get();
          let mod_ts = gameDetails.find(".mod-t").map((idx, el) => $(el).text().trim()).get();
          let mod_ots = gameDetails.find(".mod-ot").map((idx, el) => $(el).text().trim()).get();

          // Construct the games array with all the details
          Match.games.push({
            game_id: game_id,
            map_name: mapName,
            map_number: mapNumber,
            teams: [
              {
                name: teamNames[0],
                mod_ct: mod_cts[0],
                mod_t: mod_ts[0],
                mod_ot: mod_ots[0] || "0" // Assuming '0' if OT score is not available
              },
              {
                name: teamNames[1],
                mod_ct: mod_cts[1],
                mod_t: mod_ts[1],
                mod_ot: mod_ots[1] || "0" // Assuming '0' if OT score is not available
              }
            ]
          });
        });

        resolve(Match);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

module.exports = { fetchGamesMatch };
