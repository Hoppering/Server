var express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const FileType = require('file-type');
const { Console } = require('console');

var app = express();

var messagesAll = [];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        const { originalname } = file;
        cb(null, originalname);
    }
})

function getFiles()
{
    var filesAll = [];
    fs.readdirSync('./uploads/').forEach(file => {
        filesAll.push(file);
      })


    var fileFull = [];
    for(var i = 0; i < filesAll.length; i++)
    {
        fileFull.push({
            id: i,
            name: filesAll[i],
            path:path.join(__dirname + "\\uploads\\" + filesAll[i])
        });
    }

    return fileFull;
}

function addMessage(message)
{
    var timeNow = new Date();
    messagesAll.push({
        text: message,
        time: timeNow.getHours() + ":" + timeNow.getMinutes() + ":" +  timeNow.getSeconds() 
    });
}

const upload = multer({ storage });
app.use(express.static('public'))

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    var fileFull = [];
    fileFull = getFiles();

    res.render('pages/download', {
        files: fileFull,
    });
});

app.get('/upload', function(req, res) {
    res.render('pages/upload');
});

app.get('/messages', function(req, res) {
    res.render('pages/messages',{
        messages: messagesAll,
    });
});


app.post('/fileDelete/:id', function(req, res) {
    var fileFull = [];
    fileFull = getFiles();

    var req1 = parseInt(req.params['id']);

    for(var i = 0; i < fileFull.length; i++)
    {
        if(req1 == fileFull[i]["id"])
        {
            fs.unlinkSync(fileFull[i]['path']);
            fileFull.splice(i,1);
        }
    }

    res.render('pages/download', {
        files: fileFull,
    });
});

app.get('/file/:id', async function(req, res){

    var fileFull = [];
    fileFull = getFiles();

    var req1 = parseInt(req.params['id']);
    var filePath;
    var fileType;

    for(var i = 0; i < fileFull.length; i++)
    {
        if(req1 == fileFull[i]["id"])
        {
            filePath = fileFull[i]['path'];
            fileType = await (await FileType.fromFile(filePath)).mime;
        }
    }
     
    var stat = fs.statSync(filePath);

    var readStream = fs.createReadStream(filePath);
    res.writeHead(200, {
        'Content-Type': fileType,
        'Content-Length': stat.size 
    });
    readStream.pipe(res);
    });

    app.post('/upload', upload.array('fileUpload'), (req, res) => {
        res.render('pages/upload');
    });

    app.post('/messageSend', upload.array('mes'), (req, res) => {
        addMessage(req.body['mes']);
        res.render('pages/messages',{
            messages: messagesAll,
        });
    });

app.listen(8080);
console.log('8080 is the magic port');
