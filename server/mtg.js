const express = require("express");
// const { set, card } = require("mtgsdk");
const axios = require("axios");
const { LocalStorage } = require("node-localstorage");

const app = express();
const port = 3000;
const storage = new LocalStorage("./scratch");
const MTG_URL = "https://api.magicthegathering.io/v1/";

const imagify = (cards) => {
  const images = cards.reduce(
    (prev, next) =>
      prev +
      '<img src= "' +
      next.imageUrl +
      `" alt = "${next.name}"/> <b>${next.name}</b>`,
    ""
  );
  return `<!DOCTYPE html>
                    <html>
                    <head>
                        <title> MTG </title>
                    </head>
                    <body>
                        ${images}
                    </body>
                    </html>`;
};

async function getAllCards(setCode) {
  let returnArray = [];

  function recursiveleyFetchCards(count) {
    return axios
      .get(`${MTG_URL}cards?set=${setCode}&page=${count}`)
      .then(async (response) => {
        const cards = response.data.cards;
        if (cards.length == 0) {
          console.log(returnArray.length);
          return returnArray;
        } else {
          returnArray = returnArray.concat(cards);
          await recursiveleyFetchCards(count + 1);
        }
      });
  }
  await recursiveleyFetchCards(0);

  // get unique cards only
  let unique = [];
  returnArray.forEach((card) => {
    // console.log(c.name, card.name)
    if (unique.find((c) => c.name == card.name) == undefined) {
      unique.push(card);
    }
  });

  return unique;
}

app.get("/set/:code", async (req, res) => {
  const setCode = req.params.code;

  let cards;
  if (storage.getItem(`${setCode}`) != null) {
    console.log("USED STORAGE");
    cards = JSON.parse(storage.getItem(`${setCode}`));
  } else {
    console.log("DID NOT USE STORAGE");
    cards = await getAllCards(setCode);

    const sorted = cards.sort((a, b) =>
      a.name > b.name ? 1 : a.name < b.name ? -1 : 0
    );
    storage.setItem(`${req.params.code}`, JSON.stringify(sorted));
  }

  res.send(imagify(cards));
});

app.get("/card/:name", async (req, res) => {
  const name = req.params.name;
  const { data } = await axios.get(`${MTG_URL}/cards?name=${name}`);
  res.send(imagify(data.cards));
});

app.get("/booster/:setCode", async (req, res) => {
  const setCode = req.params.setCode;
  const { data } = await axios.get(`${MTG_URL}/sets/${setCode}/booster`);
  res.send(imagify(data.cards));
});

app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
  // storage.clear()
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
