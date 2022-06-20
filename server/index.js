const express = require("express");
const path = require("path");
// const { set, card } = require("mtgsdk");
const axios = require("axios");
const morgan = require("morgan");
const { LocalStorage } = require("node-localstorage");

const app = express();
const port = 3000;

const storage = new LocalStorage(__dirname + "/scratch");
const MTG_URL = "https://api.magicthegathering.io/v1/";

async function getAllCards(setCode) {
  let returnArray = [];

  function recursiveleyFetchCards(count) {
    return axios
      .get(`${MTG_URL}cards?set=${setCode}&page=${count}`)
      .then(async (response) => {
        const cards = response.data.cards;
        if (cards.length < 100) {
          returnArray = returnArray.concat(cards);
          console.log(returnArray.length);
          return returnArray;
        } else {
          returnArray = returnArray.concat(cards);
          await recursiveleyFetchCards(count + 1);
        }
      });
  }
  await recursiveleyFetchCards(1);

  // get unique cards only
  let unique = [];
  returnArray.forEach((card) => {
    // console.log(c.name, card.name)
    if (unique.find((c) => c.name == card.name) == undefined) {
      unique.push(card);
    }
  });

  console.log("unique: " + unique.length);
  return returnArray;
}
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/set/:code", async (req, res) => {
  const setCode = req.params.code;
  let cards, sorted;
  if (false && storage.getItem(`${setCode}`) != null) {
    console.log("USED STORAGE");
    cards = JSON.parse(storage.getItem(`${setCode}`));
  } else {
    console.log("DID NOT USE STORAGE");
    cards = await getAllCards(setCode);
    // sorted = cards.sort((a, b) =>
    //   a.name > b.name ? 1 : a.name < b.name ? -1 : 0
    // );
    // storage.setItem(`${req.params.code}`, JSON.stringify(sorted));
  }

  res.send(cards);
});

app.get("/card/:name", async (req, res) => {
  const name = req.params.name;
  const { data } = await axios.get(`${MTG_URL}/cards?name=${name}`);
  res.send(data);
});

app.get("/booster/:setCode", async (req, res) => {
  const setCode = req.params.setCode;
  const { data } = await axios.get(`${MTG_URL}/sets/${setCode}/booster`);
  res.send(data);
});

app.use("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public/index.html"));
});

app.use((err, req, res, next) => {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || "Internal server error.");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
  storage.clear();
});

// Examples of using the sdk

//     card.where({set: 'SNC', page: 2}).then(cards => {
//         // console.log(cards.length)
// const sorted = cards.sort((a, b) => a.name > b.name ? 1 : (a.name < b.name ? -1 : 0))
// const images = sorted.reduce((prev, next) => prev +  '<img src= "' + next.imageUrl + `" alt = "${next.name}"/>`, "")

//         const html = `<!DOCTYPE html>
//             <html>
//             <head>
//                 <title> MTG </title>
//             </head>
//             <body>
//                 ${images}
//             </body>
//             </html>`;

//         res.send(html)
//     })
// })

// set.find('SNC')
// .then(result => {
//     const set = result.set
//     console.log(set.name) // "Streets of New Capenna"
//     console.log(set)

//     // const pack = mtg.generateBooster('SNC')

// }).error(err => console.log(err))
