const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

async function MakeFetch(url, options) {
    return new Promise(function (resolve, reject) {
        fetch(url, options).then(response => response.text()).then((response) => {
            resolve(response);
        }).catch(function (err) {
            reject(err);
        });
    });
}


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


async function fetchAndStore(pageNum, tv = true, last) {
    let html = await MakeFetch(`https://fmovies.app/${tv ? "tv-show" : "movie"}?page=${pageNum}`);
    const tempDOM = new JSDOM(html).window.document;
    let data = [];
    let section = tempDOM.querySelectorAll(".flw-item");
    for (var i = 0; i < section.length; i++) {
        let current = section[i];
        let dataCur = {
            "image": "",
            "link": "",
            "name": "",
        };
        let poster = current.querySelector(".film-poster");
        let detail = current.querySelector(".film-detail");
        let additionalInfo = current.querySelectorAll(".fdi-item");
        let temlLink = poster.querySelector("a").getAttribute("href");
        if (temlLink.includes("http")) {
            temlLink = (new URL(temlLink)).pathname;
        }
        dataCur.image = poster.querySelector("img").getAttribute("data-src");
        dataCur.link = temlLink;
        dataCur.name = detail.querySelector(".film-name").textContent.trim();

        try {
            dataCur.season = additionalInfo[0].textContent;
        } catch (err) {

        }

        try {
            dataCur.episode = additionalInfo[1].textContent;
        } catch (err) {

        }
        data.push(dataCur);
    }

    fs.writeFileSync("movie.json",
        JSON.stringify(data) + (last ? "" : "," ),
        {
            encoding: "utf8",
            flag: "a+",
            mode: 0o666
        });
}

async function ini() {

    fs.writeFileSync("movie.json",
    "[",
    {
        encoding: "utf8",
        flag: "a+",
        mode: 0o666
    });

    let pages = 1190;
    // let pages = 1;

    for (let i = 1; i <= pages; i++) {
        let last = (i == (pages));
        await fetchAndStore(i, false, last);
        console.log(i);
    }

    fs.writeFileSync("movie.json",
    "]",
    {
        encoding: "utf8",
        flag: "a+",
        mode: 0o666
    });
}
ini();