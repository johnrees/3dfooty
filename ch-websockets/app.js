var filename = "REPLACE",
  password = "REPLACE";

var io = require('socket.io')(),
  fs = require('fs'),
  util = require('util'),
  stream = require('stream'),
  es = require('event-stream'),
  delay = 20,
  s,


console.log("STARTING SERVER ⚽");

require('socketio-auth')(io, {
  authenticate: function (socket, data, callback) {

    if (data.password == password) {
      return callback(null, true);
    } else {
      return callback(new Error("User not found"))
    }
  }
});


function readLine(line, startFromFrame, socket, callback) {
  var currentFrame = parseInt(line.split(":")[0]);
  if (currentFrame >= startFromFrame) {
    socket.emit('line', line);
    setTimeout(callback, delay);
  } else {
    callback()
  }
}

function sendFile(socket, frame, filename) {
  if (s) {
    s.destroy();
  }

  var lineNr = 0;
  console.log(delay);

  console.log(filename)

  s = fs.createReadStream(filename)
    .pipe(es.split())
    .pipe(es.mapSync(function(line){
      s.pause();
      lineNr += 1;
      readLine(line, frame, socket, s.resume);
    })
    .on('error', function(){
      console.log('Error while reading file.');
    })
    .on('end', function(){
      console.log('Read entire file.')
    })
  );
}

io.on('connection', function(socket){
  console.log("CLIENT CONNECTED 💃");


  socket.emit('welcome', { message: 'Welcome', id: socket.id });
  sendFile(socket, 0, filename);

  socket.on('disconnect', function(){
    console.log('client disconnected')
    socket.disconnect();
  });

  socket.on('changedelay', function(data) {
    delay = data;
  })

});

io.listen(8000);
