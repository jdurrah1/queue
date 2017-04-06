import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session'
import { Mongo } from 'meteor/mongo';

import './main.html';

Queue = new Mongo.Collection('queue');

Session.set("searchedResults", []);

Session.set("queue", []);

widget = undefined; 



SC.initialize({
  client_id: 'fQCZrWnVDBI6WDkQDzyKPqY9GABRJ8Dq',
  redirect_uri: 'http://external.codecademy.com/soundcloud.html'
});

Template.player.onCreated(function playerOnCreated() {


	console.log("player OnCreate");
	SC.get("https://api.soundcloud.com/tracks/301162745", function(track) {
		console.log("player_SC_get_callback");
		updateTrackUI(track);
	 //SC.oEmbed(track.permalink_url, document.getElementById('player'));
	 	console.log(track);	
	});


});

Template.player.events({
	'click .pauseIcon': function(){
		console.log('play/pause button clicked')

		if(widget ===undefined){
			initilizeWidget();
		}
		widget.toggle(); 
		togglePlayButton();

	},
	'click .nextIcon': function(){
		playNextSongFromQueue();
	}

});

function togglePlayButton(){


		widget.isPaused(function(paused){
			console.log("ispaused callback " + paused);
			if(paused){
				if($( ".pauseIcon" ).hasClass( "fa-pause" )){
					$( ".pauseIcon" ).removeClass("fa-pause");
					$( ".pauseIcon" ).addClass("fa-play");
				}	
			}
			else {
				if($( ".pauseIcon" ).hasClass( "fa-play" )){
					$( ".pauseIcon" ).addClass("fa-pause");
					$( ".pauseIcon" ).removeClass("fa-play");
				}
			}
		});
}

function initilizeWidget()
{
	console.log('initilizizing Widget')
	 widgetIframe = document.getElementById('sc-widget'),
     widget       = SC.Widget(widgetIframe);

}

function updateTrackUI(track)
{
	$("#trackArt").attr("src",track.artwork_url);
	$("#artistName").text(track.user.username);
	$("#trackName").text(track.title);
}

Template.search.onCreated(function searchOnCreated() {
	console.log("search on create");
	SC.get('/tracks', {
		  q:"kakuyon" 
		}, function(tracks) {
		  console.log(tracks);
		  Session.set("searchedResults", tracks); 
		});

});

Template.search.events({
	'click .searchBtn': function(){
		console.log("search_btnCLick");
		//$(".searchResults").html( $("#textToSearch").val()); 

		query = $("#textToSearch").val();

		SC.get('/tracks', {
		  q:query 
		}, function(tracks) {
		  console.log(tracks);
		  Session.set("searchedResults", tracks); 
		});

	},
	'keyup #textToSearch': function(){
	console.log("search keyup");
	//$(".searchResults").html( $("#textToSearch").val()); 

	query = $("#textToSearch").val();
	SC.get('/tracks', {
	  q:query 
	}, function(tracks) {
	  console.log(tracks);
	  Session.set("searchedResults", tracks); 
	});

	},
});


Template.searchResults.helpers({
	searchResults(){
		return  Session.get("searchedResults"); 
	}
});

Template.track_search.events({
	'click .addToQueButton': function(){
		console.log("click track");
		console.log(this);


		Queue.insert({
			this,
			artist: this.user.username,
			imageSrc:this.artwork_url,
			title: this.title,
			createdAt: new Date(), 
		});

		/*
		var temp = Session.get("queue");
		temp.push(this);
		Session.set("queue", temp);
		*/

	}

});

Template.soundQueue.helpers({
	queueValues(){
		toReturn = Queue.find({}, { sort: { createdAt: -1 } }).fetch(); 
		console.log(toReturn);
		return  toReturn;  //Session.get("queue"); 
	}
});

Template.soundQueue.events({
	'click #playQueue': function(){
		console.log("play queue");
		if(widget===undefined){
			var iframeElement   = document.querySelector('iframe');
			var iframeElementID = iframeElement.id;
			widget         = SC.Widget(iframeElement);
		}
		console.log(widget);


		playNextSongFromQueue();

		
	}

});

function playNextSongFromQueue()
{
		temp = Queue.find({}, { sort: { createdAt: -1 } }).fetch(); 

		if(temp.length >0){
			var nextSong = temp[0]; 
			console.log(nextSong);
			console.log(nextSong.this.uri);
			updateTrackUI(nextSong.this);
			widget.load(nextSong.this.uri);
			Queue.remove(nextSong._id);

			widget.bind(SC.Widget.Events.READY, function() {
		 		widget.play();
		 		togglePlayButton();

			 });
			widget.bind(SC.Widget.Events.FINISH, function() {
        		playNextSongFromQueue();
        		widget.bind(SC.Widget.Events.READY, function() {
		 			widget.play();
		 			togglePlayButton();	 			
		 		});
      		});
		}
		/*
		var temp = Session.get("queue");
		if(temp.length >0){
			var nextSong = temp[0]; 
			console.log(nextSong);
			console.log(nextSong.uri);
			widget.load(nextSong.uri);
			temp.splice(0, 1);
			Session.set("queue", temp);
		}
		*/
}


Template.track_queue.events({
	'click .removeFromQueButton': function(){
		console.log("remove from que");
		console.log(this);
		Queue.remove(this._id);
		
		/*var temp = Session.get("queue");

		
		//find index of what to delete
		var index = -1; 
		for(var i =0; i < temp.length; i++){
			if(temp[i].id === this.id){
				index = i; 
				break
			}
		}
		console.log(index);
		if (index > -1) {
		    temp.splice(index, 1);
		}
		Session.set("queue", temp);
		*/
	}

});

