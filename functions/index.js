var functions = require('firebase-functions');
var admin=require('firebase-admin');
var cors=require('cors')({origin:true});
var webpush=require('web-push');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var serviceAccount = require("./pwademo.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pwademo-563fd.firebaseio.com"
});

 exports.storePostData = functions.https.onRequest(function(request, response){
  cors(request,response,function(){
  	admin.database().ref('posts').push({
  		id:request.body.id,
  		title:request.body.title,
  		location:request.body.location,
  		image:request.body.image
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
            response.status(201).json({message:'Data stored',id:request.body.id});
        })
      .catch(function(err){
      	response.status(500).json({error:err});
      });  	
  });
 });
