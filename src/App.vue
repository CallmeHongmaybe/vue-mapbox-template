<template>
  <div class="pane">
    <div class="basemap">
      <div id='mapContainer' />
      <button @click="toggleMarkers(); showMarker = !showMarker" class="toggleMarkerButton">
        {{ showMarker ? 'Hide markers' : 'Show markers' }}
      </button>
    </div>
    <div class="rightpane">
      <Header class="header" />
      <div class="content">
        <SearchBar :addLocations="addLocations" :addedDestinations="destinations" />
        <div>
          <strong>List of destinations</strong>
          <ul v-if="destinations.length > 0">
            <Draggable v-model="destinations" :itemKey="getKey" @change="handleDrag">
              <template #item="{ element, index }">
                <li :key="getKey(element)" class="list_item">
                  <p>{{ index + 1 }}</p>
                  <p>{{ element.name }}</p>
                  <button @click="removeLocations(element)">X</button>
                </li>
              </template>
            </Draggable>
          </ul>
          <button v-if="isLoggedIn && enableSave" @click="sendDataToFirebase">Save as new route</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";
import SearchBar from './components/SearchBar.vue'
import Draggable from 'vuedraggable'
import { v4 as uuid } from 'uuid';
import { toRaw } from 'vue';
import Header from "./components/Header.vue";
import { mapState } from "vuex";
import { doc, collection, addDoc } from 'firebase/firestore';

function renderMarkerLayer(error, image) {
  if (error) throw error;
  this.map.addImage('custom-marker', image);
  // Add a GeoJSON source with 2 points
  this.map.addSource('points', {
    'type': 'geojson',
    'data': {
      'type': 'FeatureCollection',
      'features': this.computeMarker
    }
  })
  this.toggleMarkers()
}

let reorderMarkers = (source) => Array.prototype.map.call(source, (feat, indx) => ({
  ...feat,
  'properties': {
    'location': feat.properties.location,
    'order': indx + 1
  }
}))

