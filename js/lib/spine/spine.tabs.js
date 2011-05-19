// Usage:

// <ul class="tabs">
//  <li data-name="users">Users</li>
//  <li data-name="groups">Groups</li>
// </ul>
// 

// var users = Users.init();
// var groups = Groups.init();
// Manager.init(users, groups);
//
// var tabs = Spine.Tabs.init({el: $(".tabs")});
// tabs.connect("users", users);
// tabs.connect("groups", groups);
//
// // Select first tab.
// tabs.render();

(function(Spine, $){
	
  if(UTIL.isTouchDevice()){
  	  var tabEvent = "touchstart";
	  var tabsEvents = {
	    "touchstart [data-name]": "click"
	  };
  }else{
  	  var tabEvent = "click";
	  var tabsEvents = {
	    "click [data-name]": "click"  	
	  };  	
  }
  
  Spine.Tabs = Spine.Controller.create({
    events: tabsEvents,
    
    proxied: ["change"],
    
    init: function(){
      this.bind("change", this.change);
    },
            
    change: function(name){
      if ( !name ) return;
      this.current = name;

      this.children().removeClass("active");
      this.children("[data-name='" + this.current + "']").addClass("active");
    },
        
    render: function(){
      this.change(this.current);
      if ( !this.children(".active").length || !this.current )
        $(this.children()[0]).trigger(tabEvent);
    },
    
    children: function(sel){
      return this.el.children(sel);
    },
    
    click: function(e){
      var name = $(e.target).closest('[data-name]').attr("data-name");
      Spine.Route.navigate("/"+name, true);
      this.trigger("change", name);
    },
    
    connect: function(tabName, controller) {
      this.bind("change", function(name){
        if (name == tabName)
          controller.active();
      });
    }
  });
  
})(Spine, Spine.$);