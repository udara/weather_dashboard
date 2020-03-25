const Weather = {

    properties :{
        api_key : "08d6ce794cdf279b6219aa4a39a325d7",
        api_url_current : "https://api.openweathermap.org/data/2.5/weather?",
        api_url_forcast : "https://api.openweathermap.org/data/2.5/forecast?"
    },

     callAPI: async function(url,city) {
        return $.ajax({
            url: url +  `q=${city}&appid=` + this.properties.api_key,
            type: 'GET',
            data: {
              key: 'value',
            }
          });
      },

      renderTodaysWeather: async function(response) {
        consle.log(response);
      },
};


$("#search").on( "click", function() {

  Weather.callAPI( Weather.properties.api_url_current ,'Adelaide').then(response => {
    console.log(response);
  }) 
  .catch(error => {
    console.log(error.status);
  })

  Weather.callAPI( Weather.properties.api_url_forcast ,'Adelaide').then(response => {
    console.log(response);
  }) 
  .catch(error => {
    console.log(error.status);
  })

});


