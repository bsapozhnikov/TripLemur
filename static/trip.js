console.log("Hello");

var userID = parseInt($('#userID').val());
var App = new Marionette.Application();

App.addRegions({
    tripProper: "#tripProper",
    reserve: "#reserve",
    places: "#places",
    info: "#info"
});

App.on('start',function(){
    var tripView = new App.PlacesView({collection:tripPlaces});
    App.tripProper.show(tripView);
    
    var reserveView = new App.PlacesView({collection:reservePlaces});
    App.reserve.show(reserveView);
    
    var placesView = new App.PlacesPlacesView({collection:placesPlaces});
    App.places.show(placesView);
    
    var infoView = new App.InfoView({model:p1});
    App.info.show(infoView);
});

App.PlaceView = Marionette.ItemView.extend({
    template: "#place-template",
    events :{
	'mouseover' : function(){console.log('click');}
    }
});

App.InfoView = Marionette.ItemView.extend({
    template: "#info-template"
});

App.PlacesView = Marionette.CompositeView.extend({
    template: '#place-composite-template',
    childView: App.PlaceView,
    childViewContainer : 'ul',
    modelEvents : {
	'change' : function() {this.render();}
    },
    events : {
    }
});

App.PlacesPlacesView = App.PlacesView.extend({
    events : {
	'click #addplace' : function(){
	    console.log('clicked button addplace');
	    var n = $('#newplacename').val();
	    if (n.length > 0){
		var newP = new Place({name:n});
		this.collection.add(newP);
		newP.save();
		$('#newplacename').val('');
	    }
	}

    }
});

var Place = Backbone.Model.extend({
    urlRoot: '/places'
});
var Places = Backbone.Collection.extend({
    model:Place,
    url: '/places',
    initialize: function(){
	this.fetch({data: $.param({'userID':userID})},function(d){
	    console.log(d);
	    this.render();
	});
    }
});

var p1 = new Place({
    name:"test",
    about: "this is a place"
});

var p2 = new Place({
    name:"test 2",
    about: "this is also a place"
});

var placesPlaces = new Places([p1,p2]);
var reservePlaces = new Places([]);
var tripPlaces = new Places([]);

App.start();


