const express = require('express');
const app = express();
const port = process.env.PORT || 862;
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { createWorker } = require('tesseract.js');
const spawn = require("child_process").spawn;
const bluetooth = require('node-bluetooth');
 
// create bluetooth device instance
const device = new bluetooth.DeviceINQ();
device.on('finished',  console.log.bind(console, 'finished')).on('found', function found(address, name){
  console.log('Found: ' + address + ' with name ' + name);
}).scan();

app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
}));
app.use(bodyParser.json({limit: '50mb'}));

app.use(express.static('public'))
app.use(express.static('alldata'))

app.get('/', function(req, res){
    res.sendFile("./views/main.html", {root: __dirname});
});

app.get('/check/iscompleted', function(req, res){
    fs.readdir('./alldata', (err, files) => {
        if(err) throw err;
        var skiprest = false;
        files.forEach(file => {
            if(file.includes(req.headers["compcode"]) && file.includes(req.headers["match"]) && file.includes(req.headers["team"]) && !skiprest){
                res.send(JSON.stringify({"success" : true}));
                console.log("FOUND");
                skiprest = true;
            }
        });
        if(!skiprest){
            res.send(JSON.stringify({"success" : false}));
        }
    });
});

app.get('/get/formimages', function(req, res){
    fs.readdir('./public/images/formimages', (err, files) => {
        if(err) throw err;
        res.send(JSON.stringify({"forms" : files}));
    });
});

app.get('/get/dataimages', function(req, res){
    fs.readdir('./alldata', (err, files) => {
        if(err) throw err;
        res.send(JSON.stringify({"images" : files}));
    });
});

app.get('/get/matches', function(req, res){
    fs.readFile('./alldata/matchdata.json', (err, content) => {
        if(err) throw err;
        var object = JSON.parse(content);
        console.log(object[req.headers["compcode"]]);
        res.send(JSON.stringify({"matches" : object[req.headers["compcode"]]}));
    });
});

app.get('/get/compcodes', function(req, res){
    fs.readFile('./alldata/matchdata.json', (err, content) => {
        if(err) throw err;
        var object = JSON.parse(content);
        console.log(Object.keys(object));
        res.send(JSON.stringify({"codes" : Object.keys(object)}));
    });
});

app.post('/upload/scan', function(req, res){
    console.log("GOT IMAGE");
    console.log(req.body);
    
    fs.writeFile("./output/newimage.png", req.body["image"].replace(/^data:image\/png;base64,/, ""), "base64", function(err){
        if(err){
            console.log("Failed");
        }
        let py = spawn('python', ['./imageinterpretation.py', 'newimage.png']);
    });
    res.send(200);
});

app.post('/upload/digital', function(req, res){
    console.log("GOT DIGITAL");
    console.log(req.body);
    
    fs.writeFile("./alldata/" + req.body["compcode"] + "-" + req.body["match"] + "-" + req.body["team"] + " (" + req.body["form"] + ").png", req.body["image"].replace(/^data:image\/png;base64,/, ""), "base64", function(err){
        if(err){
            console.log("Failed");
        }
    });
    res.send(200);
});

// Set up the server
app.listen(port, () => {
    console.log(`Your Glare Tracking system is running on port ${port}`);
});
