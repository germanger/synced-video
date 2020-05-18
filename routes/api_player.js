var express = require('express');
var _ = require('underscore');
var shared = require('../shared');

var router = express.Router();

router.get('/info', function(req, res, next) {

    if (!res.user) {
        return next(new Error('socketId not found in list of users'));
    }

    res.json({
        error: false,
        player: shared.rooms[res.user.roomId].player
    });
});

router.get('/submitState', function(req, res, next) {
    
    if (!res.user) {
        return next(new Error('socketId not found in list of users'));
    }
    
    res.user.playerState = parseInt(req.query.state);
       
    // Log
    var message = {
        messageType: 'userChangedPlayerState',
        timestamp: new Date(),
        user: {
            userId: res.user.userId,
            username: res.user.username,
            playerState: res.user.playerState
        }
    };
    
    shared.rooms[res.user.roomId].messages.push(message);

    // Broadcast
    shared.io.to(res.user.roomId).emit('userChangedPlayerState', {
        message: message
    });
    
    res.json({
        error: false
    });
});

router.get('/submitCommand', function(req, res, next) {
    
    if (!res.user) {
        return next(new Error('socketId not found in list of users'));
    }
	
	// Play
	if (parseInt(req.query.state) == 1) {

		// Check that all users have the same videoFileName 		
		var shouldPlay = true;
		
		_(shared.users)
			.each(function(item) {
				
				if (item.roomId != res.user.roomId) {
					return;
				}
				
				if (item.videoFileName != res.user.videoFileName) {
					shouldPlay = false;
				}
			});
			
		if (!shouldPlay) {
			res.json({
				error: true,
				message: 'All users must select the same local file'
			});
			
			return;
		}
	}
    
    shared.rooms[res.user.roomId].player.time = req.query.time;
    shared.rooms[res.user.roomId].player.state = parseInt(req.query.state);
       
    // Log
    var message = {
        messageType: 'userSentCommand',
        timestamp: new Date(),
        user: {
            userId: res.user.userId,
            username: res.user.username
        },
        player: shared.rooms[res.user.roomId].player
    };
    
    shared.rooms[res.user.roomId].messages.push(message);

    // Broadcast
    shared.io.to(res.user.roomId).emit('userSentCommand', {
        player: shared.rooms[res.user.roomId].player,
        message: message
    });
    
    res.json({
        error: false
    });
});

module.exports = router;