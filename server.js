const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(3000).sockets;

//connect to mongoDB
mongo.connect('mongodb://127.0.0.1/mongochat',function(err,db){
   if(err){
       throw err;
   }else{
       console.log('MongoDB connected');

       //connect to socket.io
       client.on('connection',function () {
            let chat=db.collection('chats');

            //create function to send status
            sendStatus = function(s){
                socket.emit('status',s);
            }

            //get chats from mongo collection
            chat.find().limit(100).sort({_id:1}).toArray(function (err,res) {
                if(err){
                    throw errr;
                }else{
                    //emit the messages
                    socket.emit('output',res);
                }
            });

            //Handle input events
            socket.on('input',function (data) {
                let name = data.name;
                let message = data.message;

                //check for name and message
                if(name === '' || message === ''){
                    //send error status
                    sendStatus('Please enter name and message');
                }else{
                    //insert msg
                    chat.insert({name:name, message:message}, function () {
                        client.emit('output',[data]);

                        //send status object
                        sendStatus({
                           message:'message sent',
                            clear: true
                        });
                    });
                }
            });
            //handle clear
           socket.on('clear',function (data) {
                //remove all chats from the collection
               chat.remove({},function(){
                  //emit clear
                   socket.emit('cleared');
               });
           });
       });
   }
});