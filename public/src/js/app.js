var deferredPrompt;
var read_flag=false;
var push_noti_btn=document.querySelectorAll('.enable-notifications');

if('serviceWorker' in navigator){
	navigator.serviceWorker.register('/sw.js')
	.then(function(){
		console.log("service worker registered");
	});
}

window.addEventListener('beforeinstallprompt',function(event){
	deferredPrompt=event;
event.preventDefault();
return false;
});

var promise=new Promise(function(resolve,reject){
	setTimeout(function(){
		var _res=Math.floor((Math.random() * 100) + 1);
		if(_res%2==0)
			resolve("Even Number");
		else
			reject({code:500,msg:"Odd Number"});
	},3000)
});

promise.then(function(txt){
	console.log("first return "+txt);
	return txt;
}).then(function(txt){
	console.log("second return "+txt);
}).catch(function(err){
	console.log(err.code,err.msg);
});

fetch('https://pwademo-563fd.firebaseio.com/posts.json')
.then(function(res){
	read_flag=true;
	return res.json();
}).then(function(data){
	for(var _dt in data){
		load_shared_date(data[_dt]);
}
}).catch(function(err){
	console.log(err);
});

if('indexedDB' in window){
	read_data('posts').then(function(data){
		if(!read_flag){
			console.log("From cache:"+data);
			load_shared_date(data);
		}
	});
}

fetch('https://httpbin.org/post',{
	method:'POST',
	headers:{
		'Content-Type':'application/json',
		'Accept':'application/json'
	},
	body:JSON.stringify({message:"First Fetch post request"})
}).then(function(res){
	console.log(res.json());
}).catch(function(err){
	console.log(err);
});

function load_shared_date(_data){
	console.log(_data);
	var _img_holder=document.querySelector('#shared-moments');
	var _img=document.createElement("img");
	_img.setAttribute("src",_data.image);
	_img_holder.append(_img);
}

function askfornotification(){
	Notification.requestPermission(function(result){
		console.log("User Choice",result);
		if(result!=='granted'){
			console.log('Denied Notification');
		}
		else{
			console.log('Notification Accepted');
			//displayNotification();
			configurePushSubscription();
		}
	});
}

function displayNotification(){
	var options={
		body:'First Notification Message',
		icon:'/src/images/icons/app-icon-96x96.png',
		image:'/src/images/mapps.png',
		dir:'ltr',
		lang:'en-US',
		vibrate:[100,50,200],
		badge:'/src/images/icons/app-icon-96x96.png',
		tag:'confirm-notification',
		renotify:true,
		actions:[
				{ action:'confirm',title:'Okay',icon:'/src/images/icons/app-icon-96x96.png'},
				{ action:'cancel',title:'Cancel',icon:'/src/images/icons/app-icon-96x96.png'}
		]
	};
	if('serviceWorker' in navigator){
		navigator.serviceWorker.ready
			.then(function(swreg){
				swreg.showNotification('Successfiully Subscribed from service worker',options);
			});
	}
	else{
 new Notification('Successfiully subscribed',options);
}
}

function configurePushSubscription(){
	if(!('serviceWorker' in navigator)){
		return false;
	}	
	var reg;
	navigator.serviceWorker.ready
		.then(function(swreg){
			reg=swreg;
			return swreg.pushManager.getSubscription();
		})
		.then(function(sub){
			if(sub===null){
				//Create new subscription
				var vapidPublicKey='BDh2JjowM9kzNJKrz4T3HXWaSP88vCBFLl6ao44sfE6XAgJlYpNsn_yRk1h959hFNIvlpR2XJB57w_0inI_mEOM';
				var convertedvapidkey=urlBase64ToUint8Array(vapidPublicKey);
				return reg.pushManager.subscribe({
					userVisibleOnly:true,
					applicationServerKey:convertedvapidkey
				});
			}
			else{
				// Existing subscription
			}
		})
			.then(function(newSub){
				return fetch('https://pwademo-563fd.firebaseio.com/subscription.json',{
					method:'POST',
					headers:{
						'Content-Type':'application/json',
						'Accept':'application/json'
					},
					body:JSON.stringify(newSub)
				})
			})
			  .then(function(res){
			  	if(res.ok){
			  		displayNotification();
			  	}
			  })
			    .catch(function(err){
			    	console.log("Error sending subscription",err);
			    });
	
}

if('Notification' in window && 'serviceWorker' in navigator){
	for(var i=0;i<push_noti_btn.length;i++){
		push_noti_btn[i].style.display='inline-block';
		push_noti_btn[i].addEventListener('click',askfornotification);
	}
}