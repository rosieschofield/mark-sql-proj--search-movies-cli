const { question, keyInSelect } = require("readline-sync");
const { Client } = require("pg");

//As your database is on your local machine, with default port,
//and default username and password,
//we only need to specify the (non-default) database name.
async function findMovies() {
    const client = new Client({ database: 'omdb' });
    console.log("Welcome to search-movies-cli!");
    await client.connect()
    const options = ['search', 'see favourites', 'quit'];
    let optionIndex = keyInSelect(options, 'Choose an Action:',  {cancel: false});
    while (optionIndex!==2){
        if (optionIndex===0){
            let movieTitle = question("Search for a movie title: ").toLowerCase();
            try{
                const res = await client.query("SELECT id, name, date, runtime, budget, revenue, vote_average, votes_count FROM movies WHERE lower(name) LIKE $1 AND kind = $2 ORDER BY date DESC LIMIT 10", [`%${movieTitle}%`, 'movie'])
                res.rows.length>0 && console.table(res.rows)
                let favOptions = res.rows.map((e:MovieFormat)=>e.name)
                let favIndex = keyInSelect(favOptions, 'Choose a movie to favourite: ');
                if (favIndex!==-1){
                    console.log(`Saving ${res.rows[favIndex].name} to favorites`)
                    const response = await client.query("INSERT INTO favourites (movie_id) VALUES ($1)", [res.rows[favIndex].id])
                }
            } catch (error){
                console.log("oops there was an error ! ")
                //console.error(error);
            }
        } else if (optionIndex===1) {
            try{
            const res = await client.query("SELECT movies.id, movies.name, movies.date, movies.runtime, movies.budget, movies.revenue, movies.vote_average, movies.votes_count FROM favourites LEFT JOIN movies ON movies.id = favourites.movie_id")
            console.table(res.rows);
            } catch (error){
                console.log("oops there was an error ! ")
                //console.error(error);
            }
        }
        optionIndex = keyInSelect(options, 'Choose an Action:', {cancel: false});
        } 
    await client.end()
}

interface MovieFormat {
    id: string;
    name: string;
    date: string;
    runtime: number;
    budget: string;
    revenue: string;
    vote_average: string|null;
    votes_count: string|null;
  }

findMovies()
