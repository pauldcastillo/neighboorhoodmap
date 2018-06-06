var model = {
    buildRestaurants: function() {
        // Set foursquare calls
        const getRestaurants = model.getRestaurants();

        // Set empty restaurants array
        let restaurants = [];

        getRestaurants.done( function(response) {
            response.response.groups[0].items.forEach(function(venue) {
                place = venue.venue;
                restaurants[place.name] = {
                    name: place.name,
                    lat: place.location.lat,
                    lng: place.location.lng,
                    food: place.categories[0].shortName,
                    address: place.location.address + " " + place.location.formattedAddress[1],
                };
            });
            view.initElements(restaurants)
        });
        return restaurants;
    },

    filterRests: function (filter) {
        // If the filter is All return all restaurants.
        if (filter === "All") {
            return model.restaurants;
        } else {
            // Check which restaurants match the filter and return those.
            const restFilter = filter;
            const rests = model.restaurants;
            let filteredRests = [];
            Object.keys(model.restaurants).forEach(function (key) {
                if (rests[key].food === restFilter) {
                    filteredRests[key] = rests[key];
                };
            });
            return filteredRests;
        };

    },

    getRestaurants: function() {
        const $foursquareRests = $.ajax({
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
                window.alert("An error occurred getting the restaurants. Please refresh the page and try again.");
            },
            error: function (error) {
                console.log("Error getting restaurants");
                console.log(error.responseJSON);
                window.alert("An error occurred getting the restaurants. Please refresh the page and try again.");
            },
        });

        return $foursquareRests;
    },

    initModel: function() {
        model.restaurants = model.buildRestaurants()
    },

    getTypeSpread: function() {
        var typeList = [];
        Object.keys(model.restaurants).forEach( function(key) {
            typeList.push(model.restaurants[key].food);
        });
        return typeList.sort();
    }
}

var view = {
    filterRests: function(filter) {
         let filteredRests = model.filterRests(filter);
         viewMap.deleteAllMarkers();
         viewMap.setMarkers(filteredRests);
         return filteredRests;
    },

    getRestaurants: function() {
        return model.restaurants;
    },

    getSpecificRest: function(key) {
        var rests = view.getRestaurants();
        return rests[key];
    },

    initApp: function() {
        viewMap.google();
    },

    initRests: function() {
        model.initModel();
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
    deleteAllMarkers: function() {
        Object.keys(viewMap.markers).forEach(function(key) {
            viewMap.markers[key].setMap(null);
        });

        viewMap.markers = [];
    },

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
                console.log("Error getting map");
                console.log(error);
                window.alert('An error occurred while initializing the map. Please refresh the page and try again.');
            }),
            error: (function (error) {
                console.log("Error getting map");
                console.log(error);
                window.alert('An error occurred while initializing the map. Please refresh the page and try again.');
            }),
            success: (function () {
                viewMap.initMap();
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

        view.initRests()
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
                type: rest.food,
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
            if (infowindow.marker) {
                infowindow.marker.setAnimation(null)
            };
            infowindow.setContent('');
            infowindow.marker = marker;
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
                viewMap.markers[key].setAnimation(null);
            });
        };

        marker.setAnimation(google.maps.Animation.BOUNCE);
        infowindow.setContent('<h3>' + marker.title + '</h3><span class="rating">Food Type: ' + marker.type + '</span><br><span>Information collected from FOURSQUARE.</span>')
        infowindow.open(viewMap.map, marker);
    }
}

var viewList = {
    initViewList: function() {
        self = this;

        self.buttonsList = ko.observableArray(["All", ]);

        self.restList = ko.observableArray([]);

        self.menuStatus = ko.observable(true);
        self.infoStatus = ko.observable(false);

        self.restName = ko.observable("");
        self.restFood = ko.observable("");
        self.restAddress = ko.observable("");

        self.restaurants = ko.observableArray([]);

        self.typeFilter = ko.observable();

        const allRestaurants = view.getRestaurants();
        Object.keys(allRestaurants).forEach(function (key) {
            self.restaurants.push(key);
            const restFood = allRestaurants[key].food;
            if (self.buttonsList().includes(restFood) != true) {
                self.buttonsList.push(allRestaurants[key].food);
            };
        });

        closeInfo = function() {
            viewList.closeInfo();
        };

        filterRests = function() {
            const filteredRests = view.filterRests(self.typeFilter());
            let filteredRestsKeys = [];

            Object.keys(filteredRests).forEach(function (key) {
                filteredRestsKeys.push(key);
            });

            self.restaurants(filteredRestsKeys);
        }

        showInfo = function(key) {
            viewList.showInfo(key);
        };

        toggleMenu = function() {
            viewList.toggleMenu();
        };
    },

    closeInfo: function() {
        self.restName("");
        self.restFood("");
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
        const currentRest = view.getSpecificRest(key);
        self.restName(key);
        self.restAddress(currentRest.address);
        self.restFood(currentRest.food);
        viewMap.populateInfoWindow(key);
    },
}

view.initApp()