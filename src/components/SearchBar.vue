<script>
export default {
  name: "SearchBar",
  props: {
    addLocations: Function,
    addedDestinations: Array
    // addedDestinations: Array
  },
  data: function () {
    return {
      search: '',
      locations: [
        { "name": "Ho Chi Minh City", "lat": 10.775, "lon": 106.65 },
        { "name": "Hanoi", "lat": 21.0285, "lon": 105.8542 },
        { "name": "Da Nang", "lat": 16.0544, "lon": 108.2022 },
        { "name": "Nha Trang", "lat": 12.2388, "lon": 109.1969 },
        { "name": "Can Tho", "lat": 10.0336, "lon": 105.7871 },
        { "name": "Hai Phong", "lat": 20.8449, "lon": 106.6881 },
        { "name": "Da Lat", "lat": 11.9404, "lon": 108.4580 },
        { "name": "Vung Tau", "lat": 10.3460, "lon": 107.0849 },
        { "name": "Hue", "lat": 16.4498, "lon": 107.5624 },
        { "name": "Bien Hoa", "lat": 10.9576, "lon": 106.8426 },
        { "name": "Ha Long", "lat": 20.9517, "lon": 107.0806 },
        { "name": "Phan Thiet", "lat": 10.9330, "lon": 108.1000 }
      ],
    };
  },
  computed: {
    filteredLocations() {
      let destNames = this.addedDestinations.map((dest) => dest.name)
      let res = this.locations
        .filter(location => (
          location.name.toLowerCase().includes(this.search.toLowerCase())
          && !destNames.includes(location.name)
        ))
      return this.search.length ? res : null
    }
  }
}
</script>

<template>
  <div class="search-wrapper">
    <input type="text" v-model="search" placeholder="Search title.." />
    <ul>
      <li v-for="location in filteredLocations" class="list_item" @click="addLocations(JSON.stringify(location))">
        {{ location.name }} - {{ location.lat }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.search-wrapper {
  position: relative;
  width: 100%;
}

input {
  width: inherit;
}

ul {
  position: absolute;
  overflow: visible;
  width: inherit;
  padding-inline-start: 0;

  .list_item {
    background-color: white;
    color: black;
    list-style-type: none;
    cursor: pointer;
    border-bottom: 1px solid gray;
    width: inherit;
  }
}
</style>
