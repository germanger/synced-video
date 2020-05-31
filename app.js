// Modules used in this file
var http = require('http');
var express = require('express'), app = module.exports.app = express();
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var shortid = require('shortid');
var server = http.createServer(app);
var shared = require('./shared');
var _ = require('underscore');

// A default engine is required, even though we render plain html
app.set('views', './public');
app.set('view engine', 'ejs');

// Socket.io
shared.io = require('socket.io').listen(server);

shared.io.sockets.on('connection', function (socket) {
    var roomId = socket.handshake.query.roomId;
    
    if (!(roomId in shared.rooms)) {

        // new room
        roomId = shortid.generate();
        shared.rooms[roomId] = {
            roomId: roomId,
            messages: [],
            player: {
                time: 0,
                state: 2,
            }
        };
    }
	
	// Pause video when new user arrives
	shared.rooms[roomId].player.state = 2;
    
    socket.join(roomId);
    
    // new user
    var userId = shortid.generate();
	
	var randomColor = (function lol(m, s, c) {
			return s[m.floor(m.random() * s.length)] +
				(c && lol(m, s, c - 1));
		})(Math, '3456789ABCDEF', 4);
		
	var suggestedNames = [
		"Stanley Kubrick",
		"Ingmar Bergman",
		"Alfred Hitchcock",
		"Akira Kurosawa",
		"Orson Welles",
		"Federico Fellini",
		"John Ford",
		"Jean-Luc Godard",
		"Luis Buñuel",
		"Martin Scorsese",
		"Robert Bresson",
		"Charles Chaplin",
		"Jean Renoir",
		"Howard Hawks",
		"Steven Spielberg",
		"Michelangelo Antonioni",
		"Andrei Tarkovsky",
		"David Lynch",
		"Yasujirô Ozu",
		"Billy Wilder",
		"Fritz Lang",
		"Carl Theodor Dreyer",
		"Francis Ford Coppola",
		"F.W. Murnau",
		"Terrence Malick",
		"Sergei M. Eisenstein",
		"David Lean",
		"Michael Powell",
		"François Truffaut",
		"Kenji Mizoguchi",
		"Woody Allen",
		"Robert Altman",
		"Vittorio De Sica",
		"Satyajit Ray",
		"Sidney Lumet",
		"Roman Polanski",
		"Roberto Rossellini",
		"Luchino Visconti",
		"John Cassavetes",
		"Sergio Leone",
		"D.W. Griffith",
		"Buster Keaton",
		"Werner Herzog",
		"Krzysztof Kieslowski",
		"Abbas Kiarostami",
		"Béla Tarr",
		"Michael Haneke",
		"Lars von Trier",
		"Joel Coen",
		"Quentin Tarantino",
		"John Huston",
		"Frank Capra",
		"Pedro Almodóvar",
		"Kar-Wai Wong",
		"Paul Thomas Anderson",
		"David Fincher",
		"Jean-Pierre Melville",
		"Henri-Georges Clouzot",
		"William Wyler",
		"Elia Kazan",
		"Christopher Nolan",
		"Richard Linklater",
		"Mike Leigh",
		"Yimou Zhang",
		"Spike Lee",
		"Douglas Sirk",
		"Alain Resnais",
		"Jacques Tati",
		"Oliver Stone",
		"Brian De Palma",
		"Rainer Werner Fassbinder",
		"Wim Wenders",
		"Hsiao-Hsien Hou",
		"David Cronenberg",
		"Edward Yang",
		"Terry Gilliam",
		"Pier Paolo Pasolini",
		"Bernardo Bertolucci",
		"Ridley Scott",
		"James Cameron",
		"Max Ophüls",
		"Ernst Lubitsch",
		"Josef von Sternberg",
		"Jacques Demy",
		"Preston Sturges",
		"Jean Cocteau",
		"Mike Nichols",
		"Milos Forman",
		"Alfonso Cuarón",
		"Alejandro G. Iñárritu",
		"Hayao Miyazaki",
		"Sam Peckinpah",
		"Samuel Fuller",
		"Chantal Akerman",
		"Agnès Varda",
		"Nicolas Roeg",
		"Ken Loach",
		"Wes Anderson",
		"Darren Aronofsky",
		"Alejandro Jodorowsky"
	];
    
    var user = {
        roomId: roomId,
        userId: userId,
        socketId: socket.id,
        username: suggestedNames[Math.floor(Math.random() * suggestedNames.length)],
		color: "#" + randomColor,
		videoFileName: "",
		videoFileSize: 0,
		videoDuration: 0
    };

    shared.users[socket.id] = user;
    
    // Log
    var message = {
        messageType: 'userConnected',
        timestamp: new Date(),
        user: {
            userId: user.userId,
			color: user.color,
            username: user.username
        }
    };
    
    shared.rooms[roomId].messages.push(message);
    
    // Respond to him
    socket.emit('welcome', {
        user: user,
        roomId: roomId
    });

    // Broadcast
    shared.io.to(roomId).emit('userConnected', {
        message: message
    });
    
    socket.on('disconnect', function() {
        
        delete shared.users[socket.id];
       
        // Log
        var message = {
            messageType: 'userDisconnected',
            timestamp: new Date(),
            user: {
                userId: user.userId,
                username: user.username
            }
        };
        
        shared.rooms[roomId].messages.push(message);
        
        // Broadcast
        shared.io.to(roomId).emit('userDisconnected', {
            message: message
        });
    });
});

// Start server
server.listen(process.env.PORT || 3000);

// Middleware: app.use([path], f),
//    [path] is optional, default is '/'
//    f acts as a middleware function to be called when the path matches
// The order of which middleware are defined is important (eg. move logger down)
app.use('/', bodyParser.json());
app.use('/', bodyParser.urlencoded());
app.use('/', cookieParser('cookieSecret'));
app.use('/', express.static('./public')); // Serve any file under /public
app.use('/', logger('dev'));

// My middleware (It is a sort of "base controller")
// Executed in every "/api/.*" request, after all the previous app.use(),
// unless those app.use() finish the cycle (for example getting /img/logo.png will finish there)
app.use('/api/', function(req, res, next) {

    res.user = undefined;
       
    if (req.query.socketId != null) {
        res.user = shared.users[req.query.socketId];
    }

    next();
});

// Router
app.use('/', require('./routes/viewsRoutes'));
app.use('/api/users', require('./routes/api_users'));
app.use('/api/messages', require('./routes/api_messages'));
app.use('/api/player', require('./routes/api_player'));
app.use('/api/server', require('./routes/api_server'));

// development error handler will print stacktrace
/*
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        
        res.json({
            error: true,
            message: err.message
        });
    });
}
*/

// production error handler (no stacktraces leaked to user)
app.use(function(err, req, res, next) {
    //res.status(err.status || 500);
    res.status(200);
    
    res.json({
        error: true,
        message: err.message
    });
});

module.exports = app;

console.log("Running...");