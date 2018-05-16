var model = {
    buildRestaurants: function() {
        var getRestaurants = model.getRestaurants();
        var restaurants = [];

        getRestaurants.done( function(response) {
            response.response.groups[0].items.forEach(function(venue) {
                place = venue.venue;
                restaurants[place.name] = {
                    lat: place.location.lat,
                    lng: place.location.lng,
                    rating: place.rating,
                    food: place.categories[0].shortName,
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
        return model.restaurants;
    },

    getSpecificRest: function(key) {
        var rests = viewModel.getRestaurants();
        return rests[key];
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
        ko.applyBindings(new viewList.initViewList());
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
        viewMap.infowindow = new google.maps.InfoWindow();
        viewMap.markers = [];
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
                viewMap.populateInfoWindow(key);
                viewList.showInfo(key);

            });

            viewMap.markers[key] = marker;
        });
    },

    populateInfoWindow: function(key) {
        var infowindow = viewMap.infowindow;
        var marker = viewMap.markers[key];
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

var viewList = {
    initViewList: function() {
        self = this;

        self.buttonsList = ko.observableArray([]);

        self.restList = ko.observableArray([]);

        self.menuStatus = ko.observable(true);
        self.infoStatus = ko.observable(false);
        self.restName = ko.observable("");
        self.restFood = ko.observable("");
        self.restRating = ko.observable("");
        self.restAddress = ko.observable("");
        self.restPhone = ko.observable("");

        self.ratingsSpread = ko.observableArray(['All']);
        self.restaurants = ko.observableArray([]);

        var spread = viewModel.getRatingSpread();
        for (var i = spread.length - 2; i >= 0; i--) {
            buttonText = spread[i] + " - " + spread[i + 1];
            self.ratingsSpread.push(buttonText);
        };

        var allRestaurants = viewModel.getRestaurants();
        Object.keys(allRestaurants).forEach(function (key) {
            self.restaurants.push(key);
        });

        closeInfo = function() {
            viewList.closeInfo();
        };

        toggleMenu = function() {
            viewList.toggleMenu();
        };

        showInfo = function(key) {
            viewList.showInfo(key);
        };
    },

    closeInfo: function() {
        self.restName("");
        self.restFood("");
        self.restRating("");
        self.infoStatus(false);
    },

    toggleMenu: function() {
        self.menuStatus(! self.menuStatus());
        if (self.infoStatus()) {
            closeInfo();
        };
    },

    showInfo: function (key) {
        toggleMenu();
        self.infoStatus(true);
        var currentRest = viewModel.getSpecificRest(key);
        self.restName(key);
        self.restFood(currentRest.food);
        self.restRating(currentRest.rating);
        self.restPhone(currentRest.phone);
        self.restAddress(currentRest.address);
        viewMap.populateInfoWindow(key);
    },
}

viewModel.initApp()