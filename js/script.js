const Weather = {

    properties : {
        api_key : "08d6ce794cdf279b6219aa4a39a325d7",
        api_url_current : "https://api.openweathermap.org/data/2.5/weather?",
        api_url_forcast : "https://api.openweathermap.org/data/2.5/forecast?",
        api_url_uv_index : "https://api.openweathermap.org/data/2.5/uvi?",
        api_url_icons : 'http://openweathermap.org/img/wn/',
        display_units : 'metric',
        lattitude : '',
        longitude : ''
    },

    /* saveHistory function poulate history [] so retrieveHistory fucntion can use it to populate search history*/
    history : [],

    /* take url of an API and query parameter string to return a response */
     callAPI: async function(url,query_string) {
        return $.ajax({
            url: url +  query_string,
            type: 'GET'
          });
      },

      /*Display current weather of the City being searched*/
      renderTodaysWeather: function(response) {
        $('#main-city').text(response.name). append(' ('). 
        append( this.convertUnixTimeStampToDate(response.dt) ). append(')'). 
        append(this.renderWeatherIcon(response.weather[0].icon));
        $('#main-temperature').text(response.main.temp) . append(' °C');
        $('#main-humidity').text(response.main.humidity) . append('%');
        $('#main-windspeed').text(this.convertMeterstoKms(response.wind.speed));
      },

      
      getCurrentWeather: function(city){
          var query_string_weather = `units=${Weather.properties.display_units}&q=${city}&appid=${Weather.properties.api_key}`;
          Weather.callAPI( Weather.properties.api_url_current , query_string_weather).then(response => {
          Weather.renderTodaysWeather(response);
          Weather.properties.lattitude =  response.coord.lat; // assigning lattitude and longitude ptoperties 
          Weather.properties.longitude =  response.coord.lon; // so it can be used by getUVIndex() below
          Weather.getUVIndex();
          Weather.saveHistory($('#city').val()); // save current city to search history
          Weather.populateHistory(); // populate latest search history
        }) 
        .catch(error => {
          Weather.handleError(error.responseJSON.message); // if an error occurs call handleError fucntion with the error message
        });
      },

      getForecast: function(city){
          var query_string_weather = `units=${Weather.properties.display_units}&q=${city}&appid=${Weather.properties.api_key}`;
          Weather.callAPI( Weather.properties.api_url_forcast , query_string_weather).then(response => {
            $('#five-day-forecast').html(''); // reset #five-day-forecast div to nothing before populating with latest forcast boxes
            for (let i = 0; i < response.list.length; i) {
            $('#five-day-forecast').append(Weather.renderForcastBox(response.list[i]));
            i = i + 8; // five day forcast is a three hourly forecast with 8 forcasets per day
            }
        }) 
        .catch(error => {
          Weather.handleError(error.responseJSON.message); // if an error occurs call handleError fucntion with the error message
        })
      },

      getUVIndex: function(){
        var query_string_uv_index = `appid=${this.properties.api_key}&lat=${this.properties.lattitude}&lon=${this.properties.longitude}`;
        Weather.callAPI( Weather.properties.api_url_uv_index , query_string_uv_index).then(response => {
          $('#main-uvindex').text(response.value);
          var uvclass = ""
          var uvvale = response.value;
          if(uvvale < 2.9) { uvclass = 'green'; } /* Color code according to UV index */
          else if(uvvale > 3 && uvvale < 4.9) { uvclass = 'yellow'; }
          else if(uvvale > 5 && uvvale < 7.9) { uvclass = 'orange'; }
          else if(uvvale > 8 && uvvale < 10.9) { uvclass = 'red'; }
          else { uvclass = 'darkred'; }
          $('#main-uvindex').css("background-color", uvclass);
        }) 
        .catch(error => {
          Weather.handleError(error.message);
        });
      },

      renderForcastBox: function(response) {
        var card = "";
        card = '<div class="card col-12 col-sm-12 col-md-2 text-center"> <div class="card-body">';
        card += `<p>${this.convertUnixTimeStampToDate(response.dt)}</p>`;
        card += this.renderWeatherIcon(response.weather[0].icon);
        card += `<p> ${response.main.temp} °C</p>`;   
        card += '</div></div>';
        return card;
      },

      convertMeterstoKms : function(meters) {
        return ( Math.floor (meters * 3600/1000) ).toString() + 'Kms';
      },

      convertUnixTimeStampToDate: function(unix_time_stamp){
        return moment.unix(unix_time_stamp).format("DD/MM/YYYY");
      },

      renderWeatherIcon: function(icon_code){
        var full_url = this.properties.api_url_icons + icon_code +'@2x.png';
        return `<img src ="${full_url}" class="weather-icon">`;
      },

      saveHistory : function(city){
        if(!this.history.includes(city) && city !="") {  /*If city is already in array do not add again*/
          this.history.push(city);
          localStorage.setItem('weather_dashboard', JSON.stringify(this.history));
        }
      },

      retrieveHistory : function()
      {
        if (localStorage.getItem('weather_dashboard')){
          Weather.history =  JSON.parse(localStorage.getItem('weather_dashboard'));
          Weather.populateHistory();
          Weather.getCurrentWeather(Weather.history[Weather.history.length-1]);
          Weather.getForecast(Weather.history[Weather.history.length-1]);
        }
      },

      populateHistory : function(){
        $('#search-history').html('');
        for (let i = 0; i < this.history.length; i++) {
          $('#search-history').append(`<div data-city="${this.history[i]}" class="search-history col-12 p-2 border rounded primary">${this.history[i]}</div>`);
        }
      },

      handleError : function(error){
        $('.error-body').html(error);
        $('#myModal').modal('show');
      }
};


$( document ).ready(function() {

  Weather.retrieveHistory();

  function triggerAPICalls(city)
  {
    Weather.getCurrentWeather(city);
    Weather.getForecast(city);
  }

  $('body').on('click', '.search-history', function() {
    triggerAPICalls($(this).attr("data-city"));
  });

  $("#search").on( "click", function() {
    if($('#city').val().length >= 4)
    {
      triggerAPICalls($('#city').val());
    }
    else {
      Weather.handleError('City must be more than 4 characters long');
    }
  });

});



