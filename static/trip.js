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

var resetSortable = function(){
    $('.connectedSortable').sortable({
	connectWith: '.connectedSortable',
	stop: function(event, ui){
	    ui.item.trigger('drop',ui.item.index());
	    console.log(reservePlaces);
	    _.map(reservePlaces.models, function(n, index) {
		n.set({position: index + 1});

	    });
	    console.log(reservePlaces);
	    console.log(App.reserve.currentView.collection);
	    console.log(this);
	    App.reserve.currentView.collection.each(function(Place) {
		Place.save();
		console.log(Place);
	    })
	}				
    }).disableSelection();
};

App.on('start',function(){
    tripView = new App.PlacesView({collection:tripPlaces});
    App.tripProper.show(tripView);
    
    reserveView = new App.NewPlacesView({collection:reservePlaces});
    App.reserve.show(reserveView);
    
    placesView = new App.PlacesView({collection:placesPlaces});
    App.places.show(placesView);
    
    infoView = new App.InfoView({model:p1});
    App.info.show(infoView);
    
    resetSortable();
});

App.vent.on('click #addplace', function(){
    
});

App.PlaceView = Marionette.ItemView.extend({
    template: "#place-template",
    tagName : 'li',
    className : 'place',
    events :{
	'mouseover' : function(){
	    console.log(this);
	    infoView = new App.InfoView({model:this.model});
	    App.info.show(infoView);
	},
	'mousedown' : resetSortable,
	'drop':'drop'
    },
    drop: function(event, index){
	this.$el.trigger('update-sort',[this.model,index]);
    }
});

App.InfoView = Marionette.ItemView.extend({
    template: "#info-template"
});

App.PlacesView = Marionette.CollectionView.extend({
    template: '#place-collection-template',
    childView: App.PlaceView,
    childViewContainer : 'ul',
    tagName : 'ul',
    className: 'connectedSortable',
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
	    console.log('clicked button addplace');
	    var n = $('#newplacename').val();
	    var that = this;
	    if (n.length > 0){
		var newP = new Place({name:n,tripID:tripID});
		newP.save(null,{error: function(){console.log('errorr');},
				success: function(d,r){
				    newP.set('id',r);
				    that.collection.add(newP);
				    $('#newplacename').val('');	    
				}});
	    }
	},
	'update-sort':'updateSort'
    },
    updateSort: function(event,model,position){
	this.collection.remove(model);
	this.collection.each(function (model,index){
	    var ordinal = index;
	    if(index>=position){
		ordinal+=1;
	    }
	    model.set('ordinal',ordinal);
	});

	model.set('ordinal',position);
	this.collection.add(model, {at: position});

	resetSortable();
    }
});

var Place = Backbone.Model.extend({
    urlRoot: '/places'
});
var Places = Backbone.Collection.extend({
    model:Place,
    url: '/places',
    initialize: function(){
	console.log('asddf');
	this.fetch({
	    data : $.param({'userID':userID, 'tripID':tripID, getType: arguments[0]}),
	    success : function(d){
	//	d.sort({comparator : function(m){
	//	    return m.get("position");
	//	}});
	  //  }
		a = _.sortBy(d.models,function(m){
		  //  console.log(m.get("position"));
		    return m.get("position");
		});
		console.log(a);
		console.log(d.models);
		d.models = a;
		console.log(d.models);
		App.reserve.currentView.render();
		resetSortable();
	    }
	
	});
		//d.models.render();
			
	
	console.log("fuck everything and you");
    },
    comparator: function(model){
	return model.get('ordinal');

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

//var placesJSON = https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+Sydney&key=AIzaSyCdPlCvmkme1IQ3GRS_y5KMR5tUyAMGyUo
//var placesJSON = JSON.parse('[{ "id":"1","name":"some name","description":"hmmm"}]');
var placesPlaces = new Places('suggestedNodes');
var reservePlaces = new Places('reserveNodes');
var tripPlaces = new Places('notDoneYet');

App.start();


