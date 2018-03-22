var data = {
    getRestaurants: function() {
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/explore',
            data: {
                near: "San Mateo, CA",
                section: "food",
                novelty: "new", 
                client_id: "54LQWYWO5SVAYVORI3B4FUAFTEYA05SORU0QUUUQ5TFL24HY",
                client_secret: "ZNRD3YLNWEMARFJIFXGILOIQZLDVFBNGHCXG1AHA5RH3EFBS",
                v:"20170801"
            },
            success: function (response) {
                console.log("success")
                console.log(response);
                response.response.groups[0].items.forEach(function(venue) {
                    console.log(venue.venue)
                });
            }
        }).fail( function (e) {
            console.log("fail");
            console.log(e);
        });
    },    
}

var viewMap = {

// <script async defer src="https://maps.googleapis.com/maps/api/js?key=&callback=initMap">
//     </script>

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

        data.getRestaurants()
    },

}

viewMap.google()