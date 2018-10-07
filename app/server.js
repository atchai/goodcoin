const http = require('http');
var fs = require('fs');
var path = require('path');

let port = 3001;
let hostname = '127.0.0.1';

http.createServer(function (request, response) {
  console.log('request ', request.url);
  
  var url = request.url;

  if (url == '/') {
    url = '/index.html';
  }

  console.log("url="+url);
  var filePath = '.app/src/' + url;
  
  console.log("filePath="+filePath);
  console.log("process.cwd()="+process.cwd());

  var extname = String(path.extname(filePath)).toLowerCase();
  var mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.gif': 'image/gif',
      '.wav': 'audio/wav',
      '.mp4': 'video/mp4',
      '.woff': 'application/font-woff',
      '.ttf': 'application/font-ttf',
      '.eot': 'application/vnd.ms-fontobject',
      '.otf': 'application/font-otf',
      '.svg': 'application/image/svg+xml'
  };

  var contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, function(error, content) {
      if (error) {
          if(error.code == 'ENOENT') {
              fs.readFile('./404.html', function(error, content) {
                  console.error("error: file not found");
                  response.writeHead(200, { 'Content-Type': contentType });
                  response.end(content, 'utf-8');

              });
          }
          else {
            console.error("error! code="+error.code);
              response.writeHead(500);
              response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
              response.end();
          }
      }
      else {
          response.writeHead(200, { 'Content-Type': contentType });
          console.log(content);
          response.end(content, 'utf-8');
      }
  });

}).listen(port);
console.log(`Server running at http://hostname:port/`);
