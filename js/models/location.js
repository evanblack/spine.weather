var Location = Spine.Model.setup("Location", ["name", "zip", "lat", "long"]);

Location.extend(Spine.Model.Local);

Location.include({
  validate: function(){
    if ( !this.zip ){
      return "zip required";
    }
    if ( this.zip.length != 5 ){
      return "zip must be 5 digits";
    }
  },
  
  fetchData: function(){
  	/*
    if ( !this.short_url )
      $.bitly(this.long_url, this.proxy(function(result){
        this.updateAttributes({short_url: result});
      }));
    */
  }
});

Location.bind("create", function(rec){
  rec.fetchData();
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