const express = require('express');
const app = express();
const port = process.env.PORT || 862;
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { createWorker } = require('tesseract.js');
const spawn = require("child_process").spawn;

app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
}));
app.use(bodyParser.json({limit: '50mb'}));


app.get('/', function(req, res){
    res.sendFile("./views/main.html", {root: __dirname});
});

app.post('/upload/scan', function(req, res){
    console.log("GOT IMAGE");
    console.log(req.body);
    
    fs.writeFile("./output/newimage.png", req.body["image"].replace(/^data:image\/png;base64,/, ""), "base64", function(err){
        if(err){
            console.log("Failed");
        }
        spawn('python', ['./imageinterpretation.py', 'newimage.png']);
    });
    res.send(200);
});

// Set up the server
app.listen(port, () => {
    console.log(`Your Glare Tracking system is running on port ${port}`);
});
