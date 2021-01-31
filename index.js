const axios = require("axios");
const cheerio = require("cheerio");
const _ = require("lodash");

const notify = require("./notify").notify;

const URL = "https://www.zeltazivtina.lv/zz-bonusu-klubs/";

let previous = [];

const scrapeButtons = () => {
  axios
    .get(URL)
    .then((response) => {
      const html = response.data;

      const $ = cheerio.load(html);
      const butons = $(".pogz").map((index, elem) => {
        return elem.attribs;
      });

      if (previous.length > 0) {
        const diff = _.difference(previous, butons);

        if (diff.length > 0) {
          if (diff.length > 1) {
            notify(`We many changes!`, URL);
          } else {
            notify(`We have a single change!`, diff[0].href);
          }
          previous = butons;
          console.log(`${new Date()}: Changes found!`);
        } else {
          console.log(`${new Date()}: No changes found`);
        }

        previous = butons;
      } else {
        console.log("Nothing to compare against.");
        previous = butons;
      }
    })
    .catch((e) => {
      console.log(e);
    });
};

scrapeButtons();

setInterval(() => {
  scrapeButtons();
}, 60 * 1000);
