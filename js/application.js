//var exports = this;

// When ready...
window.addEventListener("load",function() {
  // Set a timeout...
  setTimeout(function(){
    // Hide the address bar!
    window.scrollTo(0, 1);
  }, 0);
});

$(document).ready(function () { 

  window.WeatherView = Spine.Controller.create({
  	
    events: {
      "click .radar a": "showRadar",
    },  	
    
    proxied: ["render"],
    
    init: function(){
      //this.item.bind("refresh",  this.render);
      //Location.bind("refresh",  this.render);
      //this.render(selectedLoc);
      //Location.bind("update", this.render);
      Location.bind("refresh change", this.render);
    },
    
    template: function(item){
      var template = $("#weatherTemplate").html();
      return Mustache.to_html(template, item);
    },    
    
    render: function(){
      if ( !this.item ) {
      	this.item = Location.first();
      	//var active = Location.active();
      	//console.log(Location.current()[0]);
      	//this.item = active[0];
      }
      var self = this;
      var q = "select%20*%20from%20weather.forecast%20where%20location%3D"+this.item.zip;
      $.yql(q, this.proxy(function(result){
		  var channel = result.channel;
		  var channelItem = channel.item;
		  var weatherItem = {
		  	city: channel.location.city,
		  	country: channel.location.country,
		  	region: channel.location.region,
		  	conditionText: channelItem.condition.text,
		  	conditionCode: channelItem.condition.code,
		  	temp: channelItem.condition.temp,
		  	description: channelItem.description,		  	
		  	sunrise: channel.astronomy.sunrise,
		  	sunset: channel.astronomy.sunset,
		  	windDirection: channel.wind.direction,
		  	windSpeed: channel.wind.speed,
		  	windChill: channel.wind.chill,
		  	distanceUnit: channel.units.distance,
		  	pressureUnit: channel.units.pressure,
		  	speedUnit: channel.units.speed,
		  	tempUnit: channel.units.temperature,
		  	forecast1Code: channelItem.forecast[0].code,
		  	forecast1Day: channelItem.forecast[0].day,
		  	forecast1High: channelItem.forecast[0].high,
		  	forecast1Low: channelItem.forecast[0].low,
		  	forecast1Text: channelItem.forecast[0].text,
		  	forecast2Code: channelItem.forecast[1].code,
		  	forecast2Day: channelItem.forecast[1].day,
		  	forecast2High: channelItem.forecast[1].high,
		  	forecast2Low: channelItem.forecast[1].low,
		  	forecast2Text: channelItem.forecast[1].text		  	
		  };
	      self.el.html(self.template(weatherItem));
	      
	      // Set up weather radar view
	      $('#radarmap').remove();
	      var mapEl = document.createElement('DIV');
	      mapEl.id = "radarmap";
	      $('#radar').append( mapEl );
	      $.radar(self.item.lat, self.item.long, function(){
	      	console.log("radar loaded!");
	      });
	      
	      return self;			
	  }));
    },
    change: function(item){
      this.item = item;
      //this.navigate("/weather", item.id);
      //this.item.fetchStats();
      this.render();
      //this.active();
    },
    showRadar: function(e){
      e.preventDefault();
	  //console.log(e);
	  $('#weather').hide();
	  $('#radar').addClass('active');
    }       
    
  });
	  
  window.Locations = Spine.Controller.create({
  	
    events: {
      "click .destroy": "destroy",
      "click .location": "show"
    },
    
    proxied: ["render", "remove"],

    template: function(items){
      //return $("#locationTemplate").tmpl(items);
      //return ich.locationTemplate(items).html;
      var template = $("#locationTemplate").html();
      return Mustache.to_html(template, items);
    },
    
    init: function(){
      this.item.bind("update",  this.render);
      this.item.bind("destroy", this.remove);
    },
    
    render: function(){
      this.el.html(this.template(this.item));
      return this;
    },
    
    remove: function(){
      this.el.remove();
    },
    
    destroy: function(e){
      e.preventDefault();
      this.item.destroy();
    },
    
    show: function(e){
      e.preventDefault();
      this.navigate("/weather", this.item.id, true);
	  //this.item.active = !this.item.active;
	  /*
      Location.each(function(rec){
		rec.active = false;
		rec.save();
	  });
	  */
	  //this.item.active = true;
      //this.item.save();
      //console.log(this.item);
    }    
  });

  window.LocationsList = Spine.Controller.create({
    elements: {
      ".items": "items",
      "form":   "form",
      "input":  "input"
    },
    
    events: {
      "submit form": "create",
    },
    
    proxied: ["render", "addAll", "addOne"],
    
    init: function(){
      Location.bind("create",  this.addOne);
      Location.bind("refresh", this.addAll);
    },
    
    addOne: function(loc){
      var view = Locations.init({item: loc});
      this.items.append(view.render().el);
    },
    
    addAll: function(){
      Location.each(this.addOne);
    },
        
    create: function(e){
      e.preventDefault();
      //var value = this.input.val();
      var value = this.input.attr('value');
      
      // TODO: Detect here whether the user is searching for a zip code or general place name (place name is assumed if zip criteria doesn not match)
      if ( value ){
      	  var found = false;
	      var re = /^\d{5}$/;
	      // Is this a zip code?
	      if(re.test(value)){
	      	
			Location.each(function(rec){
			  //console.log( rec.zip );
			  if(rec.zip === value){
			  	found = true;
			  }
			});	
	      	if(!found){
	        	Location.create({zip: value, active: false, current: false});
	      	}      	
	      	
	      }else{
	      	
			Location.each(function(rec){
			  if(rec.name.toLowerCase() === value.toLowerCase()){
			  	found = true;
			  }
			});	
	      	if(!found){
	        	Location.create({name: value, active: false, current: false});
	      	}	      	
	      	
	      }
      }
      
      //this.input.attr('value', "");
      this.form[0].reset();
      this.input[0].focus();      

    }
    
  });
  
  window.WeatherApp = Spine.Controller.create({
    el: $("body"),
    
    elements: {
      "#weather": "weatherEl",
      "#locations": "locationsEl"
    },
    
    init: function(){
      var self = this;
      this.list = LocationsList.init({el: this.locationsEl});
      this.weather = WeatherView.init({el: this.weatherEl});
      
      this.manager = Spine.Manager.init(this.list, this.weather);
      //this.manager = Spine.Manager.init();
      //this.manager.add(this.list, this.weather);
      
      this.tabs = Spine.Tabs.init({el: $("nav .tabs")});
      this.tabs.connect("weather", this.weather);
      this.tabs.connect("locations", this.list);
      this.tabs.render();

      this.routes({
      	"/locations": function(){ this.list.active();this.tabs.change("locations");$('#radar').removeClass('active');$('#weather').show(); },
      	"/weather": function(){ this.weather.active();this.tabs.change("weather"); },
        "/weather/:id": function(id){ this.weather.change(Location.find(id));this.weather.active();this.tabs.change("weather"); }
      });
      
      $('#radar .back').bind('click', function(e){
      	e.preventDefault();
      	$('#radar').removeClass('active');
      	$('#weather').show();
      });
      
      Location.fetch();
      Spine.Route.setup();
      
	  if (navigator.geolocation) {
	  	
		navigator.geolocation.getCurrentPosition( 
		 
			function (position) {  			
				// console.log(position);
				// To see everything available in the position.coords array:
				// for (key in position.coords) {alert(key)}
				
				// Get zip code from Yahoo API based on the HTML5 Geolocation object's latitue and longitude 
				var q = "select%20*%20from%20geo.places%20where%20text%3D%22"+position.coords.latitude+"%2C%20"+position.coords.longitude+"%22";
				$.yql(q, function(result){
					//console.log(result);
					var geoZip = result.place[0].postal.content;
					var stateCode = result.place[0].admin1.code;
					var geoPlace = result.place[0].locality1.content + ", " + stateCode.replace("US-", "");
					var currentLoc = Location.current()[0];
					if(currentLoc){
						//currentLoc = Location.find(currentLoc.id);
						currentLoc.updateAttributes({name: 'My Location ('+geoPlace+')', zip: geoZip, lat: position.coords.latitude, long: position.coords.longitude});
					}else{
						var loc = Location.create({name: 'My Location ('+geoPlace+')', zip: geoZip, lat: position.coords.latitude, long: position.coords.longitude, active: true, current: true});
						//self.weather.change(loc);
					}
				});
		 
			}, 
			// next function is the error callback
			function (error) {
				switch(error.code) {
					case error.TIMEOUT:
						alert ('Timeout');
						break;
					case error.POSITION_UNAVAILABLE:
						alert ('Position unavailable');
						break;
					case error.PERMISSION_DENIED:
						alert ('Permission denied');
						break;
					case error.UNKNOWN_ERROR:
						alert ('Unknown error');
						break;
				}
			}
		);
	  }else{
	  
	  	//TODO: Geolocation disabled. Show message to alert user to add a location to their locations list.
	  	
	  }
	  
      
    }
  }).init();
  
  //exports.App = WeatherApp.init();
});