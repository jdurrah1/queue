import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

Queue = new Mongo.Collection('queue');
<<<<<<< HEAD
songsPlayed = new Mongo.Collection('songsplayed');

=======
Room = new Meteor.Collection('room');
SongsPlayed = new Mongo.Collection('songsplayed');
>>>>>>> 3c07be058d0021eec3effc51bc1b40eb2c04528d

Meteor.startup(() => {
  // code to run on server at startup
});
