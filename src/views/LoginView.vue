<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <div>
        <div class="col-md-6 offset-md-3 col-xs-12">
          <h1 class="text-2xl font-bold text-gray-900">Sign in</h1>
          <p class="mt-2 text-sm text-gray-600">
            <RouterLink to="/signup" class="text-blue-500 hover:underline"
              >Need an account?</RouterLink
            >
          </p>

          <!-- <ul class="mt-4 text-sm text-red-500">
          <li>That email is already taken</li>
        </ul> -->

          <form class="space-y-6" @submit.prevent="login">
            <fieldset class="flex flex-col">
              <input
                v-model="loginData.email"
                class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                placeholder="Email"
              />
            </fieldset>
            <fieldset class="flex flex-col">
              <input
                v-model="loginData.password"
                class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="password"
                placeholder="Password"
              />
            </fieldset>
            <button
              type="submit"
              class="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/services/AxiosInstance";
import Cookies from "js-cookie";

const router = useRouter();

const api = "/login";

const loginData = ref({
  email: "",
  password: "",
});

async function login() {
  try {
    const response = await apiClient.post(api, loginData.value);
    // console.log("Login response:", response);

    if (response.status === 200) {
      const token = response.data.user.token; // Assuming the token is in the response

      if (token) {
        // Store the token in cookies
        Cookies.set("token", token, { expires: 7 }); // Expires in 7 days, adjust as needed
        // console.log("Login successful, token saved in cookies");
        loginData.value = {}; // Clear the form
        router.push("/dashboard"); // Redirect to dashboard or any other route
      }
    }
  } catch (err) {
    console.error("Login error:", err.response?.data?.message || err.message);
    throw err;
  }
}
</script>
