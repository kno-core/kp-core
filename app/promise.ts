let promises = [];
let n = new Promise(function(resolve){
	console.log('DOING ACTIOn');
	resolve(true);
}).then(function(v){
	console.log('THENNING', v);
});


promises.push(n);
Promise.all(promises).then(function(){
	console.log('last');
});