const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");
const { get } = require('http');


let data = JSON.parse(fs.readFileSync("movie.json"));
data = data.flat();
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

async function getInfo(url){
    let data = {};
    
    try{
        let html = await MakeFetch(`https://fmovies.app${url}`);
        const tempDOM = new JSDOM(html).window.document;
        let info = tempDOM.querySelectorAll(".row-line");
        for(let i = 0; i < info.length; i++){
            let text = info[i].textContent.trim();
            let key = text.substringBefore(":").trim();
            let value = text.substringAfter(":").trim();
            data[key] = value;
        }
    }catch(err){
        fs.writeFileSync("error.json",
        url + ",",
        {
            encoding: "utf8",
            flag: "a+",
            mode: 0o666
        });
    }

    return data;

}


async function handleReq(i){
    let idSplit = data[i].link.split("-");
    let id = parseInt(idSplit[idSplit.length - 1]);

    data[i].id = id;
    data[i].info = await getInfo(data[i].link);
    console.log(i);
    fs.writeFileSync("movie2.json",
    JSON.stringify(data[i]) + ",",
    {
        encoding: "utf8",
        flag: "a+",
        mode: 0o666
    });
}

async function ini(){
    let promises = [];

    fs.writeFileSync("movie2.json",
    "[",
    {
        encoding: "utf8",
    });

    for(let i = 0; i < data.length; i++){
        promises.push(handleReq(i));

        if(i%10 == 0 || i == (data.length - 1)){
            await Promise.all(promises);
        }
    }

    fs.writeFileSync("movie2.json",
    "{}]",
    {
        encoding: "utf8",
        flag: "a+",
        mode: 0o666
    });

    



}



ini();