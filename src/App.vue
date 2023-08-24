<template>
  <div class="pane">
    <div id="mapContainer" class="basemap"></div>
    <div class="rightpane">
      <button @click="toggleMarkers()">{{ !!markers.length ? 'Hide markers' : 'Show markers' }}</button>
      <SearchBar :addMarkers="addMarkers" :addedDestinations="destinations" />
      <div>
        <strong>List of destinations</strong>
        <ul>
          <li v-for="dest in destinations" class="list">
            <p>{{ dest.name }}</p>
            <button @click="removeLocations(dest)">X</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";
import SearchBar from './components/SearchBar.vue'

export default {
  name: "BaseMap",
  components: { SearchBar },
  data() {
    return {
      map: null,
      nav: null,
      markers: [],
      destinations: [
        { name: 'Ho Chi Minh City', lon: 106.65, lat: 10.775 }
      ], // this serves as temporary replacement for stored data from cache storage ( if the user navigates away from the browser without saving, or stored destinations from the user's Firebase )
    };
  },
  mounted() {
    this.createMap();
  },
  methods: {
    createMap() {
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
      this.toggleMarkers()
    },
    addMarkers(location) {
      let { name, lon, lat } = JSON.parse(location)
      let newMarker = new mapboxgl.Marker()
      this.markers.push([name, newMarker.setLngLat([lon, lat]).addTo(this.map)])
    },
    removeMarkers(dest) {
      let [destName, marker] = this.markers.find(([name,]) => name === dest.name)
      marker.remove()
      this.markers = this.markers.filter(([name,]) => name !== destName)
    },
    toggleMarkers() {
      if (this.markers.length === 0) {
        this.destinations.forEach(
          (dest) => this.addMarkers(JSON.stringify(dest))
        )
      }
      else {
        this.markers.forEach(([, marker]) => marker.remove())
        this.markers = []
      }
    },
    removeLocations(dest) {
      this.destinations = this.destinations.filter((d) => d !== dest)
      this.removeMarkers(dest)
    },

  },
};
</script>

<style lang="scss" scoped>
.pane {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: row;

  .basemap {
    width: 50%;
    height: 100%;
  }

  .rightpane {
    width: 50%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

ul {
  list-style-type: none;
  padding-inline-start: 0;

  .list {
    background-color: white;
    color: black;
    width: 50%;
    display: flex;
    justify-content: space-between;
  }
}
</style>