(function(Spine, $){
  
var Model = Spine.Model;

var getUrl = function(object){
  if (!(object && object.url)) return null;
  return((typeof object.url == "function") ? object.url() : object.url);
};

var methodMap = {
  "create":  "POST",
  "update":  "PUT",
  "destroy": "DELETE",
  "read":    "GET"
};

var urlError = function() {
  throw new Error("A 'url' property or function must be specified");
};

var ajaxSync = function(record, method, params){
  if (Model._noSync) return;
  
  params = $.extend({
    type:          methodMap[method],
    contentType:  "application/json",
    dataType:     "json",
    processData:  false
  }, params || {});
    
  if (method == "create" && record.model)
    params.url = getUrl(record.parent);
  else
    params.url = getUrl(record);

  if (!params.url) throw("Invalid URL");
    
  if (method == "create" || method == "update") {
    var data = {};
    
    if (Model.ajaxPrefix) {
      var prefix = record.parent.name.toLowerCase();
      data = {};
      data[prefix] = record;
    } else {
      data = record;
    }
    data = $.extend(data, params.data);
    params.data = JSON.stringify(data);
  }
  
  if (method == "read" && !params.success)
    params.success = function(data){
     (record.refresh || record.load).call(record, data);
    };
  
  params.error = function(xhr, s, e){
    record.trigger("ajaxError", xhr, s, e);
  };
  
  $.ajax(params);
};

Model.Ajax = {
  extended: function(){    
    this.sync(ajaxSync);
    this.fetch(this.proxy(function(params){
      ajaxSync(this, "read", params);
    }));
  }
};

Model.extend({
  ajaxPrefix: false,
  
  url: function() {
    return "/" + this.name.toLowerCase() + "s"
  },
  
  noSync: function(callback){
    Model._noSync = true;
    callback.apply(callback, arguments);
    Model._noSync = false;
  }
});

Model.include({
  url: function(){
    var base = getUrl(this.parent);
    base += (base.charAt(base.length - 1) == "/" ? "" : "/");
    base += encodeURIComponent(this.id);
    return base;        
  }  
});

})(Spine, Spine.$);