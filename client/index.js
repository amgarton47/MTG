// const axios = require("axios");
// import axios from "axios";

console.log("hi");

const showCards = async () => {
  //   const { data } = await axios.get("/set/snc");
  //   console.log("here", data);
  //   data.forEach((card) => {
  //     console.count("h");
  //     const element = document.createElement("img");
  //     console.count("d");
  //     element.setAttribute("src", card.imageUrl);
  //     console.count("s");
  //     document.body.append(element);
  //   });
  //   console.log("here?");
  // data.map((card) => {
  //   const element = document.createElement("img");
  //   element.setAttribute("src", card.imageUrl);
  //   document.body.append(element);
  // });

  fetch("/set/snc", {
    // headers: {
    //   "Set-Cookie": "application/json",
    // },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);

      //   document.getElementsByClassName("loading")[0].toggleAttribute("loading");

      data.map((card) => {
        const element = document.createElement("img");
        element.setAttribute("src", card.imageUrl);
        document.body.append(element);
      });

      document.getElementsByClassName("loading")[0].toggleAttribute("loading");
    });

  //   axios.get("/set/snc").then(({ data }) =>
  //     data.map((card) => {
  // const element = document.createElement("img");
  // element.setAttribute("src", card.imageUrl);
  // document.body.append(element);
  //     })
  //   );
};

showCards();
