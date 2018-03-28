var model = {
    buildRestaurants: function() {
        console.log("buildRestaurants");
        var getRestaurants = model.getRestaurants();
        var restaurants = [];

        getRestaurants.done( function(response) {
            response.response.groups[0].items.forEach(function(venue) {
                restaurants[venue.venue.name] = {
                    lat: venue.venue.location.lat,
                    lng: venue.venue.location.lng,
                    ratings: venue.venue.rating,
                };
            });
            return restaurants;
        });
        return restaurants
    },
    getRestaurants: function() {
        var $foursquare = $.ajax({
            url: 'https://api.foursquare.com/v2/venues/explore',
            data: {
                near: "San Mateo, CA",
                section: "food",
                novelty: "new", 
                client_id: "54LQWYWO5SVAYVORI3B4FUAFTEYA05SORU0QUUUQ5TFL24HY",
                client_secret: "ZNRD3YLNWEMARFJIFXGILOIQZLDVFBNGHCXG1AHA5RH3EFBS",
                v:"20170801",
                limit: 10,
            }
        }).fail( function (e) {
            console.log("fail");
            console.log(e);
        });

        return $foursquare
    },

    initModel: function() {
        model.restaurants = model.buildRestaurants()
    }
}

var viewModel = {
    getRestaurants: function() {
        var restaurants = model.restaurants;
        return restaurants
    },
}

var viewMap = {
    google: function() {
        $.ajax({
            url: 'https://maps.googleapis.com/maps/api/js',
            data: {
                key: 'AIzaSyCTBfBVBLQOsZDioySrUjhU1UuIYLwaavQ',
                v:'3',
                callback: "viewMap.initMap"
            },
            dataType: "jsonp"
        });
    },

    initMap: function() {
        console.log("call initMap")
        var map;

        var default_lat_long = {lat: 37.565315, lng: -122.322315};

        map = new google.maps.Map(document.getElementById('map'), {
            center: default_lat_long,
            zoom: 16,
            mapTypeControl: false
        });

        var rests =  viewModel.getRestaurants()
        Object.keys(rests).forEach(function(key) {
            var rest = rests[key];
            var marker = new google.maps.Marker({
                map: map,
                position: {lat: rest.lat, lng: rest.lng},
                title: key,
                animation: google.maps.Animation.DROP,
            });
        });
    },

}

model.initModel()
viewMap.google()