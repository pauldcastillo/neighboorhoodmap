var model = {
    buildRestaurants: function() {
        /**
        * @description Call the foursquare api, then loop through the results
        * @returns {array} array of restaurants objects
        */
        // Set foursquare calls
        const getRestaurants = model.getRestaurants();

        // Set empty restaurants array
        let restaurants = [];

        // Call foursquare
        getRestaurants.done( function(response) {
            // For each venue, make a restaurant object
            response.response.groups[0].items.forEach(function(venue) {
                place = venue.venue;
                restaurants[place.name] = {
                    name: place.name,
                    lat: place.location.lat,
                    lng: place.location.lng,
                    food: place.categories[0].shortName,
                    address: place.location.address +
                        ' ' +
                        place.location.formattedAddress[1],
                };
            });
            // Start up the page elements with the given restaurants
            view.initElements(restaurants)
        });
        return restaurants;
    },

    filterRests: function (filter) {
        /**
        * @description filter restaurants with the given filter
        * @param {string} filter - The food type to filter
        * @returns {array} array of restaurants
        */
        // If the filter is All return all restaurants.
        if (filter === 'All') {
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
        /**
        * @description API call to foursquare to get restaurants
        * @returns {json} list of details about restaurants
        */
        const $foursquareRests = $.ajax({
            url: 'https://api.foursquare.com/v2/venues/explore',
            data: {
                near: 'San Mateo, CA',
                section: 'food',
                client_id: '54LQWYWO5SVAYVORI3B4FUAFTEYA0' +
                    '5SORU0QUUUQ5TFL24HY',
                client_secret: 'ZNRD3YLNWEMARFJIFXGILOIQZ' +
                    'LDVFBNGHCXG1AHA5RH3EFBS',
                v: '20170801',
                radius: 3000,
            },
            timeout: 3000,
            error: function (error) {
                console.log('Error getting restaurants');
                console.log(error.responseJSON);
                window.alert(
                    'An error occurred getting the restaurants. ' +
                    'Please refresh the page and try again.'
                );
            },
        });
        return $foursquareRests;
    },

    initModel: function() {
        /**
        * @description Start building the restaurants objects array
        */
        model.restaurants = model.buildRestaurants()
    },

    getTypeSpread: function() {
        /**
        * @description Check the restaurants and return each type of food
        * @returns {array} the list of types of food
        */
        let typeList = [];
        Object.keys(model.restaurants).forEach( function(key) {
            typeList.push(model.restaurants[key].food);
        });
        return typeList.sort();
    }
}

var view = {
    filterRests: function(filter) {
        /**
        * @description filter restaurants with the given filter
        * @param {string} filter - The food type to filter
        * @returns {array} array of restaurants
        */
        // Get the array of filtered rests
        let filteredRests = model.filterRests(filter);

        // Delete the existing markers and make new ones
        viewMap.deleteAllMarkers();
        viewMap.setMarkers(filteredRests);

        // Return the array of restaurants
        return filteredRests;
    },

    getRestaurants: function() {
        /**
        * @description Move the restaurants from model to viewModel
        * @returns {array} array of restaurants
        */
        return model.restaurants;
    },

    getSpecificRest: function(key) {
        /**
        * @description Get data for a specific restaurant
        * @param {string} key - The name of the restaurant
        * @returns {Object} restaurants object
        */
        var rests = view.getRestaurants();
        return rests[key];
    },

    initApp: function() {
        /**
        * @description Kick off the app by calling GoogleMaps
        */
        viewMap.google();
    },

    initRests: function() {
        /**
        * @description Create the model
        */
        model.initModel();
    },

    initElements: function(restaurants) {
        /**
        * @description Create the viewModel elements
        * @param {array} restaurants - An array of restaurant objects
        * @returns {array} array of restaurants
        */
        viewMap.setMarkers(restaurants);
        ko.applyBindings(new viewList.initViewList());
    },

    setMarkers: function(restaurants) {
        /**
        * @description Call the viewMap function to create markers
        * @param {array} restaurants - an array of restaurant objects
        */
        viewMap.setMarkers(restaurants);
    },
}

var viewMap = {
    deleteAllMarkers: function() {
        /**
        * @description Remove all the markers from the map
        */
        Object.keys(viewMap.markers).forEach(function(key) {
            viewMap.markers[key].setMap(null);
        });

        viewMap.markers = [];
    },

    google: function() {
        /**
        * @description Create the map
        */
        // Create the call
        $.ajax({
            url: 'https://maps.googleapis.com/maps/api/js',
            data: {
                key: 'AIzaSyCTBfBVBLQOsZDioySrUjhU1UuIYLwaavQ',
                v:'3',
            },
            dataType: 'jsonp',
            timeout: 3000,
            // If the call fails, show an error asking to refresh the page
            error: (function (error) {
                console.log('Error getting map');
                console.log(error);
                window.alert(
                    'An error occurred while initializing the map. Please ' +
                    ' refresh the page and try again.'
                );
            }),
            // If the call succeeds, start the map view
            success: (function () {
                viewMap.initMap();
            }),
        });
    },

    initMap: function() {
        /**
        * @description Create the map elementss
        */
        // Create initial variables
        let map;
        const default_lat_long = {lat: 37.565315, lng: -122.322315};

        // Create the map from the google api
        viewMap.map = new google.maps.Map(document.getElementById('map'), {
            center: default_lat_long,
            zoom: 16,
            mapTypeControl: false,
            gestureHandling: 'greedy',
        });

        // Set the map visuals
        viewMap.map.setOptions(
            {
                styles: [
                    {
                        'featureType': 'poi',
                        'stylers': [{'visibility': 'off'}]
                    },
                    {
                        'featureType': 'poi',
                        'elementType': 'labels.text',
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

        // Have the view start making the restaurants
        view.initRests()
    },

    setMarkers: function(restaurants) {
        /**
        * @description Create the markers on the map
        * @param {array} restaurants - The array of restaurant objects
        */
        // Create the infowindow object.
        viewMap.infowindow = new google.maps.InfoWindow();

        // Set the markers array to empty
        viewMap.markers = [];

        // For each restaurant object create a marker
        Object.keys(restaurants).forEach(function(key) {
            var rest = restaurants[key];
            var marker = new google.maps.Marker({
                map: viewMap.map,
                position: {lat: rest.lat, lng: rest.lng},
                title: key,
                animation: google.maps.Animation.DROP,
                type: rest.food,
            });

            // When a marker is clicked on populate the infowindow
            marker.addListener('click', function() {
                viewMap.populateInfoWindow(key);
                viewList.showInfo(key);
            });

            // Add the marker to the markers array
            viewMap.markers[key] = marker;
        });
    },

    populateInfoWindow: function(key) {
        /**
        * @description Add information to the infowindow
        * @param {string} key - The name of the restaurant
        */
        // Declare initial variables
        const infowindow = viewMap.infowindow;
        const marker = viewMap.markers[key];

        // If an infowindow already exists, close it and delete the content
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

        // Make the marker bouncy
        marker.setAnimation(google.maps.Animation.BOUNCE);

        // Set the content of the infowindow for the restaurant
        infowindow.setContent(
            '<h3>' + marker.title + '</h3><span class="rating">Food Type: ' +
            marker.type +
            '</span><br><span>Information collected from FOURSQUARE.</span>'
        )

        infowindow.open(viewMap.map, marker);
    }
}

var viewList = {
    initViewList: function() {
        /**
        * @description Create all of the non-map elements
        */
        self = this;

        // Declare knockout objects.
        self.buttonsList = ko.observableArray(["All", ]);

        self.restList = ko.observableArray([]);

        self.menuStatus = ko.observable(true);
        self.infoStatus = ko.observable(false);

        self.restName = ko.observable("");
        self.restFood = ko.observable("");
        self.restAddress = ko.observable("");

        self.restaurants = ko.observableArray([]);

        self.typeFilter = ko.observable();

        // Get all the restaurants
        const allRestaurants = view.getRestaurants();

        Object.keys(allRestaurants).forEach(function (key) {
            // For each restaurant add it to restaurants
            self.restaurants.push(key);

            // Declare the rest's food type
            const restFood = allRestaurants[key].food;

            // If the food type is already a button, don't add it to buttons
            if (self.buttonsList().includes(restFood) != true) {
                self.buttonsList.push(allRestaurants[key].food);
            };
        });

        closeInfo = function() {
            /**
            * @description Call viewList close info
            */
            viewList.closeInfo();
        };

        filterRests = function() {
            /**
            * @description Filter restaurants
            */
            // Get filtered restaurants based on typeFilter
            const filteredRests = view.filterRests(self.typeFilter());
            let filteredRestsKeys = [];

            // For each filtered restaruant, add it's key
            Object.keys(filteredRests).forEach(function (key) {
                filteredRestsKeys.push(key);
            });

            // Set the ko array to the filtered keys
            self.restaurants(filteredRestsKeys);
        }

        showInfo = function(key) {
            /**
            * @description Call the viewList showInfo with the given key
            * @param {string} key - The name of the restaurant object
            */
            viewList.showInfo(key);
        };

        toggleMenu = function() {
            /**
            * @description Call viewList toggleMenu
            */
            viewList.toggleMenu();
        };
    },

    closeInfo: function() {
        /**
        * @description Remove data from ko observables and stop showing info
        */
        self.restName("");
        self.restFood("");
        self.infoStatus(false);
    },

    toggleMenu: function() {
        /**
        * @description Open or close the menu
        */
        // Reverse menu status
        self.menuStatus(! self.menuStatus());

        // If infoStatus is True then close the info
        if (self.infoStatus()) {
            closeInfo();
        };
    },

    showInfo: function (key) {
        /**
        * @description Show the info panel for the given key
        * @param {string} key - The name of the restaurant to show
        */
        // Reverse menu status
        toggleMenu();

        // Show the info panel
        self.infoStatus(true);

        // Get specific restaurant info
        const currentRest = view.getSpecificRest(key);

        // Set the rest info
        self.restName(key);
        self.restAddress(currentRest.address);
        self.restFood(currentRest.food);

        // Also show the info window
        viewMap.populateInfoWindow(key);
    },
}

view.initApp()