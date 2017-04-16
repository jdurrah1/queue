import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Mongo } from 'meteor/mongo';
import './main.html';

Queue = new Mongo.Collection('queue');

Room = new Meteor.Collection('room');

SongsPlayed = new Mongo.Collection('songsplayed');

Session.set("searchedResults", []);
Session.set("queue", []);
Session.set("room", "");
Session.set("error", "")
Session.set("nowPlaying")


// GLOBAL VARIABLES -----------------------------------------------------------
widget = undefined;
hasAux = false;


SC.initialize({
  client_id: 'fQCZrWnVDBI6WDkQDzyKPqY9GABRJ8Dq',
  redirect_uri: 'http://external.codecademy.com/soundcloud.html'
});

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

// Accessor functions available from the 'body' template in HTML 
Template.body.helpers({
	room() {
		return Session.get("room");
	},
});

// Login ----------------------------------------------------------------------

// On the 'login' template being rendered
Template.login.rendered = function () { refocus();};

// Accessor functions available from the 'login' template in HTML 
Template.login.helpers({
	errorMessage() { return Session.get("error"); }
});

// Event handlers for elements in the 'login' template
Template.login.events({
	'click #new-room'(event, instance) {
		// Username textfield is empty
		if (!$('#roomName').val()) {
			Session.set("error", "Error: Please enter a room");
			console.log("Room is empty");
		} 
		// Username exists in Room
		else if (Room.find({ room: $('#roomName').val()}).count() != 0) {
			Session.set("error", "Error: Room already exists");
			console.log("Room already exists.");
		} 
		// Creates new room in Room
		else {
			console.log("Creating", $('#roomName').val(), "...");
			Room.insert({ room: $('#roomName').val(), });
			console.log("Logging in as", $('#roomName').val(), "...");
			Session.set("room", $('#roomName').val());
			Session.set("error", "");
		}
		refocus();
	},
	'click #enter'(event, instance) {
		// RoomName textfield is empty
		if (!$('#roomName').val()) {
			Session.set("error", "Error: Please enter a room");
			console.log("Room is empty");
		} 
		// Logs in as room
		else if (Room.find({ room: $('#roomName').val()}).count() != 0) {
			console.log("Logging in as", $('#roomName').val(), "...");
			Session.set("room", $('#roomName').val());
			Session.set("error", "");
		} 
		// Room doesn't exist
		else {
			Session.set("error", "Error: Room does not exist");
			console.log("Room does not exists.");
		}
		refocus();
	}
});

function refocus() {
	$('#roomName').focus();    // Re-focus back into the textbox for continued typing
}

// End of Login ---------------------------------------------------------------

// Player Implementation ------------------------------------------------------
Template.player.onCreated(function playerOnCreated() {
	console.log("player OnCreate");
	SC.get("https://api.soundcloud.com/tracks/301162745", function(track) {
		console.log("player_SC_get_callback");
		//updateTrackUI(track);
		//SC.oEmbed(track.permalink_url, document.getElementById('player'));
		console.log(track);	
	});
});

Template.player.events({
	'click .pauseIcon': function(){
		console.log('play/pause button clicked')
		if(widget ===undefined){
			initilizeWidget();
			playNextSongFromQueue();
		}
		else{
			widget.toggle(); 
			togglePlayButton();
		}
	},
	'click .nextIcon': function(){
		playNextSongFromQueue();
	},
	'click .yesAuxButton': function(){
		$("#player").show();
		$(".aux-controls").hide();
		hasAux = true; 
	},
	'click .noAuxButton': function(){
		$("#player").show();
		$(".aux-controls").hide();
		$(".pauseIcon").hide();
		hasAux = false; 
	}
});

function togglePlayButton() {
	widget.isPaused(function(paused) {
		console.log("ispaused callback " + paused);
		if(paused){
			if($( ".pauseIcon" ).hasClass( "fa-pause" )){
				$( ".pauseIcon" ).removeClass("fa-pause");
				$( ".pauseIcon" ).addClass("fa-play");
			}	
		} else {
			if($( ".pauseIcon" ).hasClass( "fa-play" )){
				$( ".pauseIcon" ).removeClass("fa-play");
				$( ".pauseIcon" ).addClass("fa-pause");
			}
		}
	});
}

function initilizeWidget() {
	console.log('initilizizing Widget')
	widgetIframe = document.getElementById('sc-widget'),
	widget = SC.Widget(widgetIframe);
}

function updateTrackUI(track) {
	var artworkURL = "http://www.tunefind.com/i/album-art-empty.png";
	if (track.artwork_url) {
		artworkURL = track.artwork_url.replace("large", "t500x500");
	}
	$("#trackArt").attr("src",artworkURL);
	$("#artistName").text(track.user.username);
	$("#trackName").text(track.title);

	if(hasAux){
		$(".pauseIcon").show();
	}
	$(".nextIcon").show(); 
}

