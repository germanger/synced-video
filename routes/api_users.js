var express = require('express');
var _ = require('underscore');
var shared = require('../shared');

var router = express.Router();

router.get('/changeName', function(req, res, next) {

    if (!res.user) {
        return next(new Error('socketId not found in list of users'));
    }
    
    if (req.query.username == '' || req.query.username == undefined) {
        res.json({
            error: true,
            message: 'Blank name is not allowed'
        });
        
        return;
    }
    
    var oldUsername = res.user.username;
    res.user.username = req.query.username
    
    // Log
    var message = {
        messageType: 'userChangedName',
        timestamp: new Date(),
        user: {
            userId: res.user.userId,
            username: res.user.username
        },
        data: {
            oldUsername: oldUsername,
            newUsername: res.user.username
        }
    };
    
    shared.rooms[res.user.roomId].messages.push(message);
    
    // Broadcast
    shared.io.to(res.user.roomId).emit('userChangedName', {
        message: message
    });

    res.json({
        error: false,
        message: ''
    });
});

router.get('/changeColor', function(req, res, next) {

    if (!res.user) {
        return next(new Error('socketId not found in list of users'));
    }
    
    if (req.query.color == '') {
        res.json({
            error: true,
            message: 'Blank color is not allowed'
        });
        
        return;
    }
    
    res.user.color = req.query.color
    
    // Log
    var message = {
        messageType: 'userChangedColor',
        timestamp: new Date(),
        user: {
            userId: res.user.userId,
            username: res.user.username
        },
        data: {
            color: res.user.color
        }
    };
    
    shared.rooms[res.user.roomId].messages.push(message);
    
    // Broadcast
    shared.io.to(res.user.roomId).emit('userChangedColor', {
        message: message
    });

    res.json({
        error: false,
        message: ''
    });
});

router.get('/changeVideo', function(req, res, next) {

    if (!res.user) {
        return next(new Error('socketId not found in list of users'));
    }
    
    if (req.query.videoFileName == '') {
        res.json({
            error: true,
            message: 'videoFileName blank is not allowed'
        });
        
        return;
    }
	
    if (req.query.videoFileSize == '') {
        res.json({
            error: true,
            message: 'videoFileSize blank is not allowed'
        });
        
        return;
    }
    
    res.user.videoFileName = req.query.videoFileName;
	res.user.videoFileSize = req.query.videoFileSize;
	res.user.videoDuration = req.query.videoDuration;
    
    // Log
    var message = {
        messageType: 'userChangedVideo',
        timestamp: new Date(),
        user: {
            userId: res.user.userId,
            username: res.user.username
        },
        data: {
			videoFileName: req.query.videoFileName,
			videoFileSize: req.query.videoFileSize,
			videoDuration: req.query.videoDuration
        }
    };
    
    shared.rooms[res.user.roomId].messages.push(message);
    
    // Broadcast
    shared.io.to(res.user.roomId).emit('userChangedColor', {
        message: message
    });

    res.json({
        error: false,
        message: ''
    });
});

router.get('/updateIsTyping', function(req, res, next) {

    if (!res.user) {
        return next(new Error('socketId not found in list of users'));
    }
    
    res.user.isTyping = JSON.parse(req.query.isTyping);
       
    // Broadcast
    shared.io.to(res.user.roomId).emit('userUpdatedIsTyping', {
    });

    res.json({
        error: false,
        message: ''
    });
});

router.get('/updateIsAway', function(req, res, next) {

    if (!res.user) {
        return next(new Error('socketId not found in list of users'));
    }
    
    res.user.isAway = JSON.parse(req.query.isAway);
       
    // Broadcast
    shared.io.to(res.user.roomId).emit('userUpdatedIsAway', {
    });

    res.json({
        error: false,
        message: ''
    });
});

router.get('/list', function(req, res, next) {

    if (!res.user) {
        return next(new Error('socketId not found in list of users'));
    }
    
    res.json({
        error: false,
        users: _.chain(shared.users)
				.where({ roomId: res.user.roomId })
				.map(function (user) {
					return {
						userId: user.userId,
						username: user.username,
						videoFileName: user.videoFileName,
						videoFileSize: user.videoFileSize,
						videoDuration: user.videoDuration,
						color: user.color,
						playerState: user.playerState,
						isTyping: user.isTyping,
						isAway: user.isAway
					}
				}),
    });
});

module.exports = router;