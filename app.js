const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Mongo URI //using MLabs
const url='mongodb+srv://sujith4488:sujith1234@@cluster0-b4qca.mongodb.net/ExamNotes';
const tempUrl='mongodb://localhost:27017/ExamNotes';
const mongoURI = url;

// Create mongo connection
const conn = mongoose.createConnection(mongoURI,{useNewUrlParser:true});




// Init gfs
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
        const filename = req.body.fileName;
        const bucketName=req.body.upload_option+req.body.upload_option1;
        //console.log(bucketName);
        const fileInfo = {
          filename: filename,
          bucketName: (bucketName)
        };
        resolve(fileInfo);
    });
  }
});

const upload = multer({ storage });

// const info=new mongoose.Schema({

// })


app.get("/:dep/:sem",(req,res)=>{

    let dep=req.params.dep;
    let sem=req.params.sem;
    const collection=dep+sem;
    //console.log(collection);
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection(collection);

    gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render('subjects', { files: false });
    } else {
      files.map(file => {});
      //console.log(collection);
      res.render('subjects', { files: files ,urlName:collection});
    }
  });

});

// @route GET /
// @desc Loads form
app.get('/', (req, res) => {
  res.render("home");
});

app.get("/upload",(req,res)=>{
  res.render("upload");
});

// @route POST /upload
// @desc  Uploads file to DB
app.post('/upload', upload.single('file'), (req, res) => {
  // res.json({ file: req.file });
  res.render('successfull');
});



// @route GET /files/:filename
// @desc  Display single file object
app.get('/notes/:path/:filename', (req, res) => {

  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection(req.params.path);
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    // File exists
    const readstream = gfs.createReadStream(file.filename);
    console.log(readstream.pipe(res));
  });
});



app.get("/:dep",(req,res)=>{
  const dep=req.params.dep;
  //console.log("images/"+dep+"Sem1.jfif");
  res.render("departments/"+dep);
});


// @route DELETE /files/:id
// @desc  Delete file
app.delete('/notes/files/:id', (req, res) => {
  gfs.remove({ _id: req.params.id, root: name }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }

    res.redirect('/');
  });
});

let port=process.env.PORT;
if(port==null || port==""){
  port=3000;
}

app.listen(port, () => console.log(`Server started on port ${port}`));
