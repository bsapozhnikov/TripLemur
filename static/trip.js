console.log("Hello");

var tripView,reserveView,placesView,infoView;
var userID = parseInt($('#userID').val());
var tripID = parseInt($('#tripID').val());
var App = new Marionette.Application();

App.addRegions({
    tripProper: "#tripProper",
    reserve: "#reserve",
    places: "#places",
    info: "#info"
});

App.on('start',function(){
    tripView = new App.PlacesView({collection:tripPlaces});
    App.tripProper.show(tripView);
    
    reserveView = new App.PlacesView({collection:reservePlaces});
    App.reserve.show(reserveView);
    
    placesView = new App.NewPlacesView({collection:placesPlaces});
    App.places.show(placesView);
    
    infoView = new App.InfoView({model:p1});
    App.info.show(infoView);
});

App.vent.on('click #addplace', function(){
    console.log('clicked button addplace');
    var n = $('#newplacename').val();
    if (n.length > 0){
	var newP = new Place({name:n,tripID:tripID});
	newP.save();
	newP.set('id',reserveView.collection.length+1);
	//this.collection.add(newP);
	reserveView.collection.add(newP);
	$('#newplacename').val('');
    }
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

App.PlacesView = Marionette.CollectionView.extend({
    template: '#place-collection-template',
    childView: App.PlaceView,
    childViewContainer : 'ul',
    initialize : function(){
	this.listenTo(App.places);
    },
    collectionEvents : {
	'change' : function() {this.render();}
    },
    events : {
    }
});

App.NewPlacesView = Marionette.CompositeView.extend({
    template: '#place-composite-template',
    childView: App.PlaceView,
    childViewContainer: 'ul',
    collectionEvents :{
	'change' : function() {this.render();}
    },
    events : {
	'click #addplace' : function(){
	    App.vent.trigger('click #addplace');
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
	this.fetch({data: $.param({'userID':userID, 'tripID':tripID, getType: arguments[0]})},function(d){
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

var placesPlaces = new Places('notDoneYet');
var reservePlaces = new Places('reserveNodes');
var tripPlaces = new Places('notDoneYet');

App.start();


