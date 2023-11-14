<script>
import SignupForm from './registration/SignupForm.vue';

export default {
    name: "Header",
    components: { SignupForm },
    // props: {
    //     addLocations: Function,
    //     addedDestinations: Array
    // },
    data: function () {
        return {
            optionsOpened: false,
            isLoggedIn: false,
        };
    },
}
</script>

<template>
    <div class="navbar">
        <a href="/">
            Road Trip Plannar
        </a>
        <div class="navbar-items" :style="{ color: 'blue' }">
            <SignupForm />
        </div>
    </div>
</template>

<style scoped>
.navbar {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
}

.navbar .navbar-items {
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
}

@media screen and (max-width: 640px) {
    .navbar .navbar-items {
        width: 80%;
    }
}

.navbar .navbar-items .options {
    position: absolute;
    z-index: 10;
    background-color: #fff;
}

.navbar .navbar-items .options li {
    padding: 0.5rem;
}

.p-2 {
    padding: 2rem;
}
</style>
    
