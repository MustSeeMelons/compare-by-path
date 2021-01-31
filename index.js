const axios = require("axios");
const cheerio = require("cheerio");
const _ = require("lodash");
const nodemailer = require("nodemailer");
const conf = require("./config").credentials;

const notify = require("./notify").notify;

const mail = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: conf.senderEmail,
    pass: conf.senderPassword,
  },
});

const URL = "https://www.zeltazivtina.lv/zz-bonusu-klubs/";

let counter = 0;
let previous = [];

const arrDiff = (arr, otherArr) => {
  const main = arr.length >= otherArr.length ? arr : otherArr; // 2 > 1 -> arr
  const other = arr.length < otherArr.length ? arr : otherArr; // 2 < 1 -> otherArr

  const diff = [];
  main.forEach((obj) => {
    if (
      !other.some((otherObj) => {
        return _.isEqual(obj, otherObj);
      })
    ) {
      diff.push(obj);
    }
  });

  return diff;
};

const scrapeButtons = () => {
  axios
    .get(URL)
    .then(async (response) => {
      console.log(`${new Date()}: Iter ${counter}`);
      const html = response.data;

      const $ = cheerio.load(html);
      const butons = $(".pogz")
        .map((_index, elem) => {
          return {
            href: elem.attribs.href,
            class: elem.attribs.class,
          };
        })
        .toArray()
        .sort();

      if (previous.length > 0) {
        const diff = arrDiff(previous, butons);

        if (diff.length) {
          console.log(`${new Date()}: Changes count: ${diff.length}`);

          await mail.sendMail({
            priority: "high",
            to: conf.recieverEmail,
            subject: conf.subject,
            text: `Go to: ${URL} if you see something!`,
          });

          if (diff.length > 1) {
            notify(`We many changes!`, URL);
          } else {
            notify(`We have a single change!`, diff[0].href);
          }

          console.log(`${new Date()}: Changes found!`);
        } else {
          console.log(`${new Date()}: No changes found`);
        }
      } else {
        console.log(`${new Date()}: Nothing to compare against.`);
      }
      previous = butons;
      counter++;
    })
    .catch((e) => {
      console.log(e);
    });
};

scrapeButtons();

setInterval(() => {
  scrapeButtons();
}, 60 * 1000);
