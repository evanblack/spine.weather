(function($){
	
  var overlay;
  var radarZoomLevels = [0,0,0,1300,675,350,171,85,43,16,11,5]; //Google Zoom Levels: 0,1,2,3,4,5,6,7,8,9,10,11
  
  var defaults = {
  	zoomLevel: 7
  };
  
  $.radar = function( lat, long, callback, params ) {
  	if ( !lat || !long || !callback ) throw("latitude, longitude and callback required");
  	
    var params = $.extend( defaults, params );
    params.lat = lat;
    params.long = long;
    
   	RadarOverlay.prototype = new google.maps.OverlayView();
    
    var myLatLng = new google.maps.LatLng(params.lat, params.long);
    var myOptions = {
      zoom: params.zoomLevel,
      maxZoom: 10,
      minZoom: 4,
      center: myLatLng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
	  disableDefaultUI: true,      
	  zoomControl: true,
	  zoomControlOptions: {
	    style: google.maps.ZoomControlStyle.SMALL,
	    position: google.maps.ControlPosition.LEFT_BOTTOM
	  },
      mapTypeControl: false,
      draggable: false,
      streetViewControl: false,
      scrollwheel: false
    };

    var map = new google.maps.Map(document.getElementById("radarmap"), myOptions);
    
	google.maps.event.addListenerOnce(map, 'idle', function(){
        
        var bounds = this.getBounds();
        
        var initZoom = radarZoomLevels[params.zoomLevel];

	    var srcImage = 'http://resize.wunderground.com/cgi-bin/resize_convert?ox=gif&url=radblast/cgi-bin/radar/WUNIDS_composite%3Fcenterlat='+params.lat+'%26centerlon='+params.long+'%26radius='+initZoom+'%26newmaps=2%26smooth';
	    overlay = new RadarOverlay(bounds, srcImage, map);      
	    
		google.maps.event.addListener(map, 'bounds_changed', function() {
		  
		  overlay.setMap(null);
		  
		  bounds = this.getBounds();
		  params.zoomLevel = this.getZoom();
		  
		  var newZoom = radarZoomLevels[params.zoomLevel];
		  
		  var srcImage = 'http://resize.wunderground.com/cgi-bin/resize_convert?ox=gif&url=radblast/cgi-bin/radar/WUNIDS_composite%3Fcenterlat='+params.lat+'%26centerlon='+params.long+'%26radius='+newZoom+'%26newmaps=2%26smooth';			
	      overlay = new RadarOverlay(bounds, srcImage, map); 		  
		  
		});	    
        
    });  
    
    
	function RadarOverlay(bounds, image, map) {
	
	  // Now initialize all properties.
	  this.bounds_ = bounds;
	  this.image_ = image;
	  this.map_ = map;
	
	  // We define a property to hold the image's div. We'll 
	  // actually create this div upon receipt of the onAdd() 
	  // method so we'll leave it null for now.
	  this.div_ = null;
	
	  // Explicitly call setMap on this overlay
	  this.setMap(map);
	}
	
	RadarOverlay.prototype.onAdd = function() {
	
	  // Note: an overlay's receipt of onAdd() indicates that
	  // the map's panes are now available for attaching
	  // the overlay to the map via the DOM.
	
	  // Create the DIV and set some basic attributes.
	  var div = document.createElement('DIV');
	  div.style.borderStyle = "none";
	  div.style.borderWidth = "0px";
	  div.style.position = "absolute";
	
	  // Create an IMG element and attach it to the DIV.
	  var img = document.createElement("img");
	  img.src = this.image_;
	  img.style.width = "100%";
	  img.style.height = "100%";
	  div.appendChild(img);
	
	  // Set the overlay's div_ property to this DIV
	  this.div_ = div;
	
	  // We add an overlay to a map via one of the map's panes.
	  // We'll add this overlay to the overlayImage pane.
	  var panes = this.getPanes();
	  panes.overlayImage.appendChild(div);
	}
	
	RadarOverlay.prototype.draw = function() {
	
	  // Size and position the overlay. We use a southwest and northeast
	  // position of the overlay to peg it to the correct position and size.
	  // We need to retrieve the projection from this overlay to do this.
	  var overlayProjection = this.getProjection();
	
	  // Retrieve the southwest and northeast coordinates of this overlay
	  // in latlngs and convert them to pixels coordinates.
	  // We'll use these coordinates to resize the DIV.
	  var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
	  var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
	
	  // Resize the image's DIV to fit the indicated dimensions.
	  var div = this.div_;
	  div.style.left = sw.x + 'px';
	  div.style.top = ne.y + 'px';
	  div.style.width = (ne.x - sw.x) + 'px';
	  div.style.height = (sw.y - ne.y) + 'px';    
	  div.style.opacity = '.5';
	}
	
	RadarOverlay.prototype.onRemove = function() {
	  this.div_.parentNode.removeChild(this.div_);
	  this.div_ = null;
	}       
  	
  };

})(this.Zepto);