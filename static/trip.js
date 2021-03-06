console.log("Hello");

var tripView,reserveView,placesView,infoView,trashView;
var userID = parseInt($('#userID').val());
var tripID = parseInt($('#tripID').val());
var App = new Marionette.Application();

App.addRegions({
    tripProper: "#tripProper",
    reserve: "#reserve",
    places: "#places",
    info: "#info",
    trash: "#trash"
});
var updateSortedModels = function(){
    _.map(tripPlaces.models, function(n, index) {
	n.set({position: index + 1, list: 0});
    });
    _.map(reservePlaces.models, function(n, index) {
	n.set({position: index + 1, list: 1});
    });
    App.tripProper.currentView.collection.each(function(Place){
	console.log(Place);
	Place.save(null,{success:function(model,response){
	    if(typeof response == 'number'){
		console.log('moved suggested node for the first time');
		model.set('id',response);
		model.set('details','details');
		model.save('id',response);
	    }
	}});
    });
    App.reserve.currentView.collection.each(function(Place) {
	console.log(Place);
	Place.save(null,{success:function(model,response){
	    if(typeof response == 'number'){
		model.set('id',response);
		model.set('details','details');
		model.save('id',response);
	    }
	}});
    });
};
var resetSortable = function(){
    $('.connectedSortable').sortable({
	connectWith: '.connectedSortable',
	dropOnEmpty: true,
	remove: function(event,ui){
	    console.log('remove triggered, triggering moveout');
	    console.log(ui.item.index());
	    console.log($(event.target));
	    //$(event.target).trigger('kill',ui.item);
	    ui.item.trigger('moveout',[event.target,ui.item.index()]);
	},
	stop: function(event, ui){
	    console.log('stop triggered');
	    var sameList = ui.sender===null && ui.item.parent().is($(this));
	    if(sameList){
		console.log('movement within a list, triggering drop');
		ui.item.trigger('drop',ui.item.index());
	    }
	    updateSortedModels();
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
    
    trashView = new App.TrashView({});
    App.trash.show(trashView);
        
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
	    infoView = new App.InfoView({model:this.model});
	    App.info.show(infoView);
	},
	'mousedown' : resetSortable,
	'drop':'drop',
	'moveout':'moveOut'
    },
    drop: function(event, index){
	console.log('drop triggered, triggering update-sort');
	this.$el.trigger('update-sort',[this.model,index]);
    },
    moveOut: function(event,oldCollection,newPos){
	console.log('move-out triggered, triggering update-movein and update-moveout');
	this.$el.trigger('update-movein',[this.model,newPos]);
	$(oldCollection).trigger('update-moveout',this.model);
	//this.$el.trigger('update-moveout',this.model);
    }
});

App.InfoView = Marionette.ItemView.extend({
    template: "#info-template",
    events : {
	'click #placename' : function(){
	    var name = $('#placename').replaceWith('<input type="text" id="editplacename" />');
	    $('#editplacename').val(name.text()).focus();
	},
	'blur #editplacename' : function(){
	    this.model.set('name',$('#editplacename').val()).save();
	    $('#editplacename').replaceWith('<div id="placename"><h4>'+this.model.get('name')+'</h4></div>');
	    console.log(this);
	},
	'keydown #editplacename' : function(event){
	    if(event.keyCode ==13){
		$('#editplacename').blur();
	    }
	},
	'click #placedetails' : function(){
	    var det = $('#placedetails').replaceWith('<input type="text" id="editplacedetails" />');
	    $('#editplacedetails').val(det.text()).focus();
	},
	'blur #editplacedetails' : function(){
	    this.model.set('details',$('#editplacedetails').val()).save();
	    $('#editplacedetails').replaceWith('<div id="placedetails"><h4>'+this.model.get('details')+'</h4></div>');
	    console.log(this);
	},
	'keydown #editplacedetails' : function(event){
	    if(event.keyCode ==13){
		$('#editplacedetails').blur();
	    }
	}
    }
});

App.TrashView = Marionette.CompositeView.extend({
    template: "#trash-template",
    childView: App.PlaceView,
    childViewContainer : 'ul',
    tagName: 'ul',
    className: 'connectedSortable',
    events : {
	'update-movein':'updateMoveIn'
    },
    updateMoveIn: function(event,model,newPos){
	console.log('update-movein triggered, deleting model: '+model);
	model.destroy();
    }
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
	'change' : function() {this.render();},
	'add' : function(){
	    this.collection.each(function(model,index){
		model.set({'ordinal':index},{'silent':'true'});
	    });
	}
    },
    events : {
	'update-sort':'updateSort',
	'update-moveout':'updateMoveOut',
	'update-movein':'updateMoveIn'
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
    },
    updateMoveOut: function(event,model){
	console.log('update-moveout triggered, removing model and resetting ordinals');
	this.collection.remove(model);
	this.collection.each(function(model,index){
	    model.set('ordinal',index);
	});
    },
    updateMoveIn: function(event, model, newPos){
	console.log('update-movein triggered, adding model to collection');
	this.collection.add(model, {at: newPos});
    }
});

App.NewPlacesView = Marionette.CompositeView.extend({
    template: '#place-composite-template',
    childView: App.PlaceView,
    childViewContainer: 'ul',
    collectionEvents :{
	'change' : function() {this.render();},
	'add' : function(){
	    this.collection.each(function(model,index){
		model.set({'ordinal':index},{'silent':'true'});
	    });
	}
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
				    newP.set('details','details');
				    newP.set('list',1);
				    that.collection.add(newP);
				    $('#newplacename').val('');	    
				}});
	    }
	},
	'keydown #newplacename' : function(event){
	    if(event.keyCode == 13){
		$('#addplace').click();
	    }
	},
	'update-sort':'updateSort',
	'update-moveout':'updateMoveOut',
	'update-movein':'updateMoveIn'
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
    },
    updateMoveOut: function(event,model){
	console.log('update-moveout triggered, removing model and resetting ordinals');
	this.collection.remove(model);
	this.collection.each(function(model,index){
	    model.set('ordinal',index);
	});
    },
    updateMoveIn: function(event, model, newPos){
	console.log('update-movein triggered, adding model to collection');
	this.collection.add(model,{at: newPos});
    }
});

var Place = Backbone.Model.extend({
    urlRoot: '/places'
});
var Places = Backbone.Collection.extend({
    model:Place,
    url: '/places',
    initialize: function(){
	console.log('created new Place Collection');
	var getType = arguments[0];
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
		d.models = a;
		if(getType=='suggestedNodes'){
		    d.each(function(model){
			console.log(model);
			model.set({'id':null, 'list':2});
		    });
		}
		App.tripProper.currentView.render();
		App.reserve.currentView.render();
		App.places.currentView.render();
		resetSortable();
	    }
	
	});
    },
    comparator: function(model){
	return model.get('ordinal');

    }
});

/*var p1 = new Place({
    name:"test",
    about: "this is a place",
    details: 'details'
});

var p2 = new Place({
    name:"test 2",
    about: "this is also a place",
    details: 'details'
});*/


var placesPlaces = new Places('suggestedNodes');
var reservePlaces = new Places('reserveNodes');
var tripPlaces = new Places('tripProperNodes');

App.start();


