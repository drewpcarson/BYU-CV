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
var CLIPPING_LENGTH_VT = 3;
var CLIPPING_LENGTH_HZ = 3;

const MAX_CLIPPING_VT = 25;
const MAX_CLIPPING_HZ = 8;

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
	MAT_OFFS = new Array(RESULTS.matrix.length);
	for(var i = 0; i < RESULTS.matrix.length; i++){
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
	
	// load active image
	let actIdx = VT_OFFS % RESULTS.matrix.length;
	var activeImg = document.getElementById("active-img");
	activeImg.src = RESULTS.dir + RESULTS.images[actIdx];
	var activeID = document.getElementById("active-id");
	activeID.innerHTML = RESULTS.images[actIdx];
	var activeAP = document.getElementById("active-ap");
	activeAP.innerHTML = "Avg. Precision: " + RESULTS.ap[actIdx].toPrecision(4);
	var activeLb = document.getElementById("active-lb");
	activeLb.innerHTML = "Label: " + RESULTS.labels[actIdx];
	var glass = document.getElementsByClassName("img-magnifier-glass")[0];
	if(glass != undefined) 
		glass.parentNode.removeChild(glass);
	magnify("active-img", 2.0);
	
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
		q_img.src = RESULTS.dir + RESULTS.images[resIdx];
		q_box.appendChild(q_img);
		
		// create query caption
		let q_cap = document.createElement("div");
		q_cap.classList.add("query-caption");
		q_cap.innerHTML = 
				"(" + (resIdx + 1) + ") " 
				+ RESULTS.images[resIdx]
				+ "<br/>AP:" + RESULTS.ap[resIdx].toPrecision(3)
				+ "/Lb:" + RESULTS.labels[resIdx];
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
			r_box.classList.add("result-box");
			
			let rank = (MAT_OFFS[resIdx][0] + j) % RESULTS.matrix[resIdx].length;
			let imgIdx = RESULTS.matrix[resIdx][rank];
			
			// create/add result img
			let r_img = document.createElement("img");
			r_img.classList.add("result-img"); 
			r_img.src = RESULTS.dir + RESULTS.images[imgIdx];
			var att = document.createAttribute("index");
			att.value = imgIdx;
			r_box.setAttributeNode(att);
			r_box.appendChild(r_img);
			r_box.appendChild(document.createElement("br"));
			r_box.setAttribute("onclick", "navegateTo(this)");
			
			// create/add check box
			let r_chk = document.createElement("img");
			r_chk.classList.add("check");
			r_chk.src = (RESULTS.labels[resIdx] == RESULTS.labels[imgIdx]) 
				? "img/check-small.png" : "img/x-mark-32.png";
			r_box.appendChild(r_chk);
		
			// create result caption
			let r_cap = document.createElement("div");
			r_cap.classList.add("query-caption");
			r_cap.innerHTML = 
				"(" + (rank + 1) + ") " 
				+ RESULTS.images[imgIdx]
				+ "<br/>AP:" + RESULTS.ap[imgIdx].toPrecision(3)
				+ "/Lb:" + RESULTS.labels[imgIdx];
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
			r_box.classList.add("result-box");
			
			let rank = (2 * RESULTS.matrix[resIdx].length 
				- (MAT_OFFS[resIdx][1] + j + 1))
				% RESULTS.matrix[resIdx].length;
			let imgIdx = RESULTS.matrix[resIdx][rank];
			
			// create/add result img
			let r_img = document.createElement("img");
			r_img.classList.add("result-img"); 
			r_img.src = RESULTS.dir + RESULTS.images[imgIdx];
			var att = document.createAttribute("index");
			att.value = imgIdx;
			r_box.setAttributeNode(att);
			r_box.appendChild(r_img);
			r_box.appendChild(document.createElement("br"));
			r_box.setAttribute("onclick", "navegateTo(this)");
			
			// create/add check box
			let r_chk = document.createElement("img");
			r_chk.classList.add("check");
			r_chk.src = (RESULTS.labels[resIdx] == RESULTS.labels[imgIdx])
				? "img/check-small.png" : "img/x-mark-32.png";
			r_box.appendChild(r_chk);
			
			// create result caption
			let r_cap = document.createElement("div");
			r_cap.classList.add("query-caption");
			r_cap.innerHTML = 
				"(" + (rank + 1) + ") " 
				+ RESULTS.images[imgIdx]
				+ "<br/>AP:" + RESULTS.ap[imgIdx].toPrecision(3)
				+ "/Lb:" + RESULTS.labels[imgIdx];
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
	let resIdx = (VT_OFFS + resNum) % MAT_OFFS.length;
	MAT_OFFS[resIdx][carIdx] += amount;
	MAT_OFFS[resIdx][carIdx] = 
		(MAT_OFFS[resIdx][carIdx] + RESULTS.matrix[resIdx].length)
		% RESULTS.matrix[resIdx].length;
	load();
}

// scrolls vertically
function scrollVt(amount){
	VT_OFFS = (RESULTS.matrix.length + VT_OFFS + amount) % RESULTS.matrix.length;
	load();
}

// refines search results
function refine(){
	var targetIdx = document.getElementById("goto").value;
	if(targetIdx != ""){
		VT_OFFS = (RESULTS.matrix.length + parseInt(targetIdx) - 1) % RESULTS.matrix.length;
	}
	
	var targetRows = document.getElementById("rows").value;
	if(targetRows != ""){
		if(targetRows < 1){
			alert("Invalid number of rows. Showing 1.");
			targetRows = 1;
		}
		if(targetRows > MAX_CLIPPING_VT)
			alert("Desired rows exceeds maximum of " + MAX_CLIPPING_VT);
		CLIPPING_LENGTH_VT = Math.min(targetRows, MAX_CLIPPING_VT);
	}
	
	var targetCols = document.getElementById("cols").value; 
	if(targetCols != ""){
		if(targetCols < 1){
			alert("Invalid number of columns. Showing 1.");
			targetCols = 1;
		}
		if(targetCols > MAX_CLIPPING_HZ)
			alert("Desired columns exceeds maximum of " + MAX_CLIPPING_HZ);
		CLIPPING_LENGTH_HZ = Math.min(targetCols, MAX_CLIPPING_HZ);
	}
	
	load();
}

function navegateTo(el){
	var targetIdx = parseInt(el.getAttribute("index"));
	VT_OFFS = targetIdx;
	load();
}