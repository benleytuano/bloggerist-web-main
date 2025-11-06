<template>
  <div v-if="isLoading">Loading...</div>
  <div
    v-else
    class="flex items-center justify-center min-h-screen bg-gray-100 p-4"
  >
    <div class="w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-2xl font-semibold text-center mb-4">Your Settings</h1>
      <!-- 
      <ul v-if="errors.length" class="text-red-500 text-sm mb-4">
        <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
      </ul> -->

      <form @submit.prevent="updateSettings">
        <div class="mb-4">
          <input
            type="file"
            @change="handleFileUpload"
            accept="image/*"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="mb-4">
          <input
            v-model="userData.username"
            type="text"
            placeholder="Username"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="mb-4">
          <textarea
            v-model="userData.bio"
            rows="4"
            placeholder="Short bio about you"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
        <div class="mb-4">
          <input
            v-model="userData.email"
            type="email"
            placeholder="Email"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="mb-4">
          <input
            v-model="userData.password"
            type="password"
            placeholder="New Password"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Update Settings
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/services/AxiosInstance";

const userData = ref({});
const isLoading = ref(true);

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    userData.value.image = file;
  }
};

async function getUserData() {
  try {
    const response = await apiClient.get(`/user`);
    console.log(response);
    if (response.data) {
      userData.value = response.data;
    }
  } catch (error) {
    console.error(error);
  }
}

async function updateSettings() {
  console.log(userData.value);
  try {
    const formData = new FormData();

    // Laravel requires _method=PUT since FormData defaults to POST
    formData.append("_method", "PUT");

    // Append all user data fields
    for (const key in userData.value) {
      if (userData.value[key] !== null) {
        formData.append(key, userData.value[key]);
      }
    }

    // Send request with `multipart/form-data` headers
    const response = await apiClient.post(`/user`, formData);

    console.log(response);
    if (response.data) {
      userData.value = response.data;
    }
  } catch (error) {
    console.error(error);
  }
}

onMounted(async () => {
  await getUserData();
  isLoading.value = false;
});
</script>
