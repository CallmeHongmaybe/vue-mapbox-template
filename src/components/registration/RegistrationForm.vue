<template>
    <div class="form">
        <h2>{{ isSignIn ? 'Login' : 'Register' }}</h2>
        <button class="close" @click="$emit('close');">&times;</button>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" v-model="username" name="username" @focus="errors = null" class="form-control"
                    :class="{ 'is-invalid': submitted && !username }" />
                <div v-show="submitted && !username" class="invalid-feedback">Username is required</div>
            </div>
            <div class="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" v-model="password" name="password" class="form-control"
                    :class="{ 'is-invalid': submitted && !password }" @focus="errors = null" />
                <div v-show="submitted && !password" class="invalid-feedback">Password is required</div>
            </div>
            <div v-if="errors" style="color: red;">{{ errors }}</div>
            <button type="submit" class="btn btn-primary">{{ isSignIn ? 'Login' : 'Register' }}</button>
        </form>
        <div style="text-align: center;">
            {{ isSignIn ? 'Don\'t have an account yet ?' : 'Already signed in ?' }}
            <a @click="
                isSignIn = !isSignIn
                ">{{ isSignIn ? 'Register' : 'Login' }}
            </a>
        </div>
    </div>
</template>

<script>
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

export default {
    name: "RegistrationForm",
    data() {
        return {
            isSignIn: false,
            username: "",
            password: "",
            errors: "",
            submitted: false
        };
    },
    methods: {
        validateUsername() {
            this.errors = this.username.length >= 5 ? "" : "Username must be at least 5 characters.";
        },
        validatePassword() {
            this.errors = this.password.length >= 8 ? "" : "Password must be at least 8 characters.";
        },
        async register() {
            const { username, password } = this;
            try {
                let auth = getAuth()
                if (this.isSignIn) {
                    await signInWithEmailAndPassword(auth, username, password)
                    console.log("Successfully logged in.")
                }
                else {
                    await createUserWithEmailAndPassword(auth, username, password)
                    console.log("Successfully registered.")
                }
                this.$emit('close')
            } catch (err) {
                this.errors = err
                if (err.code && this.isSignIn) {
                    switch (err.code) {
                        case 'auth/invalid-email':
                            this.errors = "Invalid email";
                            break;
                        case 'auth/user-not-found':
                            this.errors = "No account with that email was found."
                            break;
                        case 'auth/wrong-password':
                            this.errors = "Incorrect password"
                            break;
                        default:
                            this.errors = "Email or password was incorrect."
                            break;
                    }
                }
            }
        },
        handleSubmit() {
            if (!this.isSignIn) {
                this.validateUsername();
                this.validatePassword();
                if (!Object.values(this.errors).some(error => error)) {
                    this.register();
                }
            }
            else this.register();
        },
    }
};
</script>

<style scoped>
.form {
    width: 50%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
}

form {
    display: grid;
    grid-template-rows: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}

.form-group {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-group button {
    grid-column: span 3 / span 3;
}

.close {
    top: 0;
    right: 0;
    margin-right: 1rem;
    margin-top: 1rem;
    position: absolute;
}
</style>
