# synced-video
A synced multiuser video player

## Demo
The master branch is directly deployed to heroku: https://synced-video.herokuapp.com/

## Installation

1. Run `npm install`
2. Run `node app.js`
3. Go to http://localhost:3000

## Server side

- Node.JS
- Express
- socket.io

### Routes

- `'/'` : Endpoint for connecting to the socket.io server
- `'/'` : Also returns `index.html` (angular app)
- `'/api/users/list'` : Expects a `socketId`. Returns list of the users in the current room.
- `'/api/users/changeName'` : Expects a `socketId` and a `username`
- `'/api/users/changeColor'` : Expects a `socketId` and a `color`
- `'/api/users/changeVideo'` : Expects a `socketId`, a `videoFileName` and a `videoFileSize`
- `'/api/users/updateIsTyping'` : Expects a `socketId` and a `isTyping`
- `'/api/messages/list'` : Expects a `socketId`. List of messages in the current room.
- `'/api/messages/submit'` : Expects a `socketId` parameter and a `body` parameter
- `'/api/messages/clear'` : Expects a `socketId`. Clears all messages.
- `'/api/player/info'` : Expects a `socketId`. Gets the current room player info (current video, time and state)
- `'/api/player/submitState'` : Expects a `socketId` and a `state`
- `'/api/player/submitCommand'` : Expects a `socketId`, a `state` (play, pause), and a `time` (in seconds)
- `'/api/server/info'` : Returns info about the server (eg. port)

## Client side

The following scripts are referenced directly in public/index.html

- Angularjs 1.3.14
- Angular's Boostrap UI 0.12.1
- Bootstrap CSS 3.3.4
- HTML 5 (video)
- socket.io 1.3.5
- toaster (notifications) 0.4.12
- scrollglue (scroll to bottom of divs)

## TO-DOs

- Consider a possible "buffering" state
- Player's timeline control
- Player's volume control
- Player's currentTime/totalTime indicator

## Screenshot

![Screenshot](https://raw.githubusercontent.com/germanger/synced-video/master/screenshot.png)
