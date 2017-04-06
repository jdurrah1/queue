import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

Queue = new Mongo.Collection('queue');
songsPlayed = new Mongo.Collection('songsplayed');


Meteor.startup(() => {
  // code to run on server at startup
});
