var express = require('express');
var server = require('express')();
var http = require('http').createServer(server);
var io = require('socket.io');
var path = require('path');
var child_process = require('child_process');

io = io.listen(http);

server.get("/",function(req, res){
    res.sendFile("/home/andrew/Documents/vk_site/Frontend/index.html");
    console.log("page got\n");
});

server.use(express.static(path.join(__dirname, '../Frontend/')));

io.sockets.on('connection', function (socket) {
    console.log("User connected to Socket.IO");
    var serch_proc = null;
    
	socket.on('serchEvent', function (data) {
		console.log(data);
        var from = data.start;
        var to = data.destination;
        serch_proc = runPython(from, to,
        function(err, data){
            if(data){
                console.log("Sending data");
                socket.emit('serchInProgressEvent', data);
            }
        },
        function(result){
            socket.emit('serchResultEvent', result);
        });
    });
    
    socket.on('stopSerchEvent',function(){
        if(serch_proc){
            serch_proc.kill();
        }
    });
    
	socket.on('disconnect', function() {
        if(serch_proc){
            serch_proc.kill();
        }
        console.log('user disconnected\n');
	});
});

function runPython(from, dest, dataCallback, resultCallback){
    var finalResult = `DONE found from ${from} to ${dest}`;
    var serch_proc = child_process.spawn(`python3.5`,["python/main.py", from, dest]);
    serch_proc.stdout.setEncoding('utf-8');
    serch_proc.stderr.setEncoding('utf-8');
    
    serch_proc.stdout.on('data',function(data) {
        dataCallback(null, data);
        finalResult = data; 
    });

    serch_proc.stderr.on('data',function(error){
        dataCallback(error);
    });

    serch_proc.on('exit', function(){
        console.log("Python script exit.");
        resultCallback(finalResult);
    });
    
    serch_proc.on('close',function(code, signal){
        console.log("Closing python.");
    });
    
    return serch_proc;
}

http.listen(9999,function(){
    console.log("Server started!!!");
});
