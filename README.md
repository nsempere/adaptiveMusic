# adaptiveMusic

### Setup
1. Install Node.js
2. Install NPM
3. Install MongoDB
4. Run "npm install" in terminal
5. In the terminal, run "mongod" to start up the database server.
6. Run "npm start" or "nodemon ./bin/www" to start up the server.

### Purpose
This server runs a simple web experiment that loads a randomly selected song and 
plays it while the user performs an nback task. At the same time, the user can 
rate the music based on how pleasant it is and how distracting it is. Each adjustment 
to the ratings is stored with a timestamp relative to the song that is playing.
  
