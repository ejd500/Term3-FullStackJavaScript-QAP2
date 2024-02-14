const weather = require('weather-js');

function fetchWeather(location, callback){
    console.log("Fetching weather is working!")
    // Fetch weather information
    weather.find({ search: location, degreeType: 'C' }, function(err, result) {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            // console.log(result);
            
            // console.log(result[0].current.date);
            var currentDate = result[0].current.date
            
            // console.log(result[0].location.name);
            var location = result[0].location.name;
            
            // console.log(result[0].current.temperature);
            var currentTemp = result[0].current.temperature
            
            // console.log(result[0].current.feelslike);
            var feelslike = result[0].current.feelslike
            
            // console.log(result[0].current.humidity);
            var humidity = result[0].current.humidity
            
            // console.log(result[0].current.windspeed);
            var windspeed = result[0].current.windspeed
            
            var forecastArray = result[0].forecast
            // console.log(forecastArray);
        
            var forecastString = JSON.stringify(forecastArray);

            callback(null, currentDate, location, currentTemp, feelslike, humidity, windspeed, forecastString); // Return data to the callback
        }
        
    });
}

module.exports = fetchWeather;