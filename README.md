Christmas Jumper API
=================

A Node.js server + microphone collecting HTML page that detects songs, and returns various festive themed iconography.

## Running

First, make sure you `npm install`.

Browsing to the root of the webserver on http://localhost:12271 will take you to the audio capture page.

You can start the app by running `npm start`.

    > npm start
    
    > hello-express@0.0.1 start C:\dev\christmas-jumper
    > node server.js
    
    Your app is listening on port 12271

If you want to develop against this with hot-reload and debugging enabled, first, make sure you've installed nodemon

    > npm install -g nodemon
    
then you can simply run `npm run devserver`

    > npm run devserver
    
    > hello-express@0.0.1 devserver C:\dev\christmas-jumper
    > nodemon --inspect server.js
    
    [nodemon] 1.19.4
    [nodemon] to restart at any time, enter `rs`
    [nodemon] watching dir(s): *.*
    [nodemon] watching extensions: js,mjs,json
    [nodemon] starting `node --inspect server.js`
    Debugger listening on ws://127.0.0.1:9229/5ce30222-84d5-4b69-81bd-23a6b1647594
    For help, see: https://nodejs.org/en/docs/inspector
    Your app is listening on port 12271

This will run the server on the same port, with --inspect enabled to connect `VSCode` or `WebStorm` debuggers to step through the code.
It'll also hot-reload any javascript changes, so you don't have to cycle your node process during dev.

* For VSCode see: https://code.visualstudio.com/docs/nodejs/nodejs-debugging
* For WebStorm see: https://www.jetbrains.com/help/webstorm/running-and-debugging-node-js.html

## Testing

Requires jest. You probably want to

    > npm install -g jest

and restart your terminal for this to work well.

From the command line, run `npm test` (or just `jest`) - to run the entire test suite.

    > npm test
    
    > hello-express@0.0.1 test C:\dev\christmas-jumper
    > jest
    
     PASS  commands/SongDetector.test.js (5.092s)
      Song detector
        √ Execute returns song title from AudD API call. (2ms)
        √ Execute calls AudD with API token from configuration
        √ Execute instructs AudD to download song from azure blob storage
        √ Integration test: Can detect song that we know about when run against the real AudD API (3952ms)
    
    Test Suites: 1 passed, 1 total
    Tests:       4 passed, 4 total
    Snapshots:   0 total
    Time:        5.741s
    Ran all test suites.

Or use your favourite jest supporting tool.

## Usage

Just open your browser!

## Configuration

Configuration for Azure storage buckets and AudD API keys is stored in config.js.
