var deferredPrompt;
if('serviceWorker' in navigator){
	navigator.serviceWorker.register('/sw.js')
	.then(function(){
		console.log("service worker registered");
	});
}

window.addEventListener('beforeinstallprompt',function(event){
event.preventDefault();
deferredPrompt=event;
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

fetch('https://httpbin.org/ip')
.then(function(res){
	return res.json();
}).then(function(data){
	console.log(data);
}).catch(function(err){
	console.log(err);
});

fetch('https://httpbin.org/post',{
	method:'POST',
	headers:{
		'Content-Type':'application/json',
		'Accept':'application/json'
	},
	body:JSON.stringify({message:"First Fetch post request"});
}).then(function(res){
	console.log(res.json());
}).catch(function(err){
	console.log(err);
});
