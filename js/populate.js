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
var CLIPPING_LENGTH_HZ = 6;

const MAX_CLIPPING_VT = 25;
const MAX_CLIPPING_HZ = 16;

// contains the JS object fetched from the JSON file
var RESULTS;

// Offset of results strips
var VT_OFFS = 0;
var CURR_INDEX = 0;
var OFFS_STACK = [];


// Matrix containing offset values for all carousels
var MAT_OFFS = [];

// Pinned Image filepath
var PINNED_SRC = "";

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
	
	pinIt(0);
	load();
  }
};
xmlhttp.open("GET", "js/results/ap-results.json", true);
xmlhttp.send();

window.onscroll = function(e){
	if ( window.pageXOffset > 0 ) {
		document.getElementById("active-box").style.boxShadow = "20px 0 20px #fed";
	}
	else {
		document.getElementById("active-box").style.boxShadow = "";
	}
	
	if( window.pageYOffset > 0 ) {
		document.getElementById("toolbar").style.boxShadow = "-10px 20px 20px #fed";
	}
	else{
		document.getElementById("toolbar").style.boxShadow = "";
	}
}

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
		q_img.src = RESULTS.dir + RESULTS.images[resIdx];
		if(RESULTS.images[resIdx] == PINNED_SRC) 
			q_img.classList.add("pinned-img");
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
		q_box.setAttribute("onclick", "pinIt(" + resIdx + ")");
		q_box.setAttribute("onmouseenter", "compare(" + resIdx + ")");
		res.appendChild(q_box);
		
		/////////////////////////////////////
		///       Best Results Box        ///
		/////////////////////////////////////
		
		let br_box = document.createElement("div");
		br_box.classList.add("result-carousel");
		
		// create/add scroll wrap
		let scrollWrap = document.createElement("div");
		scrollWrap.classList.add("scroll-wrap");
		br_box.appendChild(scrollWrap);
		
		// create/add normal scroll
		let normScroll = document.createElement("div");
		normScroll.classList.add("scroll-normal-wrap");
		let r_button = document.createElement("img");
		r_button.classList.add("icon");
		r_button.classList.add("return-button");
		r_button.setAttribute("onclick", "returnToStart(" + (VT_OFFS + i) + ")");
		r_button.src = "img/double-arrow-left.png";
		normScroll.appendChild(r_button);
		let l_arr = document.createElement("img");
		l_arr.src = "img/arrow-left.png";
		l_arr.classList.add("icon");
		l_arr.classList.add("scroll-left");
		l_arr.setAttribute("onclick", "scrollCar(" + i + ",0,-1)");
		normScroll.appendChild(l_arr);
		let photoI = document.createElement("img");
		photoI.src = "img/pic.png";
		photoI.classList.add("icon");
		normScroll.appendChild(photoI);
		let r_arr = document.createElement("img");
		r_arr.src = "img/arrow-right.png";
		r_arr.classList.add("icon");
		r_arr.classList.add("scroll-right");
		r_arr.setAttribute("onclick", "scrollCar(" + i + ",0,1)");
		normScroll.appendChild(r_arr);
		scrollWrap.appendChild(normScroll);
		
		// create/add match scroll
		let matchScroll = document.createElement("div");
		matchScroll.classList.add("scroll-match-wrap");
		let rm_button = document.createElement("img");
		rm_button.classList.add("icon");
		rm_button.classList.add("return-button");
		rm_button.setAttribute("onclick", "firstMatch(" + (VT_OFFS + i) + ")");
		rm_button.src = "img/double-arrow-left.png";
		matchScroll.appendChild(rm_button);
		l_arr = document.createElement("img");
		l_arr.src = "img/arrow-left.png";
		l_arr.classList.add("icon");
		l_arr.classList.add("scroll-left");
		l_arr.setAttribute("onclick", "prevMatch(" + (VT_OFFS + i) + ")");
		matchScroll.appendChild(l_arr);
		photoI = document.createElement("img");
		photoI.src = "img/check-small.png";
		photoI.classList.add("icon");
		matchScroll.appendChild(photoI);
		r_arr = document.createElement("img");
		r_arr.src = "img/arrow-right.png";
		r_arr.classList.add("icon");
		r_arr.classList.add("scroll-right");
		r_arr.setAttribute("onclick", "nextMatch(" + (VT_OFFS + i) + ")");
		matchScroll.appendChild(r_arr);
		scrollWrap.appendChild(matchScroll);
		
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
			if(RESULTS.images[imgIdx] == PINNED_SRC) 
				r_img.classList.add("pinned-img");
			var att = document.createAttribute("index");
			att.value = imgIdx;
			r_box.setAttributeNode(att);
			r_box.appendChild(r_img);
			r_box.appendChild(document.createElement("br"));
			r_box.setAttribute("onclick", "pinIt(" + imgIdx + ")");
			r_box.setAttribute("onmouseenter", "compare(" + imgIdx + ")");
			
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
		
		// add best results box
		res.appendChild(br_box);
		
		document.getElementById("main-content").appendChild(res);
		document.getElementById("main-content").appendChild(document.createElement("br"));
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

