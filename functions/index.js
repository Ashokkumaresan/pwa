var functions = require('firebase-functions');
var admin=require('firebase-admin');
var cors=require('cors')({origin:true});
var webpush=require('web-push');
var formidable=require('formidable');
var UUID=require('uuid-v4');
var fs=require('fs');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var serviceAccount = require("./pwademo.json");

var gcconfig={
  projectId:'pwademo-563fd',
  keyFilename:'pwademo.json'
};

var gcs=require('@google-cloud/storage')(gcconfig);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pwademo-563fd.firebaseio.com"
});

 exports.storePostData = functions.https.onRequest(function(request, response){
  cors(request,response,function(){
    var uuid=UUID();
    var formData=new formidable.IncomingForm();
    formData.parse(request,function(err,fields,files){
      fs.rename(files.file.path,'/tmp/'+files.file.name);
      var bucket=gcs.bucket('pwademo-563fd.appspot.com');

      bucket.upload('/tmp/'+files.file.name,{
        uploadType:'media',
        metadata:{
          metadata:{
            contentType:files.file.type,
            firebaseStorageDownloadTokens:uuid
          }
        }
      },
        function(err,file){
          if(!err){
                admin.database().ref('posts').push({
                    id:fields.id,
                    title:fields.title,
                    location:fields.location,
                    image:'https://firebasestorage.googleapis.com/v0/b/'+bucket.name +'/o/'+ encodeURIComponent(file.name)+'?alt=media&token='+uuid
              })
            .then(function(){
              webpush.setVapidDetails('mailto:ashok1989.stone@gmail.com','BO6vhr7zgUKE3Xzl1T-hdYwpXV1KbcPRfVYF_cV305Kt3Vx3GMrhw3oSYMIhizOmflvFYRjEQOaM6KA1MNDyza4','1P_S5HUPyOHmXokIS43t_lqxH_1kWnjXOcp3eWtAczs');
              return admin.database().ref('subscription').once('value');
              //response.status(201).json({message:'Data stored',id:request.body.id});
            })
            .then(function(subscriptions){
              subscriptions.forEach(function(sub){
                var pushConfig={
                  endpoint:sub.val().endpoint,
                  keys:{
                    auth:sub.val().keys.auth,
                    p256dh:sub.val().keys.p256dh
                  }
            };
            webpush.sendNotification(pushConfig,JSON.stringify({title:'PWAapp Title',content:'First Post to the app'}))
             .catch(function(err){
                console.log("Error while sending notifications",err);
             })
          });
            response.status(201).json({message:'Data stored',id:fields.id});
        })
      .catch(function(err){
        response.status(500).json({error:err});
      }); 
          }else{
            console.log(err)
          }
        }
      )
    });
 	
  });
 });
