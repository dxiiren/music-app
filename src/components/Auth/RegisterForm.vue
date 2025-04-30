<template>
    <div>
        <div
            class="text-white text-center font-bold p-4 rounded mb-4"
            v-if="reg_show_alert"
            :class="reg_alert_variant"
        >
            <i class="fas fa-info-circle"></i> {{ reg_alert_message }}
        </div>
        <vee-form
            :validation-schema="registerRule"
            @submit="register"
            :initial-values="userData"
            ref="registerForm"
        >
            <!-- Name -->
            <div class="mb-3">
                <label class="inline-block mb-2">Name</label>
                <vee-field
                    name="name"
                    type="text"
                    placeholder="Enter Name"
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
            <!-- Email -->
            <div class="mb-3">
                <label class="inline-block mb-2">Email</label>
                <vee-field
                    name="email"
                    type="email"
                    placeholder="Enter Email"
                    :bails="false"
                    v-slot="{ field, errors }"
                >
                    <input
                        type="email"
                        v-bind="field"
                        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
                    />

                    <div class="text-red-600" v-for="error in errors" :key="error">
                        {{ error }}
                    </div>
                </vee-field>
            </div>
            <!-- Age -->
            <div class="mb-3">
                <label class="inline-block mb-2">Age</label>
                <vee-field
                    name="age"
                    type="number"
                    placeholder="Enter Age"
                    :bails="false"
                    v-slot="{ field, errors }"
                >
                    <input
                        type="number"
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
            <!-- Confirm Password -->
            <div class="mb-3">
                <label class="inline-block mb-2">Confirm Password</label>
                <vee-field
                    name="confirm_password"
                    type="password"
                    placeholder="Confirm Password"
                    :bails="false"
                    v-slot="{ field, errors }"
                >
                    <input
                        type="password"
                        v-bind="field"
                        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
                        placeholder="Confirm Password"
                    />
                    <div class="text-red-600" v-for="error in errors" :key="error">
                        {{ error }}
                    </div>
                </vee-field>
            </div>
            <!-- Country -->
            <div class="mb-3">
                <label class="inline-block mb-2">Country</label>
                <vee-field
                    name="country"
                    as="select"
                    class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
                >
                    <option value="USA">USA</option>
                    <option value="Mexico">Mexico</option>
                    <option value="Germany">Germany</option>
                    <option value="Antartica">Antartica</option>
                </vee-field>
                <error-message class="text-red-500 text-sm" name="country" />
            </div>
            <!-- TOS -->
            <div class="mb-3 pl-6">
                <vee-field
                    name="tos"
                    type="checkbox"
                    class="w-4 h-4 float-left -ml-6 mt-1 rounded"
                    value="1"
                />
                <i18n-t class="inline-bloc" keypath="register.accept" tag="label">
                    <a href="#" class="text-blue-500"> {{ $t("register.tos") }} </a>
                </i18n-t>
                <error-message class="text-red-500 text-sm" name="tos" />
            </div>
            <button
                type="submit"
                :disabled="reg_in_submission"
                class="block w-full bg-purple-600 text-white py-1.5 px-3 rounded transition hover:bg-purple-700"
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
    name: 'AuthRegisterForm',
    methods: {
        ...mapActions(useUserStore, {
            createUser: 'register',
        }),
        async register(values) {
            this.reg_in_submission = true
            this.reg_show_alert = true
            this.reg_alert_variant = 'bg-blue-500'
            this.reg_alert_message = 'Please wait while we register your account.'

            try {
                console.log('Registering user:', values)
                await this.createUser(values)
            } catch (error) {
                this.reg_in_submission = false
                this.reg_alert_variant = 'bg-red-500'
                this.reg_alert_message = 'An unexpected error occurred. Please try again later.'
                console.error('Error registering user:', error)
                return
            }

            this.reg_show_alert = true
            this.reg_alert_variant = 'bg-green-500'
            this.reg_alert_message = 'Registration successful! You can now log in.'
            this.$refs.registerForm.resetForm()

            window.location.reload();
        },
    },
    data() {
        return {
            userData: {
                name: '',
                email: '',
                age: '',
                password: '',
                confirm_password: '',
                country: 'USA',
                tos: false,
            },
            registerRule: {
                name: {
                    required: true,
                    min: 3,
                    max: 100,
                    alpha_spaces: true,
                },
                email: {
                    required: true,
                    email: true,
                },
                age: {
                    required: true,
                    min_value: 18,
                    max_value: 99,
                },
                password: {
                    required: true,
                    min: 9,
                    max: 20,
                    excluded: ['password', '12345678', '123456789'],
                },
                confirm_password: {
                    required: true,
                    password_mismatch: '@password',
                },
                country: {
                    required: true,
                    country_excluded: ['Antartica'],
                },
                tos: {
                    tos: true,
                },
            },
            reg_in_submission: false,
            reg_show_alert: false,
            reg_alert_variant: 'bg-blue-500',
            reg_alert_message: 'Please wait while we register your account.',
        }
    },
}
</script>