function pinIt(idx){
	// load active image
	var activeImg = document.getElementById("active-img");
	activeImg.src = RESULTS.dir + RESULTS.images[idx];
	PINNED_SRC = RESULTS.images[idx];
	
	// set active image title
	var title = document.getElementById("active-img-title");
	title.innerHTML = "(" + (idx + 1) + ") " 
		+ RESULTS.images[idx];
		
	// connect query-link to active img's query
	var queryLink = document.getElementById("query-link");
	queryLink.setAttribute("onclick", "navigateTo(" + idx + ")");
	
	load();
}

function compare(idx){
	// load active image
	var hoverImg = document.getElementById("hover-img");
	hoverImg.src =  RESULTS.dir + RESULTS.images[idx];
}

function navigateTo(idx){
	// only update if it's a new query
	if(idx != CURR_INDEX){
		// set back-link to the current query (pre-navigation)
		var backLink = document.getElementById("back-link");
		OFFS_STACK[OFFS_STACK.length] = CURR_INDEX;
		backLink.setAttribute("onclick", "navigateBack()");
		
		// navigate to the new index
		VT_OFFS = idx;
		CURR_INDEX = idx;
		
		// go to top of page
		window.scrollBy(-window.pageXOffset, -window.pageYOffset);
		
		// reload results
		load();
	}
}

function navigateBack(){
	// go to index at the top of stack
	if(OFFS_STACK.length > 0){
		var idx = OFFS_STACK[OFFS_STACK.length - 1]; 
		VT_OFFS = idx;
		CURR_INDEX = idx;
		
		// go to top of page 
		window.scrollBy(-window.pageXOffset, -window.pageYOffset);
		
		// pin the target query
		pinIt(idx);
		
		// pop the stack
		if(OFFS_STACK.length > 1)
			OFFS_STACK = OFFS_STACK.splice(0, OFFS_STACK.length - 1);
	}
}

function prevMatch(qIdx){
	var labelToMatch = RESULTS.labels[qIdx];

	// should loop a maximum of once through the whole matrix
	var offs = (MAT_OFFS[qIdx][0] + RESULTS.matrix[qIdx].length - 1) 
		% RESULTS.matrix[qIdx].length;
	var rIdx = RESULTS.matrix[qIdx][offs];
	while(RESULTS.labels[rIdx] != labelToMatch){
		offs = (offs + RESULTS.matrix[qIdx].length - 1) 
			% RESULTS.matrix[qIdx].length;
		rIdx = RESULTS.matrix[qIdx][offs];
	}
	
	MAT_OFFS[qIdx][0] = offs;
	load();
}

function nextMatch(qIdx){
	var labelToMatch = RESULTS.labels[qIdx];

	// should loop a maximum of once through the whole matrix
	var offs = (MAT_OFFS[qIdx][0] + RESULTS.matrix[qIdx].length + 1) 
		% RESULTS.matrix[qIdx].length;
	var rIdx = RESULTS.matrix[qIdx][offs];
	while(RESULTS.labels[rIdx] != labelToMatch){
		offs = (offs + RESULTS.matrix[qIdx].length + 1) 
			% RESULTS.matrix[qIdx].length;
		rIdx = RESULTS.matrix[qIdx][offs];
	}
	
	MAT_OFFS[qIdx][0] = offs;
	load();
}

function returnToStart(idx){
	MAT_OFFS[idx][0] = 0;
	load();
}

function firstMatch(idx){
	returnToStart(idx);
	if(RESULTS.labels[idx] != RESULTS.labels[RESULTS.matrix[idx][0]])
		nextMatch(idx);
	else
		load();
}