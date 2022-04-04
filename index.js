//const txt = require('./data');
//const path = require('path');
// __dirname - D:\web\TEST\nodejs
// __filename - D:\web\TEST\nodejs\index.js
// path.join() and add / between + .. (windows / linux \)
// path.resolve() - D:\web\TEST\nodejs  !absolute path from relative
// path.parse()

//const siteURL = 'http://localhost:8080/users?id=5123';

//const fs = require('fs');

// it sync func - blocked!
//fs.mkdirSync(path.resolve(__dirname, 'dir', 'dir2', 'dir3'), {recursive: true});
// fs.mkdir(path.resolve(__dirname, 'dir'), (err, ) => {
//   if(err){
//     console.log(err);
//     //return;
//   }
//   else {
//     console.log('folder created!');
//   }
// });

//

// fs.appendFile(path.resolve(__dirname, 'text.txt'), ' added', (err) => {
//   if(err){console.log(err)}
// });

//console.log(path.resolve());

//const fsPromise = require('fs/promises');

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');

const app = express();

app.use(cors());
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());
// Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/files', (req, res) => {
  fs.readdir(path.join(__dirname, 'files'), (err, files) => {
    if (err) {
      if (err.code == 'ENOENT') {
        fs.mkdir(path.join(__dirname, 'files'), (err) => {
          if (err) {
            res.json({ message: err.code }, 500);
          } else {
            res.json(
              {
                message: 'Success',
                files: [],
              },
              200
            );
          }
        });
      } else {
        res.json({ message: err.code }, 500);
      }
    } else {
      res.json(
        {
          message: 'Success',
          files: files,
        },
        200
      );
    }
  });
});

app.get('/api/files/:filename', (req, res) => {
  const filename = req.params.filename;
  if (/\.(log|txt|json|yaml|xml|js)$/i.test(filename)) {
    const filepath = path.join(__dirname, 'files', filename);
    fs.readFile(filepath, 'utf8', (err, filedata) => {
      if (err) {
        if (err.code == 'ENOENT') {
          res.json({ message: `File ${filename} does not exist` }, 400);
        } else {
          res.json({ message: err.code }, 500);
        }
      } else {
        fs.stat(filepath, (err, stats) => {
          if (err) {
            res.json({ message: err.code }, 500);
          } else {
            res.json(
              {
                message: 'Success',
                filename: filename,
                content: filedata,
                extension: path.extname(req.params.filename).slice(1),
                uploadedDate: stats.birthtime,
              },
              200
            );
          }
        });
      }
    });
  } else {
    res.json({ message: 'Wrong file extension' }, 400);
  }
});

app.post('/api/files', (req, res) => {
  const filename = req.body.filename;
  if (filename && /\.(log|txt|json|yaml|xml|js)$/i.test(filename)) {
    fs.writeFile(
      path.join('files', filename),
      req.body.content ? req.body.content : '',
      (err) => {
        if (err) {
          res.json({ message: err.code }, 500);
        } else {
          res.json({ message: 'File created successfully' }, 200);
        }
      }
    );
  } else {
    if (!filename) {
      res.json({ message: "Please specify 'filename' parameter" }, 400);
    } else {
      res.json({ message: 'Wrong file extension' }, 400);
    }
  }
});

app.listen(8080);
