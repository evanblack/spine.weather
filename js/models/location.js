var Location = Spine.Model.setup("Location", ["name", "zip", "lat", "long", "active", "current"]);

Location.extend(Spine.Model.Local);

Location.extend({

  active: function(){
    return(this.select(function(item){ return !!item.active; }));
  },
  
  current: function(){
    return(this.select(function(item){ return !!item.current; }));
  }  
	
});

Location.include({
  validate: function(){
    if ( !this.zip && !this.name ){
      return "place or zip required";
    }
    /*
    if ( this.zip.length != 5 ){
      return "zip must be 5 digits";
    }
    */
  }, 
  
  fetchData: function(){
  	var self = this;
  	var searchStr;
    if( this.zip ){
      searchStr = this.zip;
    }else{
      searchStr = this.name;
    }
   	var q = "select%20*%20from%20geo.placefinder%20where%20text%3D%22"+searchStr+"%22";
   	$.yql(q, this.proxy(function(result){
		//console.log(result);
		result = result.Result;
		var geoZip = result.uzip;
		var geoPlace = result.city + ", " + result.statecode;
		var geoLat = result.latitude;
		var geoLong = result.longitude;			
		self.updateAttributes({name: geoPlace, zip: geoZip, lat: geoLat, long: geoLong});    		
   	}));
  }
});

Location.bind("create", function(rec){
  if(!rec.current){
  	rec.fetchData();
  }
});

Location.bind("error", function(rec, msg){
  alert("Location failed to save - " + msg);
});

/*
-- Bindable events
save - record was saved (either created/updated)
update - record was updated
create - record was created
destroy - record was destroyed
change - any of the above, record was created/updated/destroyed
refresh - all records invalidated and replaced
error - validation failed
*/