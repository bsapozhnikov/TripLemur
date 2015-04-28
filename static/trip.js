console.log("Hello");

var App = new Marionette.Application();

App.addRegions({
    tripProper: "#tripProper",
    reserve: "#reserve",
    places: "#places",
    info: "#info"
});

App.on('start',function(){
    var placesView = new App.PlacesView({collection:c});
    App.places.show(placesView);
    
    var infoView = new App.InfoView({model:p1});
    App.info.show(infoView);
});

App.PlaceView = Marionette.ItemView.extend({
    template: "#place-template"
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

var c = new Places([p1,p2]);

App.start();
