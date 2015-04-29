console.log("Hello");

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
    
    var placesView = new App.PlacesView({collection:placesPlaces});
    App.places.show(placesView);
    
    var infoView = new App.InfoView({model:p1});
    App.info.show(infoView);
});

App.PlaceView = Marionette.ItemView.extend({
    template: "#place-template",
});

App.InfoView = Marionette.ItemView.extend({
    template: "#info-template"
});

App.PlacesView = Marionette.CollectionView.extend({
    childView: App.PlaceView
});

var Place = Backbone.Model.extend();
var Places = Backbone.Collection.extend({
    model:Place
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

var places = document.getElementsByClassName("place");
console.log(places);

for(var i=0; i < places.length; i++){
    console.log(places[i]);
    places[i].addEventListener('mouseover', function(e){
	console.log("click");
	for(var j=0; j<places.length; j++){
	    //places[j].setAttribute('background-color','#FFFFFF');
	}
	//places[i].setAttribute('background-color','#DDDDEE');
    });
}

App.start();
