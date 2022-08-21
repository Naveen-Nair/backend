const express = require("express");
const req = require("express/lib/request");
const app = express();

const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({extended:true}))

const md5 = require("md5");

const mongoose = require("mongoose")
mongoose.connect("mongodb://localhost:27017/urlDB")

const urlSchema = new mongoose.Schema ({
    url: String,
    hashedURL : String
})

const Url = mongoose.model('Url',urlSchema)

app.get("/",(req,res)=>{
    res.send('hello')
})

app.post("/",(req,res)=>{
    let fullURL = req.body.url;

    let hashedURL = md5(fullURL);

    console.log("posted")

    const urlObj = new Url ({
        url:fullURL,
        hashedURL:hashedURL
    })

    urlObj.save()

    res.send(`http://localhost:3000/${hashedURL}`)
})

app.get("/:url",(req,res)=>{
    let hashedURL = String(req.params.url);

    console.log(hashedURL)

    Url.findOne({hashedURL: hashedURL},(err,urlObj)=>{
        if(err){
            console.log(err)
        }else{
            res.send(urlObj.url)
        }
    })

})

app.listen(3000,()=>{
    console.log("Server started at node 3000")
  })
  