var functions = require('firebase-functions');
var admin=require('firebase-admin');
var cors=require('cors')({origin:true});
var webpush=require('web-push');
var formidable=require('formidable');
var fs=require('fs');
var UUID=require('uuid-v4');
var os = require("os");
var Busboy = require("busboy");
var path = require('path');

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
    const busboy = new Busboy({ headers: request.headers });
    var upload;
    const fields = {};
    busboy.on("file",function(fieldname, file, filename, encoding, mimetype){
      // fields[fieldname] = val;
       const filepath = path.join(os.tmpdir(), filename);
      upload = { file: filepath, type: mimetype };
      file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
      fields[fieldname] = val;
    });

    busboy.on('finish',function(){
        var bucket=gcs.bucket('pwademo-563fd.appspot.com');
      bucket.upload(upload.file,{
        uploadType:'media',
        metadata:{
          metadata:{
            contentType:upload.type,
            firebaseStorageDownloadTokens:uuid
          }
        }
      },
        function(err,uploadedFile){
          if(!err){
            // response.status(201).json({message:'Data stored',id:fields.id});
                admin.database().ref('posts').push({
                    id:fields.id,
                    title:fields.title,
                    location:fields.location,
                    image:'https://firebasestorage.googleapis.com/v0/b/'+bucket.name +'/o/'+ encodeURIComponent(uploadedFile.name)+'?alt=media&token='+uuid
              })
            .then(function(){
              webpush.setVapidDetails('mailto:ashok1989.stone@gmail.com','BDh2JjowM9kzNJKrz4T3HXWaSP88vCBFLl6ao44sfE6XAgJlYpNsn_yRk1h959hFNIvlpR2XJB57w_0inI_mEOM','qsHU_TyEtU39CaaK3W0uyu0_aJmJOsBF9EPfpnzEAK4');
              return admin.database().ref('subscription').once('value');
              //response.status(201).json({message:'Data stored',id:request.body.id});
            })
            .then(function(subscriptions){
             /* subscriptions.forEach(function(sub){
                var pushConfig={
                  endpoint:sub.val().endpoint,
                  keys:{
                    auth:sub.val().keys.auth,
                    p256dh:sub.val().keys.p256dh
                  }
            };
            webpush.sendNotification(pushConfig,JSON.stringify({title:'PWAapp Title',content:'First Post to the app',openUrl:'/help'}))
             .catch(function(err){
                console.log("Error while sending notifications",err);
             })
          }); */
                 var pushConfig={
                  endpoint:"https://fcm.googleapis.com/fcm/send/fcTTMX7huKc:APA91bHiBwH-AtF2T3lE4VCnmhqdyEwyakdPn8RAawOwwkTLgV7X_WGaz4lNnqaUD0rM5w6-PGglc_gSj5nRnHFZCuYZOEdTtPyoOQ8C3adwHkHP1hcLWfxQQU24OFX3TXsOmxlJXHP5",
                  keys:{
                    auth:"QEYqN5benhN9wTKlGXgeVA==",
                    p256dh:"BLNqqAxWkgPONur7BUBA_nLJzoceSKkyWbOgm3Wsq_WWjzszonbWSE6GRLK0xnBoQNAtSagSYSRsNNKjtGCxFPA="
                  }
            };
            webpush.sendNotification(pushConfig,JSON.stringify({title:'PWAapp Title',content:'First Post to the app',openUrl:'/help'}))
             .catch(function(err){
                console.log("Error while sending notifications",err);
             })
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
   
 	   busboy.end(request.rawBody);
  });
 });

exports.storeImages=functions.https.onRequest(function(request,response){
  cors(request,response,function(){

          var pushConfig={
              endpoint:"https://fcm.googleapis.com/fcm/send/eRCJEdL0kL0:APA91bERUwonsDhcNOXeTgJiYWYEwkcb_VY5rer7ecG55qInzTLVan7CBR3NI0N9qjHoPgJ_CAGZ0ZycpqZqjjLaMUZE25lIdPvxAV2FSlG2fyybfrQgwl0lgwKQIL7DFHlRz8xgXsc5",
                keys:{
                  auth:"zpGUKBVzOKIU5IBe3aRK0A==",
                  p256dh:"BNBctp74b-4A3NXD5VTCsgwqvbTB-fJm7XvteL_o5EfGZNM2lpXDlrzVzKRCUCCiP3boN-mo3R0iTaEJ_lpzxMY="
                  }
            };
    webpush.setVapidDetails('mailto:ashok1989.stone@gmail.com','BDh2JjowM9kzNJKrz4T3HXWaSP88vCBFLl6ao44sfE6XAgJlYpNsn_yRk1h959hFNIvlpR2XJB57w_0inI_mEOM','qsHU_TyEtU39CaaK3W0uyu0_aJmJOsBF9EPfpnzEAK4');

    webpush.sendNotification(pushConfig,JSON.stringify({title:'PWAapp Title',content:'First Post to the app',openUrl:'/help'}))
       .catch(function(err){
                console.log("Error while sending notifications",err);
             });
   /* var uuid=UUID();
    const busboy = new Busboy({ headers: request.headers });
    var upload;
    const fields = {};
    busboy.on("file",function(fieldname, file, filename, encoding, mimetype){
      // fields[fieldname] = val;
       const filepath = path.join(os.tmpdir(), filename);
      upload = { file: filepath, type: mimetype };
      file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
      fields[fieldname] = val;
    });


    busboy.on('finish',function(){
         var bucket=gcs.bucket('pwademo-563fd.appspot.com');
      bucket.upload(upload.file,{
        uploadType:'media',
        metadata:{
          metadata:{
            contentType:upload.type,
            firebaseStorageDownloadTokens:uuid
          }
        }
      },
      function(err,file){
        if(!err){
            console.log("uploaded");
            }
          else{
               console.log("error");
            }
      }

    )
      busboy.end(request.rawBody);
  }); */
 response.status(201).json({message:'Data stored',id:"notification"});
});
});