function updateTrackUIDefault() {
	var artworkURL = "http://www.tunefind.com/i/album-art-empty.png";

	$("#trackArt").attr("src",artworkURL);
	$("#artistName").text("empty queue");
	$("#trackName").text("Add Songs to the");

	$(".pauseIcon").hide();
	$(".nextIcon").hide(); 
	widget.pause(); 
	if($( ".pauseIcon" ).hasClass( "fa-pause" )){
		$( ".pauseIcon" ).removeClass("fa-pause");
		$( ".pauseIcon" ).addClass("fa-play");
	}	
	widget = undefined;
}

// End of Player --------------------------------------------------------------

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
	// continuous search from user input in textField
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
		$(".addToQueButton").html("+")
		return Session.get("searchedResults"); 
	}
});

Template.track_search.events({
	'click .addToQueButton': function(e){

		console.log("click track");
		console.log($(e.target).html("&#10003;"));
		console.log(this);
		// user with aux can control play / pause
		if(hasAux){ $(".pauseIcon").show(); }
		$(".nextIcon").show(); 

		Queue.insert({
			this,
			artist: this.user.username,
			imageSrc:this.artwork_url,
			title: this.title,
			createdAt: new Date(), 
			room: Session.get("room"),
			likes:0
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
		var songPlaying = SongsPlayed.find({room: Session.get("room") }, { sort: { createdAt: -1 } }).fetch(); 
		
		console.log("song being played");
		if(songPlaying.length >0){
			console.log(songPlaying[0]);
			if($("#trackName").text() !== songPlaying[0].track.title)
			{
				console.log("Currently Playing Song changed on another device updating trackUI");
			 	console.log(songPlaying[0].track);
			 	updateTrackUI(songPlaying[0].track);
			 	if(widget!==undefined)
			 	{
			 		widget.isPaused(function(paused){
			 			widget.pause(); 
			 			widget.load(songPlaying[0].track.uri);
				 		widget.bind(SC.Widget.Events.READY, function() {

							if(hasAux & !paused)
							{
					 			widget.play();
					 		}
					 		togglePlayButton();	
						 });
				 	});
			 		
			 		
			 	}
			}
		} 
	

		toReturn = Queue.find({room: Session.get("room") }, { sort: { likes:-1, createdAt: 1 } }).fetch(); 
		console.log('YOOOO');
		console.log(toReturn);
		return  toReturn;  //Session.get("queue"); 
	}
});

Template.soundQueue.events({
	'click #AddtoQueue': function(){
        document.getElementById("mySidebar2").style.display = "none";
        document.getElementById("myOverlay").style.display = "none";
        document.getElementById("mySidebar").style.display = "none";

        document.getElementById("mySidebar2").style.display = "block";
        document.getElementById("myOverlay").style.display = "block";
        console.log("openSearchCloseQueue");

      
	},
	'click #exit': function() {
		console.log("Exiting out of " + Session.get("room"));
		Session.set("room", "");
	}
});

function playNextSongFromQueue() {
		if(widget===undefined)
		{
			initilizeWidget(); 
		}

		temp = Queue.find({room: Session.get("room") }, { sort: { likes:-1, createdAt: 1 } }).fetch();
		if(temp.length >0){
			var nextSong = temp[0]; 
			console.log(nextSong);
			console.log(nextSong.this.uri);
			updateTrackUI(nextSong.this);
			widget.load(nextSong.this.uri);
			updatedSongsPlayed(nextSong.this);
			Queue.remove(nextSong._id);

			widget.bind(SC.Widget.Events.READY, function() {

		 		if (hasAux) {
					widget.play();
				}
		 		togglePlayButton();
			 });
			widget.bind(SC.Widget.Events.FINISH, function() {
				playNextSongFromQueue();
				widget.bind(SC.Widget.Events.READY, function() {
					if (hasAux) {
						widget.play();
					}
					togglePlayButton();
		 		});
			});
		}
		else{
			updateTrackUIDefault();
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

function updatedSongsPlayed(track){
	console.log("updated Songs Played");

	console.log(track);

		SongsPlayed.insert({
			track,
			artist: track.user.username,
			imageSrc:track.artwork_url,
			title: track.title,
			createdAt: new Date(), 
			room: Session.get("room"),
			likes: 0 //todo : update
		});

}

Template.track_queue.events({
	'click .removeFromQueButton': function(){
		console.log("remove from que");
		console.log(this);
		Queue.remove(this._id);
		
	}, 
	'click .likeButton': function(e){
		//Queue.update({_id: "LrCgscqN7k7rYcXRz"}, {$inc:{likes:1}})
		console.log("like song:");
		console.log(this);
		Queue.update({_id: this._id}, {$inc:{likes:1}});
		console.log($(e.target))
		$(e.target).css("color", "#DD1C1A");
		$(e.target).removeClass("likeButton");



	}

});



