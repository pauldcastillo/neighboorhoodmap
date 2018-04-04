var model = {
    buildRestaurants: function() {
        console.log("buildRestaurants");
        var getRestaurants = model.getRestaurants();
        var restaurants = [];

        getRestaurants.done( function(response) {
            console.log(response)
            response.response.groups[0].items.forEach(function(venue) {
                restaurants[venue.venue.name] = {
                    lat: venue.venue.location.lat,
                    lng: venue.venue.location.lng,
                    ratings: venue.venue.rating,
                };
            });
            viewModel.setMarkers(restaurants)
        });
        return restaurants;
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
    initApp: function() {
        viewMap.google()
        model.initModel()
    },

    getRestaurants: function() {
        var restaurants = model.restaurants;
        return restaurants
    },

    setMarkers: function(restaurants) {
        viewMap.setMarkers(restaurants)
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

        viewMap.map = new google.maps.Map(document.getElementById('map'), {
            center: default_lat_long,
            zoom: 16,
            mapTypeControl: false,
        });

        viewMap.map.setOptions(
            {
                styles: [
                    {
                        "featureType": "poi",
                        "stylers": [{"visibility": "off"}]
                    },
                    {
                        "featureType": "poi",
                        "elementType": "labels.text",
                        "stylers": [{"visibility": "off"}]
                    },
                    {
                        "featureType": "transit",
                        "stylers": [{"visibility": "off"}]
                    },
                    {
                        "featureType": "water",
                        "elementType": "labels.text",
                        "stylers": [{"visibility": "off"}]
                    }
                ],
            },
        );
    },

    setMarkers: function(restaurants) {
        console.log(restaurants)
        var largeInfowindow = new google.maps.InfoWindow();
        Object.keys(restaurants).forEach(function(key) {
            var rest = restaurants[key];
            var marker = new google.maps.Marker({
                map: viewMap.map,
                position: {lat: rest.lat, lng: rest.lng},
                title: key,
                animation: google.maps.Animation.DROP,
            });

            marker.addListener('click', function() {
                viewMap.populateInfoWindow(this, largeInfowindow);
            });
        });
    },

    populateInfoWindow: function(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.setContent('');
            infowindow.marker = marker;
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        };

        infowindow.setContent('<h3>' + marker.title + '</h3>')
        infowindow.open(viewMap.map, marker);
    }
}

viewModel.initApp()