var exports = this;

  exports.WeatherView = Spine.Controller.create({
    
    proxied: ["render"],

    template: function(item){
      var template = $("#weatherTemplate").html();
      return Mustache.to_html(template, item);
    },
    
    init: function(){
      //this.item.bind("refresh",  this.render);
      //Location.bind("refresh",  this.render);
      var selectedLoc = Location.first();
      this.render(selectedLoc);
    },
    
    render: function(loc){
      var self = this;
	  $.getJSON("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20location%3D"+loc.zip+"&format=json&diagnostics=true&callback=?", function(data){
		  var channel = data.query.results.channel;
		  //var condition = channel.item.condition;
		  var item = channel.item;
		  var weatherItem = {
		  	temp: item.condition.text,
		  	text: item.condition.temp,
		  	description: item.description
		  };
	      self.el.html(self.template(weatherItem));
	      //self.el.html(weatherItem.description);
	      return self;			
	  });      
      
    }
  });
	  
  exports.Locations = Spine.Controller.create({
  	
    events: {
      "click .destroy": "destroy"
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
    }
  });

  exports.LocationsList = Spine.Controller.create({
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
      
      if ( value.length != 5 )
      	throw "Zip required";
      
      if (value ){
        Location.create({zip: value});
      }
      
      //this.input.attr('value', "");
      this.form[0].reset();
      this.input[0].focus();
    }
  });
  
  exports.WeatherApp = Spine.Controller.create({
    el: $("body"),
    
    elements: {
      "#weather": "weatherEl",
      "#locations": "locationsEl"
    },
    
    init: function(){
      this.list = LocationsList.init({el: this.locationsEl});
      
      this.manager = Spine.Controller.Manager.init();
      this.manager.addAll(this.list);
      
      /*
      this.routes({
        "": function(){ this.list.active() },
        "/list": function(){ this.list.active() }
      });
      */
      
      Location.fetch();
      //Spine.Route.setup();
      
	  if (navigator.geolocation) {
		  navigator.geolocation.getCurrentPosition( 
		 
			function (position) {  			
				// console.log(position);
				// To see everything available in the position.coords array:
				// for (key in position.coords) {alert(key)}
				
				// Get zip code from Yahoo API based on the HTML5 Geolocation object's latitue and longitude 
				$.getJSON("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.places%20where%20text%3D%22"+position.coords.latitude+"%2C%20"+position.coords.longitude+"%22&format=json&diagnostics=true&callback=?", function(data){
					//console.log(data);
					var geoZip = data.query.results.place[0].name;
					var geoPlace = data.query.results.place[0].locality1.content;
					var found = false;
					Location.each(function(rec){
					  //console.log( rec.zip );
					  if(rec.zip === geoZip){
					  	found = true;
					  }
					});
					if(!found){
						Location.create({name: 'Current Location ('+geoPlace+')', zip: geoZip, lat: position.coords.latitude, long: position.coords.longitude});
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
	  }
	  
	  this.weather = WeatherView.init({el: this.weatherEl});	  
	  //this.manager.render(this.weather);
	  //this.weather.render();
      
    }
  });


$(document).ready(function () {   
  exports.App = WeatherApp.init();
});