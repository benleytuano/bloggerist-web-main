<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-gray-900">Sign up</h1>
        <p class="mt-2 text-sm text-gray-600">
          <RouterLink to="/signin" class="text-blue-500 hover:underline"
            >Have an account?</RouterLink
          >
        </p>
      </div>

      <!-- <ul class="mt-4 text-sm text-red-500">
        <li>That email is already taken</li>
      </ul> -->

      <div class="space-y-6">
        <input
          v-model="userData.username"
          class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Username"
        />
        <span v-if="errors.username" class="text-red-500 text-sm">{{
          errors.username
        }}</span>

        <input
          v-model="userData.email"
          class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="email"
          placeholder="Email"
        />
        <span v-if="errors.email" class="text-red-500 text-sm">{{
          errors.email
        }}</span>
        <input
          v-model="userData.password"
          class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          placeholder="Password"
        />
        <span v-if="errors.password" class="text-red-500 text-sm">{{
          errors.password
        }}</span>

        <button
          @click="registerUser"
          class="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Register
        </button>
      </div>
    </div>
  </div>

  <div
    v-if="toast"
    id="toast-success"
    class="absolute top-5 right-5 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800"
    role="alert"
  >
    <div
      class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200"
    >
      <svg
        class="w-5 h-5"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"
        />
      </svg>
      <span class="sr-only">Check icon</span>
    </div>
    <div class="ms-3 text-sm font-normal">Registered successfully.</div>
    <button
      type="button"
      class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
      data-dismiss-target="#toast-success"
      aria-label="Close"
    >
      <span class="sr-only">Close</span>
      <svg
        class="w-3 h-3"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 14 14"
      >
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import apiClient from "@/services/AxiosInstance";

const api = "/register";
const userData = ref({
  username: "",
  email: "",
  password: "",
});

const errors = ref({});

const toast = ref(false);

async function registerUser() {
  if (validateFields()) {
    // Submit form or perform registration logic
    try {
      const response = await apiClient.post(api, userData.value);
      console.log("Response", response);

      userData.value = {
        username: "",
        email: "",
        password: "",
      };
      toast.value = true;

      setTimeout(() => {
        toast.value = false;
      }, 3000);
    } catch (error) {
      console.log(error);
      if (error.response.status === 422 && error.response.data.errors) {
        if (error.response.data.errors.email) {
          errors.value.email = error.response.data.errors.email[0];
        }
        if (error.response.data.errors.username) {
          errors.value.username = error.response.data.errors.username[0];
        }
        if (error.response.data.errors.password) {
          errors.value.password = error.response.data.errors.password[0];
        }
      }
    }
  } else {
    console.log("Validation failed.", errors.value);
  }

  console.log(userData.value);
}

function validateFields() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  errors.value = {};

  if (!userData.value.username) {
    errors.value.username = "Username is required.";
  }

  if (!userData.value.email) {
    errors.value.email = "Email is required.";
  } else if (!emailRegex.test(userData.value.email)) {
    errors.value.email = "Invalid email address.";
  }

  if (!userData.value.password) {
    errors.value.password = "Password is required.";
  } else if (userData.value.password.length < 8) {
    errors.value.password = "Password must be at least 8 characters.";
  }

  // If there are no errors, return true
  return Object.keys(errors.value).length === 0;
}

//   const articleList = ref("list");

//   async function getPostList() {
//     try {
//       const response = await axios.get(
//         "http://bloggerist.test/api/articles/how-to-train-your-dragon-6KzHRzP3"
//       );
//       console.log(response);
//     } catch (error) {
//       console.error(error);
//     }
//   }

//   onMounted(async () => {
//     console.log("On mounted");
//     getPostList();
//   });
</script>
