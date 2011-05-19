(function(document){

window.UTIL = window.UTIL || {}; 

UTIL.isTouchDevice = function () {

	try {
	    document.createEvent("TouchEvent");
	    return true;
	} catch (e) {
	    return false;
	}

};

})(document);

