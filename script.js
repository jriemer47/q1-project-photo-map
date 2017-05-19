// Start by generating a Google map over San Francisco

// Mark the map with pins representing the geolocation of all the pictures I've taken recently

// When the user enters info in the search box, it moves the map to that area and re-renders the marks with my photos


/* ===================================================================
          I N I T I A L     M A P     G E N E R A T I O N
===================================================================*/

// const MAP_KEY = 'AIzaSyDtet_-9zOt0miA0G0mlaeldeICJvlrBVI';

var map;

function initMap() {
  let initial = {
    lat: Number((Math.random()*90).toFixed(3)),
    lng: Number((Math.random()*-130).toFixed(3))
  };
  console.log(initial);
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: initial
  });

  let contentString = `<div id="content"><h4>Welcome</h4><div id="bodyContent"><p>Where are we?</p><p>Nevermind.</p><p>There's nothing interesting here.</p><p>Let's go somewhere else.</p></div></div>`;

  let infowindow = new google.maps.InfoWindow({
    content: contentString
  });

  let marker = new google.maps.Marker({
    position: initial,
    map: map,
    title: 'Starting Location'
  });

  marker.addListener('click', function() {
    infowindow.open(map, marker);
  });

}

/* ===================================================================
            N E W      M A P      G E N E R A T I O N
===================================================================*/

const GEO_URL = 'https://maps.googleapis.com/maps/api/geocode/json?address='
const GEO_KEY = 'AIzaSyA05MTxlz_LxdlkkhBtcp56kBDFt3pwbgE';

class Map {
  search(searchTerm) {
    var lookup = `${GEO_URL}${searchTerm}&key=${GEO_KEY}`;
    var request = fetch(encodeURI(lookup));

    request
      .then(mapsResponse => mapsResponse.json())
      .then(locationObject => locationObject.results[0].geometry.location)
      .then(locationCoordinates => {
        let lat = locationCoordinates.lat;
        let lng = locationCoordinates.lng;
        this.initMap(lat, lng);
      })
  }

  initMap(latitude, longitude) {
     var newPosition = new google.maps.LatLng(latitude, longitude);
     var mapSpecs = {
         zoom : 12,
         center : newPosition,
     }
     map = new google.maps.Map(document.getElementById("map"), mapSpecs);
     console.log('MAP BOUNDS:', map.getBounds());

 }

};





// // REDIRECT_URI and CLIENT_ID are both references to my app, not the user
// const REDIRECT_URI = 'http://localhost:3333'
// const CLIENT_ID = '4f9ed3b9afd94c3fbf0536a3a54f7a68'

// // I would need to put a 'log in' at the beginning, using the AUTH-URL
// const AUTH_URL = `https://api.instagram.com/oauth/authorize/?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token

// const MyRecentMedia = `https://api.instagram.com/v1/users/self/media/recent/?access_token=${MY_AUTH_TOKEN}`;

// const aboutMe = `https://api.instagram.com/v1/users/self/?access_token=${MY_AUTH_TOKEN}`


/* ===================================================================
                          I N S T A G R A M
===================================================================*/

class InstaData {
  constructor() {
    this.TOKEN = '256450119.4f9ed3b.85b25e00bb864c6aa837a5896060080f';
  }

  getMyInfo() {
    const aboutMe = `https://api.instagram.com/v1/users/self/?access_token=${this.TOKEN}`

    var request = fetch(aboutMe);

    request
      .then(response => response.json())
      .then(data => data.data)
      .then(bio => {
        $('#instabio').html(
          `<div class="row valign-wrapper">
            <div class="col s8 offset-s2 valign">
              <div class="card horizontal">
                  <div class="card-image">
                    <img src="${bio.profile_picture}">
                  </div>
                  <div class="card-stacked">
                    <div class="card-content">
                      <h4>${bio.full_name}</h4>
                      <p>${bio.bio}</p>
                    </div>
                    <div class="card-action">
                      <a target="_blank" href="https://www.linkedin.com/in/tylerlangenbrunner/"><i class="material-icons">domain</i></a>
                      <a target="_blank" href="https://github.com/tylerlan"><i class="material-icons">code</i></a>
                      <a target="_blank" href="https://twitter.com/tylerdevs"><i class="material-icons">trending_up</i></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>`
      );

      })
  }

  getRecentPics() {
    const recentPics = `https://api.instagram.com/v1/users/self/media/recent/?access_token=${this.TOKEN}`;

    var request = fetch(recentPics);

    request
    .then(response => response.json())
    .then(data => {
      var parsedPhotoObjectsArray = []; // Resets the array every time you call the method

      data.data.forEach( (photoObject) => {
        // console.log(photoObject);
        var parsedPhotoObject = {
          thumbnail : photoObject.images.thumbnail.url,
          imgId : photoObject.id,
          caption : photoObject.caption.text,
          link : photoObject.link,
          tagsArray : photoObject.tags
        }

        if (photoObject.location) { // If the image is geocoded...
          let lat = photoObject.location.latitude;
          let lng = photoObject.location.longitude;
          parsedPhotoObject.lat = lat;
          parsedPhotoObject.lng = lng;
          parsedPhotoObject.coords = { lat: lat, lng: lng};
          parsedPhotoObject.locationName = photoObject.location.name;

        }
        parsedPhotoObjectsArray.push(parsedPhotoObject);

      } )
      return parsedPhotoObjectsArray;

    })
    .then( objsArray => {
      objsArray.forEach( (obj) => {

        if (map.getBounds().contains(obj.coords)) {
          createMarker(obj.coords, obj.locationName, obj.caption, obj.link);
          $('#instafeed').append(`
              <a target="_blank" href="${obj.link}"><img class="fade" src="${obj.thumbnail}"></a>
              `)
            }
      } )
    })
    .catch(console.log)
  }
}

function createMarker(position, title, description, link) {
  console.log('MAKING A NEW MARKER');
    let marker = new google.maps.Marker({
                  position: position,
                  map: map, // map is a global variable
                  title: title,
                  icon: "assets/img/ic_camera_1x.png",
                  animation: google.maps.Animation.DROP
                  });

    let contentString = `<h6>${title}</h6><p>${description}</p><a target="_blank" href="${link}">original</a>`;

    let infowindow = new google.maps.InfoWindow({
                      content: contentString,
                      maxWidth: 200
                      });

    marker.addListener('click', function() {
      infowindow.open(map, marker);
    });

}

/* **************************************************************
     L I S T E N I N G     F O R     U S E R     I N P U T
*************************************************************** */

$('#submit').click((event) => {
  event.preventDefault();
  let value = $('#location')[0].value;
  console.log('VALUE', value);
  doSomethingWithUserInput(value);
})

function doSomethingWithUserInput(searchTerm) {
  let generateMap = new Map;
  generateMap.search(searchTerm);

  let generateInstaContent = new InstaData;
  generateInstaContent.getRecentPics();
  generateInstaContent.getMyInfo();

}






//
