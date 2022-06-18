const express = require("express")
const {set, card} = require('mtgsdk')
const axios = require('axios')
const {LocalStorage} = require('node-localstorage')

const app = express();
const port = 3000;
const storage = new LocalStorage('./scratch')

async function getAllCards(setCode){
    let returnArray = [];

    function recursiveleyFetchCards(count){
        return axios.get(`https://api.magicthegathering.io/v1/cards?set=${setCode}&page=${count}`).then(async (response) => {
            const cards = response.data.cards
            if(cards.length == 0){
                console.log(returnArray.length)
                return returnArray
            }else {
                returnArray = returnArray.concat(cards);
                await recursiveleyFetchCards(count+1)
            }
        })
    }
    await recursiveleyFetchCards(0)

    // get unique cards only
    let unique = []
    returnArray.forEach(card => {
        // console.log(c.name, card.name)
        if(unique.find(c => c.name == card.name) == undefined){
            unique.push(card)
        }
    })

    return unique
}

app.get("/set/:code", (req, res) => { 

    if(storage.getItem(`${req.params.code}`) != null){
        console.log("USED STORAGE")
        let cards = JSON.parse(storage.getItem(`${req.params.code}`))
        const sorted = cards.sort((a, b) => a.name > b.name ? 1 : (a.name < b.name ? -1 : 0))
        // console.log(sorted.map(card => card.name))

        const images = cards.reduce((prev, next) => prev +  '<img src= "' + next.imageUrl + `" alt = "${next.name}"/> <b>${next.name}</b>`, "")
        const html = `<!DOCTYPE html> 
            <html> 
            <head> 
                <title> MTG </title> 
            </head> 
            <body> 
                ${images}
            </body>
            </html>`;
        res.send(html)
    } else {

        console.log("FETCHED DATA")
    getAllCards(req.params.code).then(cards => {

        const sorted = cards.sort((a, b) => a.name > b.name ? 1 : (a.name < b.name ? -1 : 0))
        // console.log(sorted.map(card => card.name))
        storage.setItem(`${req.params.code}`, JSON.stringify(sorted))

        const images = cards.reduce((prev, next) => prev +  '<img src= "' + next.imageUrl + `" alt = "${next.name}"/> <b>${next.name}</b>`, "")
        const html = `<!DOCTYPE html> 
            <html> 
            <head> 
                <title> MTG </title> 
            </head> 
            <body> 
                ${images}
            </body>
            </html>`;
        res.send(html)
    })
    }

})


// app.get("/test", (req, res)=> {

//     // const cs = []
//     // card.all({set: 'SNC'}).on('data', (card) => {
//     //     cs.append(card)
//     //     console.log(card.name)
//     // });

//     // let it = 0

//     // function getAllCards(){
//     //    let cards = []
//     // }

//     // api request
//     // if not empty, do again


//     // axios.get("https://api.magicthegathering.io/v1/cards?set=SNC&page=2").then(res => console.log(res.data.cards[10].name))

//     // console.log("hi: ", get())


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

app.listen(port, () => {
    console.log(`App listening on port ${port}!`)
    storage.clear()
})

// set.find('SNC')
// .then(result => {
//     const set = result.set
//     console.log(set.name) // "Streets of New Capenna"
//     console.log(set)

//     // const pack = mtg.generateBooster('SNC')

// }).error(err => console.log(err))