// TODO: Refactor when you are already using storage or cache to load the markers 
export default {
  name: "BaseMap",
  components: { SearchBar, Draggable, Header },
  data() {
    return {
      map: null,
      nav: null,
      destinations: JSON.parse(localStorage.getItem("destinations")) || [
        { id: uuid(), name: 'Ho Chi Minh City', lon: 106.65, lat: 10.775 }
      ], // this serves as temporary replacement for stored data from cache storage ( if the user navigates away from the browser without saving, or stored destinations from the user's Firebase )
      numberDests: 1,
      showMarker: true,
      enableSave: true
    };
  },
  mounted() {
    this.createMap();
  },
  methods: {
    createMap() {
      // TODO: Disable map from scrolling when map and marker are still loading
      mapboxgl.accessToken = 'pk.eyJ1Ijoic2ltbWVyMyIsImEiOiJjbGxrbXpuOXUxNG8xM2NsaXBxZHd1eHB5In0.S307WMqf78nf7JNexl1ESw';

      this.map = new mapboxgl.Map({
        container: "mapContainer",
        style: "mapbox://styles/mapbox/streets-v11",
        center: [106.65, 10.775],
        zoom: 12,
      });

      // setting up nav tools
      this.nav = new mapboxgl.NavigationControl();
      this.map.addControl(this.nav, "top-left");

      // setting up markers
      this.map.on('load', async () => {
        console.log('Map loaded')

        await this.map.loadImage('https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png', renderMarkerLayer.bind(this));
      });
    },
    editSource(callBackFn) {
      let currentSource = toRaw(this.map.getSource('points'))
      let currentSourceFeatures = currentSource['_data']['features']
      return callBackFn(currentSourceFeatures)
    },
    repaintMap(callBackFn) {
      let newSource = this.editSource(callBackFn)
      // localStorage.setItem("destinations", JSON.stringify(toRaw(this.destinations)))
      this.map.getSource('points').setData({
        'type': 'FeatureCollection',
        'features': newSource
      })
      this.map.triggerRepaint();
    },
    addMarkers(location) {
      let { name, lon, lat } = JSON.parse(location)
      let callBackFn = (source) => Array.prototype.concat.call(source, {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [lon, lat],
        },
        'properties': { 'location': name, 'order': this.numberDests }
      })
      this.repaintMap(callBackFn)
    },
    removeLocations(location) {
      console.log('location', location)
      let callBackFn = (source) => {
        let filteredLocs = Array.prototype.filter.call(source, (feat) => feat.properties.location !== location.name)
        return reorderMarkers(filteredLocs)
      }
      this.destinations = this.destinations.filter(dest => dest !== location)
      this.numberDests--
      this.repaintMap(callBackFn)
    },
    addLocations(location) {
      this.destinations = this.destinations.concat({ id: uuid(), ...JSON.parse(location) })
      this.numberDests++
      this.addMarkers(location)
    },
    toggleMarkers() {
      if (!this.map.getLayer("points")) {
        this.map.addLayer({
          'id': 'points',
          'type': 'symbol',
          'source': 'points',
          'layout': {
            'text-field': ['get', 'order'],
            'text-anchor': 'top',
            // 'text-radial-offset': 0.5,
            'icon-image': 'custom-marker',
            'text-offset': [0, -3],
          }
        });
      }
      else this.map.removeLayer("points")
    },
    handleDrag(evt) {
      this.map.getSource('points').setData({
        'type': 'FeatureCollection',
        'features': this.computeMarker
      })
      this.map.triggerRepaint();
    },
    sendDataToFirebase() {
      let { user, db, destinations } = this

      if (user && db) {
        let userRef = doc(db, "users", user.uid);
        addDoc(collection(userRef, "routes"), {
          routeName: 'New Route',
          destinations: toRaw(destinations)
        })

        this.enableSave = false
        // https://vuejs.org/guide/essentials/watchers.html#basic-example
        // db.collection('routes').doc(user.uid).set({
        //   routeName: 'New Route',
        //   destinations: toRaw(destinations)
        // })
        //   .then(() => {
        //     console.log('Data successfully written to Firebase!');
        //   })
        //   .catch((error) => {
        //     console.error('Error writing data to Firebase', error);
        //   });
      }
    },
    getKey(item) {
      return item.id; // Assuming `id` is a unique identifier for each destination
    },
  },
  computed: {
    computeMarker() {
      let destinationsRaw = toRaw(this.destinations)
      localStorage.setItem("destinations", JSON.stringify(destinationsRaw))
      return destinationsRaw.map(({ name, lon, lat }, indx) => {
        return {
          // feature for Mapbox DC
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': [lon, lat]
          },
          'properties': {
            'location': name,
            'order': indx + 1
          },
        }
      })
    },
    ...mapState(['db', 'user', 'isLoggedIn']) // Map the user state and isLoggedIn to local computed properties
  }
}
</script>

<style lang="scss" scoped>
.pane {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: row;

  .basemap {
    width: 50%;
    height: inherit;
    position: relative;

    #mapContainer {
      height: inherit;
    }

    .toggleMarkerButton {
      z-index: 5;
      width: 8rem;
      position: absolute;
      top: 1rem;
      right: 1rem;
    }
  }

  .rightpane {
    width: 50%;

    .header {
      height: 15%;
      background-color: lightgreen;
      padding-left: 2rem;
      padding-right: 2rem;
    }

    .content {
      height: 85%;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      padding-left: 2rem;
      padding-right: 2rem;
    }
  }
}

// .marker {
//   background-color: aqua;
//   width: 50px;
//   height: 50px;

//   &::before {
//     content: attr(data-number);
//     position: absolute;
//     top: 0;
//     left: 0;
//     color: #000;
//   }
// }

ul {
  list-style-type: none;
  padding-inline-start: 0;

  .list_item {
    background-color: white;
    color: black;
    width: 50%;
    cursor: grab;
    cursor: -moz-grab;
    cursor: -webkit-grab;
    cursor: move;
    /* fallback if grab cursor is unsupported */
    display: flex;
    justify-content: space-between;

    button {
      scale: 0.8;
    }

    &:active {
      cursor: grabbing;
      cursor: -moz-grabbing;
      cursor: -webkit-grabbing;
    }
  }
}
</style>
