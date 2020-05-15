/*

	Author: Drew Carson 
	Project: Connor CV Web Portal
	File: populate.js
	
	Start Date: May 13, 2020
	Completion Date: 

	Populates the webpage with results from CV algorithm
	(provided in a JSON file).

*/



// define how many images to load at once
const CLIPPING_LENGTH_VT = 4;
const CLIPPING_LENGTH_HZ = 3;

// contains the JS object fetched from the JSON file
var RESULTS;

// Offset of results strips
var VT_OFFS = 0;

// Matrix containing offset values for all carousels
var MAT_OFFS = [];

// send request for JSON file & parse
var xmlhttp = new XMLHttpRequest();
// once a response has been received
xmlhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    RESULTS = JSON.parse(this.responseText);
    
	// initialize carousel offsets to 0
	MAT_OFFS = new Array(RESULTS.images.length);
	for(var i = 0; i < RESULTS.images.length; i++){
		MAT_OFFS[i] = new Array(2);
		MAT_OFFS[i][0] = 0;
		MAT_OFFS[i][1] = 0;
	}
	
	load();
  }
};
xmlhttp.open("GET", "js/results/ap-results.json", true);
xmlhttp.send();

// loads initial data into document
function load(){
	document.getElementById("main-content").innerHTML = '';
	
	// load data for the first CLIPPING_LENGTH_VT images
	for(var i = 0; i < CLIPPING_LENGTH_VT; i++){
		let resIdx = (VT_OFFS + i) % RESULTS.matrix.length;
		
		// create result strip
		let res = document.createElement("div");
		res.classList.add("result-display");
		
		// create/add query box
		let q_box= document.createElement("div");
		q_box.classList.add("query-box");
		
		// create/add query image to box
		let q_img = document.createElement("img");
		q_img.classList.add("query-img");
		q_img.src = RESULTS.dir + "/" + RESULTS.images[resIdx];
		q_box.appendChild(q_img);
		
		// create query caption
		let q_cap = document.createElement("div");
		q_cap.classList.add("query-caption");
		var txt = document.createTextNode("(" + (resIdx + 1) + ") " + RESULTS.images[resIdx]);
		q_cap.appendChild(txt);
		q_box.appendChild(q_cap);
		res.appendChild(q_box);
		
		/////////////////////////////////////
		///       Best Results Box        ///
		/////////////////////////////////////
		
		let br_box = document.createElement("div");
		br_box.classList.add("best-result-box");
		
		// create/add left chev
		let l_chev = document.createElement("img");
		l_chev.classList.add("scroll-left");
		l_chev.src = "img/chevron-left.png";
		l_chev.setAttribute("onclick", "scrollCar("+i+",0,-1)");
		br_box.appendChild(l_chev);
		
		// create/add result image wrapper
		let ri_wrap = document.createElement("span");
		ri_wrap.classList.add("result-img-wrap");
		
		// add result images 
		for(var j = 0; j < CLIPPING_LENGTH_HZ; j++){
			// create/add query box
			let r_box = document.createElement("div");
			r_box.classList.add("query-box");
			
			let rank = (MAT_OFFS[resIdx][0] + j) % RESULTS.matrix[resIdx].length;
			let imgIdx = RESULTS.matrix[resIdx][rank];
			
			// create/add result img
			let r_img = document.createElement("img");
			r_img.classList.add("query-img"); 
			r_img.src = RESULTS.dir + "/" + RESULTS.images[imgIdx];
			r_box.appendChild(r_img);
			r_box.appendChild(document.createElement("br"));
			
			// create/add check box
			let r_chk = document.createElement("img");
			r_chk.classList.add("check");
			r_chk.src = (RESULTS.labels[resIdx] == RESULTS.labels[imgIdx]) 
				? "img/check-small.png" : "img/x-mark-32.png";
			r_box.appendChild(r_chk);
		
			// create result caption
			let r_cap = document.createElement("div");
			r_cap.classList.add("query-caption");
			let r_txt = document.createTextNode("(" + (rank + 1) + ") " + RESULTS.images[imgIdx]);
			r_cap.appendChild(r_txt);
			r_box.appendChild(r_cap);
			ri_wrap.appendChild(r_box);
		}
		br_box.appendChild(ri_wrap);
		
		// create/add right chev
		let r_chev = document.createElement("img");
		r_chev.classList.add("scroll-right");
		r_chev.src = "img/chevron-right.png";
		r_chev.setAttribute("onclick", "scrollCar("+i+",0,1)");
		br_box.appendChild(r_chev);
		
		// add best results box
		res.appendChild(br_box);
		
		/////////////////////////////////////
		///       Worst Results Box       ///
		/////////////////////////////////////
		
		let wr_box = document.createElement("div");
		wr_box.classList.add("worst-result-box");
		
		// create/add left chev
		let l_chev2 = l_chev.cloneNode(true);
		l_chev2.setAttribute("onclick", "scrollCar("+i+",1,-1)");
		wr_box.appendChild(l_chev2);
		
		// create/add result image wrapper
		let ri_wrap2 = document.createElement("span");
		ri_wrap2.classList.add("result-img-wrap");
		
		// add result images 
		for(var j = 0; j < CLIPPING_LENGTH_HZ; j++){
			// create/add query box
			let r_box = document.createElement("div");
			r_box.classList.add("query-box");
			
			let rank = (2 * RESULTS.matrix[resIdx].length 
				- (MAT_OFFS[resIdx][1] + j + 1))
				% RESULTS.matrix[resIdx].length;
			let imgIdx = RESULTS.matrix[resIdx][rank];
			
			// create/add result img
			let r_img = document.createElement("img");
			r_img.classList.add("query-img"); 
			r_img.src = RESULTS.dir + "/" + RESULTS.images[imgIdx];
			r_box.appendChild(r_img);
			r_box.appendChild(document.createElement("br"));
			
			// create/add check box
			let r_chk = document.createElement("img");
			r_chk.classList.add("check");
			r_chk.src = (RESULTS.labels[i] == RESULTS.labels[imgIdx])
				? "img/check-small.png" : "img/x-mark-32.png";
			r_box.appendChild(r_chk);
			
			// create result caption
			let r_cap = document.createElement("div");
			r_cap.classList.add("query-caption");
			let r_txt = document.createTextNode("(" + (rank + 1) + ") " + RESULTS.images[imgIdx]);
			r_cap.appendChild(r_txt);
			r_box.appendChild(r_cap);
			ri_wrap2.appendChild(r_box);
		}
		wr_box.appendChild(ri_wrap2);
		
		// create/add right chev
		let r_chev2 = r_chev.cloneNode(true);
		r_chev2.setAttribute("onclick", "scrollCar("+i+",1,1)");
		wr_box.appendChild(r_chev2);
		
		// add best results box
		res.appendChild(wr_box);
		
		document.getElementById("main-content").appendChild(res);
	}
}

// scrolls the carousel when chevrons are clicked
function scrollCar(resNum, carIdx, amount){
	MAT_OFFS[VT_OFFS + resNum][carIdx] += amount;
	MAT_OFFS[VT_OFFS + resNum][carIdx] = 
		(MAT_OFFS[VT_OFFS + resNum][carIdx] + RESULTS.matrix[VT_OFFS + resNum].length)
		% RESULTS.matrix[VT_OFFS + resNum].length;
	load();
}

// scrolls vertically
function scrollVt(amount){
	VT_OFFS = (RESULTS.matrix.length + VT_OFFS + amount) % RESULTS.matrix.length;
	load();
}