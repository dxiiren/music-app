<template>
    <div>
        <div
            class="text-white text-center font-bold p-4 rounded mb-4"
            v-if="login_show_alert"
            :class="login_alert_variant"
        >
            <i class="fas fa-info-circle"></i> {{ login_alert_message }}
        </div>
        <vee-form :validation-schema="loginRule" @submit="login" ref="loginForm">
            <!-- Email -->
            <div class="mb-3">
                <label class="inline-block mb-2">Email</label>

                <vee-field
                    name="email"
                    type="text"
                    placeholder="Enter Email"
                    :bails="false"
                    v-slot="{ field, errors }"
                >
                    <input
                        type="text"
                        v-bind="field"
                        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
                    />
                    <div class="text-red-600" v-for="error in errors" :key="error">
                        {{ error }}
                    </div>
                </vee-field>
            </div>
            <!-- Password -->
            <div class="mb-3">
                <label class="inline-block mb-2">Password</label>

                <vee-field
                    name="password"
                    type="password"
                    placeholder="Password"
                    :bails="false"
                    v-slot="{ field, errors }"
                >
                    <input
                        type="password"
                        v-bind="field"
                        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
                    />

                    <div class="text-red-600" v-for="error in errors" :key="error">
                        {{ error }}
                    </div>
                </vee-field>
            </div>
            <button
                type="submit"
                class="block w-full bg-purple-600 text-white py-1.5 px-3 rounded transition hover:bg-purple-700"
                :disabled="login_in_submission"
            >
                Submit
            </button>
        </vee-form>
    </div>
</template>

<script>
import { mapActions } from 'pinia'
import useUserStore from '@/stores/user'

export default {
    name: 'AuthLoginForm',
    data() {
        return {
            login_in_submission: false,
            login_show_alert: false,
            login_alert_variant: 'bg-blue-500',
            login_alert_message: 'Please wait while we login your account.',
            loginRule: {
                email: {
                    required: true,
                    email: true,
                },
                password: {
                    required: true,
                    min: 9,
                    max: 20,
                },
            },
        }
    },
    methods: {
        ...mapActions(useUserStore, {
            loginUser: 'login',
        }),
        async login(values) {
            this.login_in_submission = true
            this.login_show_alert = true
            this.login_alert_variant = 'bg-blue-500'
            this.login_alert_message = 'Please wait while we login your account.'

            try {
                console.log('Login user:', values)
                await this.loginUser(values)
            } catch (error) {
                this.login_in_submission = false
                this.login_alert_variant = 'bg-red-500'
                this.login_alert_message = 'Incorrect email or password. Please try again.'
                console.error('Error login user:', error)
                return
            }

            this.login_in_submission = false
            this.login_show_alert = true
            this.login_alert_variant = 'bg-green-500'
            this.login_alert_message = 'Login successful!'

            //clear all input
            this.$refs.loginForm.resetForm()
            window.location.reload();
        },
    },
}
</script>
