var deferredPrompt;
var read_flag=false;
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