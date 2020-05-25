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
var OFFS_STACK = [];
OFFS_STACK[0] = 0;

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
	
	load();
	
	pinIt(document.getElementsByClassName("query-box")[0]);
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
		var att = document.createAttribute("index");
		att.value = resIdx;
		q_box.setAttributeNode(att);
		
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
		q_box.setAttribute("onclick", "pinIt(this)");
		q_box.setAttribute("onmouseenter", "compare(this)");
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
		r_button.setAttribute("onclick", "returnToStart(" + i + ")");
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
		rm_button.setAttribute("onclick", "firstMatch(this, " + i + ")");
		rm_button.src = "img/double-arrow-left.png";
		matchScroll.appendChild(rm_button);
		l_arr = document.createElement("img");
		l_arr.src = "img/arrow-left.png";
		l_arr.classList.add("icon");
		l_arr.classList.add("scroll-left");
		l_arr.setAttribute("onclick", "prevMatch(this)");
		matchScroll.appendChild(l_arr);
		photoI = document.createElement("img");
		photoI.src = "img/check-small.png";
		photoI.classList.add("icon");
		matchScroll.appendChild(photoI);
		r_arr = document.createElement("img");
		r_arr.src = "img/arrow-right.png";
		r_arr.classList.add("icon");
		r_arr.classList.add("scroll-right");
		r_arr.setAttribute("onclick", "nextMatch(this)");
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
			r_box.setAttribute("onclick", "pinIt(this)");
			r_box.setAttribute("onmouseenter", "compare(this)");
			
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

function pinIt(el){
	// load active image
	var targetIdx = parseInt(el.getAttribute("index"));
	var activeImg = document.getElementById("active-img");
	activeImg.src = RESULTS.dir + RESULTS.images[targetIdx];
	var activeID = document.getElementById("active-id");
	if(OFFS_STACK.length > 1){
		activeID.innerHTML = 
			"<span class='back-link' onclick='navigateBack(this)'"
			+ "index='" + OFFS_STACK[OFFS_STACK.length - 2] + "'><< Back</span>"
			+ "(" + (targetIdx + 1) + ") "
			+ RESULTS.images[targetIdx]
			+ "<span class='query-link' index='" + targetIdx 
			+ "' onclick='navigateTo(this)'>Query >></span>";
	}
	else {
		activeID.innerHTML = 
			"<span class='back-link' onclick='navigateBack(this)'"
			+ "index='" + OFFS_STACK[0] + "'><< Back</span>"
			+ "(" + (targetIdx + 1) + ") "
			+ RESULTS.images[targetIdx]
			+ "<span class='query-link' index='" + targetIdx 
			+ "' onclick='navigateTo(this)'>Query >></span>";
	}
	//var glass = document.getElementsByClassName("img-magnifier-glass")[0];
	//if(glass != undefined) 
	//	glass.parentNode.removeChild(glass);
	//magnify("active-img", 2.0);
	
	PINNED_SRC = RESULTS.images[targetIdx];
	load();
}

function compare(el){
	// load active image
	var targetIdx = parseInt(el.getAttribute("index"));
	var hoverImg = document.getElementById("hover-img");
	hoverImg.src =  RESULTS.dir + RESULTS.images[targetIdx];
}

function navigateTo(el){
	var targetIdx = parseInt(el.getAttribute("index"));
	VT_OFFS = targetIdx;
	OFFS_STACK[OFFS_STACK.length] = targetIdx;
	load();
}

function navigateBack(){
	var targetIdx;
	if(OFFS_STACK.length > 1){
		targetIdx = OFFS_STACK[OFFS_STACK.length - 2]; 
		OFFS_STACK = OFFS_STACK.splice(0, OFFS_STACK.length - 1);
	}
	else
		targetIdx = OFFS_STACK[0];
	VT_OFFS = targetIdx;
	load();
	
}

function prevMatch(el){
	var query = el.closest(".result-display").getElementsByClassName("query-box")[0];
	var qIdx = parseInt(query.getAttribute("index"));
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

function nextMatch(el){
	var query = el.closest(".result-display").getElementsByClassName("query-box")[0];
	var qIdx = parseInt(query.getAttribute("index"));
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
	var query = VT_OFFS + idx;
	MAT_OFFS[query][0] = 0;
	load();
}

function firstMatch(el, idx){
	returnToStart(idx);
	var query = VT_OFFS + idx;
	if(RESULTS.labels[query] != RESULTS.labels[RESULTS.matrix[query][0]])
		nextMatch(el);
	else
		load();
}