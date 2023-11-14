<template>
    <div>
        <div v-if="isLoggedIn" @click="showUserDropdown = !showUserDropdown">
            @{{ user.email.split("@")[0] }}
            <ul v-if="showUserDropdown" className="dropDownMenu">
                <li style="padding: 0.5rem; cursor: pointer;" key="Edit profile">
                    Edit profile
                </li>
                <li style="padding: 0.5rem; cursor: pointer;" key="Sign out" @click="loggingOutUser">
                    Sign out
                </li> 
            </ul>
        </div>
        <div v-else><button @click="showModal = true">Register</button></div>
        <Modal v-if="showModal">
            <RegistrationForm @close="closeModal" />
        </Modal>
    </div>
</template>


<script>
import Modal from './Modal.vue';
import RegistrationForm from './RegistrationForm.vue';
import { mapState } from 'vuex';
import { signOut, getAuth } from 'firebase/auth'

export default {
    components: {
        Modal,
        RegistrationForm
    },
    data() {
        return {
            showModal: false,
            showUserDropdown: false,
        };
    },
    methods: {
        closeModal(username) {
            this.showModal = false;
        },
        loggingOutUser() {
            signOut(getAuth()).then(() => {
                console.log('User signed out');
            });
        }
    },
    computed: {
        ...mapState(['user', 'isLoggedIn']) // Map the user state and isLoggedIn to local computed properties
    }

};
</script>
 
<style scoped>
.dropDownMenu {
    list-style-type: none;
    border: 0.5px solid black;
    position: absolute;
    z-index: 10;
    background-color: white;
    padding-inline-start: 0;
}
</style>