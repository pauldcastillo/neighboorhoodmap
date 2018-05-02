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
                    rating: venue.venue.rating,
                };
            });
            viewModel.initElements(restaurants)
        });
        return restaurants;
    },
    getRestaurants: function() {
        var $foursquare = $.ajax({
            url: 'https://api.foursquare.com/v2/venues/explore',
            data: {
                near: "San Mateo, CA",
                section: "food",
                client_id: "54LQWYWO5SVAYVORI3B4FUAFTEYA05SORU0QUUUQ5TFL24HY",
                client_secret: "ZNRD3YLNWEMARFJIFXGILOIQZLDVFBNGHCXG1AHA5RH3EFBS",
                v:"20170801",
                radius: 3000,
            },
            timeout: 3000,
            fail: function (error) {
                console.log("Error getting restaurants");
                console.log(error.responseJSON);
                window.alert('An error occurred getting the restaurants. Please refresh the page and try again.');
            },
            error: function (error) {
                console.log("Error getting restaurants");
                console.log(error.responseJSON);
                window.alert('An error occurred getting the restaurants. Please refresh the page and try again.');
            },
        });

        return $foursquare
    },

    initModel: function() {
        model.restaurants = model.buildRestaurants()
    },

    getRatingSpread: function() {
        var ratingsList = [];
        Object.keys(model.restaurants).forEach( function(key) {
            ratingsList.push(model.restaurants[key].rating);
        });
        ratingsList.sort();

        var roundToHundredths = function(num) {
            return Math.round(num * 100) / 100;
        }

        var iterator = roundToHundredths((ratingsList[ratingsList.length - 1] - ratingsList[0]) / 5);
        var buttons = [];
        for (var i = 1; i <= 6; i++) {
            buttons.push(roundToHundredths(ratingsList[0] + (iterator * (i - 1))));
        };
        return buttons.sort();
    }
}

var viewModel = {
    getRestaurants: function() {
        var restaurants = model.restaurants;
        return restaurants
    },

    getRatingSpread: function() {
        return model.getRatingSpread()
    },

    initApp: function() {
        viewMap.google()
    },

    initRests: function() {
        model.initModel()
    },

    initElements: function(restaurants) {
        viewMap.setMarkers(restaurants);
        ko.applyBindings(new viewList());
    },

    setMarkers: function(restaurants) {
        viewMap.setMarkers(restaurants);
    },
}

var viewMap = {
    google: function() {
        $.ajax({
            url: 'https://maps.googleapis.com/maps/api/js',
            data: {
                key: 'AIzaSyCTBfBVBLQOsZDioySrUjhU1UuIYLwaavQ',
                v:'3',
            },
            dataType: "jsonp",
            timeout: 3000,
            fail: (function (error) {
                console.log("Error getting map")
                console.log(error)
                window.alert('An error occurred while initializing the map. Please refresh the page and try again.');
            }),
            error: (function (error) {
                console.log("Error getting map")
                console.log(error)
                window.alert('An error occurred while initializing the map. Please refresh the page and try again.');
            }),
            success: (function () {
                viewMap.initMap()
            }),
        });
    },

    initMap: function() {
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

        viewModel.initRests()
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
                rating: rest.rating,
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

        infowindow.setContent('<h3>' + marker.title + '</h3><span class="rating">Rating: ' + marker.rating + '</span><br><span>Information collected from FOURSQUARE.</span>')
        infowindow.open(viewMap.map, marker);
    }
}

var viewList = function () {
    var self = this;

    self.buttonsList = ko.observableArray([]);

    self.restList = ko.observableArray([]);

    self.menuClose = ko.observable(true);
    self.menuOpen = ko.observable(false);

    spread = viewModel.getRatingSpread();

    for (var i = 0; i <= spread.length - 2; i++) {
        buttonText = spread[i] + " - " + spread[i + 1];
        self.buttonsList.push(buttonText);
    };

    showMenu = function () {
        console.log("show menu")
        self.menuClose(false);
        self.menuOpen(true);
    };

    closeMenu = function () {
        self.menuOpen(false);
        self.menuClose(true)
    }
}

viewModel.initApp()