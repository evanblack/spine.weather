(function($){
  
  var defaults = {
    diagnostics:    "false",
    cbfunc:			"?",
    format:     	"json"
  };
  
  $.yql = function( query, callback, params ) {
  	if ( !query || !callback ) throw("query and callback required");
  	
    var params = $.extend( defaults, params );
    params.queryString = query;  
    
    return $.getJSON("http://query.yahooapis.com/v1/public/yql?q="+params.queryString+"&format="+params.format+"&diagnostics="+params.diagnostics+"&callback="+params.cbfunc, function(data){
      //console.log(data);
      callback(data.query.results);
    });    
  	
  };

})(this.Zepto);