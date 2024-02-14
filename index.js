global.DEBUG = true;
const http = require('http');
const fs = require('fs');
const fetchWeather = require('./fetchWeather')
const path = require('path');
const port = 3001;


// define/extend an EventEmitter class
const EventEmitter = require('events');
class MyEmitter extends EventEmitter {};
// initialize a new emitter object
const myEmitter = new EventEmitter();

myEmitter.on("statusLog", (url, statusCode)=>{
    const date = new Date;
    if(DEBUG) console.log(`The status code for ${url} is: ${statusCode}`)

    if(!fs.existsSync(path.join(__dirname, 'logs'))){
        fs.mkdirSync(path.join(__dirname, 'logs'));
    }
    fs.appendFile(path.join(__dirname, 'logs', 'status.log'), `The URL ${url} returned a ${statusCode} status code on ${date}\n`, (error)=>{if(error) throw error})

})

myEmitter.on("errorLog", (url, errorCode, message)=>{
    if(DEBUG) console.log(`URL: ${url}, Error Code: ${errorCode}, Message: ${message}`);

    const date = new Date;

    if(!fs.existsSync(path.join(__dirname, 'logs'))){
        fs.mkdirSync(path.join(__dirname, 'logs'));
    }
    fs.appendFile(path.join(__dirname, 'logs', 'error.log'), `The URL ${url} returned a ${errorCode} ${message} Error on ${date}\n`, (error)=>{if(error) throw error})

})

myEmitter.on("successLog", (url, statusCode, message)=>{
    if(DEBUG) console.log(`URL: ${url}, Status Code: ${statusCode}, Message: ${message}`);

    const date = new Date;

    if(!fs.existsSync(path.join(__dirname, 'logs'))){
        fs.mkdirSync(path.join(__dirname, 'logs'));
    }
    fs.appendFile(path.join(__dirname, 'logs', 'success.log'), `The URL ${url} returned a ${statusCode} status ${message} on ${date}\n`, (error)=>{if(error) throw error})

})

myEmitter.on("contactLog", (url, message)=>{
    if(DEBUG) console.log(`URL: ${url}, Message: ${message}`);

    const date = new Date;

    if(!fs.existsSync(path.join(__dirname, 'logs'))){
        fs.mkdirSync(path.join(__dirname, 'logs'));
    }
    fs.appendFile(path.join(__dirname, 'logs', 'contact.log'), `${message} - The URL ${url} was viewed on ${date}\n`, (error)=>{if(error) throw error})

})


const server = http.createServer((request, response)=>{
    if(DEBUG) console.log("The Requested URL is: ", request.url)

    let path = './views';

    switch(request.url){
        case '/':
            if(DEBUG) console.log('This is the Home Route');
            path += '/index.html';
            readFile(path, response)
            break;
        case '/about':
            if(DEBUG) console.log('This is the About Route');
            path += '/about.html';
            readFile(path, response)
            break;
        case '/products':
            if(DEBUG) console.log('This is the Products Route');
            path += '/products.html';
            readFile(path, response)
            break;
        case '/subscribe':
            if(DEBUG) console.log('This is the Subscribe Route');
            path += '/subscribe.html';
            readFile(path, response)
            break;
        case '/contact':
            if(DEBUG) console.log('This is the Contact Route - every time it is visited a new log entry is created.');
            path += '/contact.html';
            readFile(path, response)
            myEmitter.emit('contactLog', request.url, "Contact page was visited!")
            break;
        case '/error':
            if(DEBUG) console.log("This will demonstrate error logging");
            path += '/error.html';
            readFile(path, response);
            break;
        default:
            if(DEBUG) console.log("This will demonstrate a route not found");
            response.writeHead(404, {'Content-Type' : 'text/html'})
            response.end(`<h1>ERROR - 404 Not Found<h1/>`);
            myEmitter.emit('statusLog', request.url, response.statusCode);
            myEmitter.emit('errorLog', request.url, response.statusCode, response.statusMessage);
            break;
    }

    function readFile(fileName, response){
        fs.readFile(fileName, (error, content)=>{
            if (error){
                // Set appropriate error status code
                let statusCode = 500; // Internal Server Error
                if (error.code === 'ENOENT') {
                    statusCode = 404; // File Not Found
                }

                response.writeHead(statusCode, {'Content-Type': 'text/plain'});
                response.end(`${statusCode} ${error}`);
                myEmitter.emit('statusLog', request.url, statusCode);
                myEmitter.emit('errorLog', request.url, statusCode, error.message);
            } else{
                fetchWeather("St. Johns, NL", (err, currentDate, location, currentTemp, feelslike, humidity, windspeed, forecastString) => {
                    if (err) {
                        console.error(err);
                        // Handle error
                    } else {
                        // Replace placeholders in HTML content with weather data
                        const weatherData = content.toString().replace(/data1/g, (
                            `<div>
                                <p>Location: ${location}</p>
                                <p>Current Date: ${currentDate}</p>
                                <p>Temp: ${currentTemp}, Feels like: ${feelslike}</p>
                                <p>Humidity: ${humidity}</p>
                                <p>Wind Speed: ${windspeed}</p>
                            <div/>
                            <div>
                                <p>Forecast:<p/>
                                <p>${forecastString}</p>
                            <div/>`
                        ))
        
                        response.writeHead(200, { 'Content-Type': 'text/html' });
                        response.write(weatherData);
                        response.end();
                        myEmitter.emit('statusLog', request.url, response.statusCode);
                        myEmitter.emit('successLog', request.url, response.statusCode, response.statusMessage);
                    }
                });
                console.log(`File located at ${fileName} is read successfully`)
            
            }
        })
    }

})

server.listen(port, ()=>{
    console.log(`Server is running...on port ${port}`)
})

