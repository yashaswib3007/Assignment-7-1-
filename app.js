var express = require("express");
var bodyParser = require('body-parser')
var mongoose = require('mongoose');


//Set up default mongoose connection
var mongoDB = 'mongodb://127.0.0.1:27017/my_database';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


var app = express();
  app.listen(3333, () => {
      console.log("Server running on port 3333");
  });


var Schema = mongoose.Schema;

var UserSchema = new Schema({
  Email: {
    type:   String,
    //unique: true,
    required: 'Email address is required',
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  Password: {
    type: String,
    min: [6],
    max: 12,
    required: [true, 'Password too weak'],
    match : [/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/, 'Password Should Include 1 upper case and 1 special character']

 }
});

var UserModel = mongoose.model('UserModel', UserSchema );


app.post("/user/create", bodyParser.json(), (req, res) => {
    
    console.log(req.body.Email)
    var User_instance = new UserModel(req.body);
    let errorr = User_instance.validateSync()

    if(errorr){
      if (errorr.name == 'ValidationError') {
        for (field in errorr.errors) {
            console.log("** ",errorr.errors[field].message); 
            res.status(400)
            res.send(errorr.errors[field].message)
            return
        }
      }
    }

  
    UserModel.count({"Email": req.body.Email}, function (err, count){ 
      if(count>0){
          res.status(400)
          res.send("Email ID already exists")
          return
      }else{
        User_instance.save(function (err) {
          if (err)  {
            console.log("Error ",err)
            if(err.name == "MongoError"){
              console.log("Du")
            }
          }
          else{
            res.send("Success")
            
            console.log("Success")
            
          }
        });
      }

    }); 
     
   });

   
   app.put("/user/edit", bodyParser.json(), (req, res) => {
    
    console.log(req.body.Email)
    var User_instance = new UserModel(req.body);
    let errorr = User_instance.validateSync()

    if(errorr){
      if (errorr.name == 'ValidationError') {
        for (field in errorr.errors) {
            console.log("** ",errorr.errors[field].message); 
            res.status(400)
            res.send(errorr.errors[field].message)
            return
        }
      }
    }


    UserModel.find({"Email": req.body.Email}, function (err, count){ 
      console.log('c ',count)
      if(count.length > 0){
        //console.log(typeof(count._id))
        if((count[0]._id) != req.body.id){
            //document exists });
            res.status(400)
            res.send("Email ID already exists")
            
        }else{
          let newDoc = UserModel.findOneAndUpdate({_id: req.body.id}, req.body, function(err, Users){         
            if(err){
              res.send(err)
 
            }
            else{
             UserModel.find({},(err, Users)=>{
               if(err)
                 res.send(err)
               else
                 res.send(Users)
             })
            }
         });
        }
     }
    else{
          let newDoc = UserModel.findOneAndUpdate({_id: req.body.id}, req.body, function(err, Users){         
           if(err){
             res.send(err)

           }
           else{
            UserModel.find({},(err, Users)=>{
              if(err)
                res.send(err)
              else
                res.send(Users)
            })
           }
        });
        
      }
  }); 
  

   });


   app.get("/user/getAll",bodyParser.json(),(req, res) =>{

      console.log("Get called")

      UserModel.find({},(err, Users)=>{
        if(err){
          res.status(400)
          res.send(err)
        }
        else
          res.send(Users)
      })
   })

   app.delete("/user/delete", bodyParser.json(), (req, res) =>{

      console.log("Delete called")
      UserModel.find({"Password": req.body.Password},(err, Users)=>{
        if(err)
          res.send(err)
        if (Users.length ==0){
          res.send("Password not found in the database. Enter a valid password")
          return;
        }else{
          UserModel.findOneAndDelete({"Password": req.body.Password}, function(err,Users){

            if(err){
              res.status(400)
              res.send(err)
             
            }else{
              UserModel.find({},(err, Users)=>{
                if(err)
                  res.send(err)
                else
                  res.send(Users)
              })
            }
          })
        }
          
      })

     

   })