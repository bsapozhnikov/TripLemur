console.log("Hello");

var userID = parseInt($('#userID').val());
var App = new Marionette.Application();

App.addRegions({
    trips: "#trips",
    info: "#info"
});

App.on('start',function(){
    var tripsView = new App.TripsView({collection:trips});
    App.trips.show(tripsView);
    
    var infoView = new App.InfoView({model:p1});
    App.info.show(infoView);
});

App.TripView = Marionette.ItemView.extend({
    template: "#trip-template",
    events :{
	'mouseover' : function(){console.log('click');}
    }
});

App.InfoView = Marionette.ItemView.extend({
    template: "#info-template"
});

App.TripsView = Marionette.CompositeView.extend({
    template: '#trip-composite-template',
    childView: App.TripView,
    childViewContainer : 'ul',
    collectionEvents : {
	'change' : function() {this.render();}
	
    },
    events : {
	'click #addtrip' : function(){
	    console.log('clicked button addtrip');
	    var n = $('#newtripname').val();
	    var that = this;
	    if (n.length > 0){
		var newT = new Trip({name:n});
		newT.save(null,{error: function(){console.log('errror');},
				success: function(d,r){
				    newT.set('id',r);
				    that.collection.add(newT);
				    $('#newtripname').val('');
				}});
	    }
	}
    }
});

var Trip = Backbone.Model.extend({
    urlRoot: '/trips'
});
var Trips = Backbone.Collection.extend({
    model:Trip,
    url: '/trips',
    initialize: function(){
	this.fetch({data: $.param({'userID':userID})},function(d){
	    console.log(d);
	    this.render();
	});
    }
});

var p1 = new Trip({
    name:"test",
    about: "this is a place"
});

var trips = new Trips([]);

App.start();


