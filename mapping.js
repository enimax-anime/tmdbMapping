
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");
const { get } = require('http');
let data = JSON.parse(fs.readFileSync("movie2.json"));
let movie = true;


String.prototype.substringAfter = function substringAfter(toFind) {
    let str = this;
    let index = str.indexOf(toFind);
    return index == -1 ? "" : str.substring(index + toFind.length);
}

String.prototype.substringBefore = function substringBefore(toFind) {
    let str = this;
    let index = str.indexOf(toFind);
    return index == -1 ? "" : str.substring(0, index);
}

String.prototype.substringAfterLast = function substringAfterLast(toFind) {
    let str = this;
    let index = str.lastIndexOf(toFind);
    return index == -1 ? "" : str.substring(index + toFind.length);
}

String.prototype.substringBeforeLast = function substringBeforeLast(toFind) {
    let str = this;
    let index = str.lastIndexOf(toFind);
    return index == -1 ? "" : str.substring(0, index);
}

async function MakeFetch(url, options) {
    return new Promise(function (resolve, reject) {
        fetch(url, options).then(response => response.text()).then((response) => {
            resolve(response);
        }).catch(function (err) {
            reject(err);
        });
    });
}

let parsedData = {};

async function flixToTMDB(flixData){
    try{
        let year = (new Date(flixData.info["Released"])).getFullYear();
        let urlAPI = `https://api.themoviedb.org/4/search/${movie ? "movie" : "tv"}?api_key=5201b54eb0968700e693a30576d7d4dc&query=${flixData.name}&page=1&primary_release_year=${year}`;
        let releaseDateProperty = "release_date";

        if(!movie){
            releaseDateProperty = "first_air_date";
        }

        let searchRes = JSON.parse(await MakeFetch(urlAPI));

        if(searchRes.length == 1){
            return searchRes[0].id;
        }

        for(let i = 0; i < searchRes.results.length; i++){
            let curResult = searchRes.results[i];
            if(curResult[releaseDateProperty] == flixData.info["Released"]){
                return curResult.id;
            }
            let date = new Date(curResult[releaseDateProperty]);
            let flixDate = new Date(flixData.info["Released"]);
            // a month in milliseconds
            if(Math.abs(date - flixDate) < 2629746*1000){
                return curResult.id;
            }
        }
    }catch(err){
        console.error(err);
        console.log("Not found: ", flixData.name);

    }

    fs.writeFileSync("notfound.json",
    flixData.link + ",",
    {
        encoding: "utf8",
        flag: "a+",
        mode: 0o666
    });
    return null;
}


async function handleReq(i){
    data[i].tmdbID = await flixToTMDB(data[i]);
    parsedData[data[i].link] = data[i];
    console.log(i);
}

async function ini(){
    let promises = [];
    let forLast = data.length;
    // let forLast = 10;
    for(let i = 0; i < forLast; i++){

        promises.push(handleReq(i));

        if(i%100 == 0 || i == (forLast - 1)){
            await Promise.all(promises);
        }
    }

    fs.writeFileSync("movie3.json",
    JSON.stringify(parsedData),
    {
        encoding: "utf8",
    });
}

ini();