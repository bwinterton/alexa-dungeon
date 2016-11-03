var Alexa = require('alexa-sdk');


exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    alexa.dynamoDBTableName = 'Dungeon-Alexa';
	alexa.registerHandlers(handlers);
	alexa.execute();
};

var handlers = {

	// TODO: This needs to ask a question back to the user
	'AMAZON.HelpIntent' : function() {
		this.emit(':ask', "You can ask XKCD to get the latest post for you" +
				  " and I will send it to your phone!");
	},

	'AMAZON.StopIntent' : function() {
	},

	'AMAZON.CancelIntent' : function() {
	},

	'NewSession' : function() {
		this.attributes['position-x'] = 0;
		this.attributes['position-y'] = 0;
		this.emit(':ask', "You have just woken up in the middle of a dark room." +
				  " You don't know how you got here, or how long you have been asleep " +
				  "all you know is that you need to get out now! " +
				  "You see a lantern next to you, but it doesn't have much oil " +
				  "left, it will probably burn out in 20 more steps. " +
				  "Hurry! Let's get out before the lamp dies out!" +
				  get_movements(this.attributes['position-x'], this.attributes['position-y']) + "Which direction would you like to go?"
				 );
	},

	'GoItent' : function() {
		var dir = this.event.request.intent.slots.direction.value;
		if (!canMove(dir,this.attributes['position-x'], this.attributes['position-y'])) {
			this.emit(':ask', "You cannot go that direction." +
					  get_movements(this.attributes['position-x'], this.attributes['position-y']) + "Which direction would " +
					  "you like to go?");
			return;
		}

		switch(dir){
		case "north":
			this.attributes['position-x'] += 1;
			break;
		case "east":
			this.attributes['position-y'] += 1;
			break;
		case "south":
			this.attributes['position-x'] -= 1;
			break;
		case "west":
			this.attributes['position-x'] -= 1;
			break;
		}

		this.attributes['steps-left'] -= 1;

		if (this.attributes['position-x'] == 3) {
			this.emit(':tell', "Congratulations! You made it out of the dungeon!!");
			return;
		}

		if (this.attributes['steps-left'] == 0) {
			this.emit(':tell', "Oh no! The lantern has burned out!! You failed to make out it out of the dungeon. " +
					  "Better luck next time");
			return;
		}

		this.emit(':ask', "Now, " + get_movements(this.attributes['position-x'], this.attributes['position-y']) +
				  ". which direction would you like to go?");
	}

};

var dungeon = [
	[
		{
			"paths" : [
				"North",
				"East"
			]
		},
		{
			"paths" : [
				"North",
				"East",
				"South"
			]
		},
		{
			"paths" : [
				"East",
				"South"
			]
		}
	],
	[
		{
			"paths" : [
				"North",
				"East",
				"West"
			]
		},
		{
			"paths" : [
				"North",
				"East",
				"South",
				"West"
			]
		},
		{
			"paths" : [
				"East",
				"South",
				"West"
			],
			"doors" : [
				"North"
			]
		}
	],
	[
		{
			"paths" : [
				"North",
				"West"
			]
		},
		{
			"paths" : [
				"North",
				"South",
				"West"
			]
		},
		{
			"paths" : [
				"South",
				"West"
			]
		}
	]
];

var get_movements = function(posX, posY) {
	var curSpot = dungeon[posX][posY];
	var directions = "";
	curSpot.paths.forEach(function(d){
		directions += d + ", ";
	});
	return "You can pick to go one of the following directions, " + directions
};

var canMove = function(posX, posY, dir) {
	var curSpot = dungeon[posX][posY];
	if (curSpot.paths.indexOf(dir) > -1 ||
		(curSpot.hasOwnProperty("doors") && curSpot.doors.indexOf(dir) > -1)) {
		return true;
	}
	return false;
}

