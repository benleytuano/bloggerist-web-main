<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
    <div class="text-gray-500 text-lg">Loading...</div>
  </div>

  <!-- Main Content: Full viewport, no card, clean minimalist -->
  <div v-else class="flex items-center justify-center min-h-screen px-4 py-8">
    <!-- Settings Form Container: No card styling, just content -->
    <div class="w-full max-w-xl">
      <!-- Page Title -->
      <div class="mb-12 text-center">
        <h1 class="text-4xl font-serif font-bold text-gray-900 mb-3">
          Settings
        </h1>
        <p class="text-gray-600">Manage your profile and account preferences</p>
      </div>

      <!-- Settings Form -->
      <form @submit.prevent="updateSettings" class="space-y-8">
        <!-- Profile Image Upload -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Profile Image
          </label>
          <div class="flex items-center space-x-6">
            <!-- Preview Circle -->
            <div
              class="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-gray-200"
            >
              <img
                v-if="userData.profile_image_url"
                :src="userData.profile_image_url"
                alt="Profile"
                class="w-full h-full object-cover"
              />
              <svg
                v-else
                class="w-12 h-12 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <!-- File Input -->
            <input
              type="file"
              @change="handleFileUpload"
              accept="image/*"
              class="flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:cursor-pointer transition-all duration-200"
            />
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-200"></div>

        <!-- Username Input -->
        <div>
          <label
            for="username"
            class="block text-sm font-medium text-gray-700 mb-3"
          >
            Username
          </label>
          <input
            id="username"
            v-model="userData.username"
            type="text"
            placeholder="johndoe"
            class="w-full px-0 py-3 border-0 border-b-2 border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors duration-200 text-gray-900 placeholder-gray-400 bg-transparent"
          />
        </div>

        <!-- Bio Textarea -->
        <div>
          <label for="bio" class="block text-sm font-medium text-gray-700 mb-3">
            Bio
          </label>
          <textarea
            id="bio"
            v-model="userData.bio"
            rows="4"
            placeholder="Tell us a little about yourself..."
            class="w-full px-0 py-3 border-0 border-b-2 border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors duration-200 text-gray-900 placeholder-gray-400 resize-none bg-transparent"
          ></textarea>
          <p class="mt-2 text-xs text-gray-500">
            Brief description for your profile
          </p>
        </div>

        <!-- Email Input -->
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 mb-3"
          >
            Email
          </label>
          <input
            id="email"
            v-model="userData.email"
            type="email"
            placeholder="john@example.com"
            class="w-full px-0 py-3 border-0 border-b-2 border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors duration-200 text-gray-900 placeholder-gray-400 bg-transparent"
          />
        </div>

        <!-- Password Input -->
        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 mb-3"
          >
            New Password
          </label>
          <input
            id="password"
            v-model="userData.password"
            type="password"
            placeholder="Leave blank to keep current password"
            class="w-full px-0 py-3 border-0 border-b-2 border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors duration-200 text-gray-900 placeholder-gray-400 bg-transparent"
          />
          <p class="mt-2 text-xs text-gray-500">
            Only fill this if you want to change your password
          </p>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-200 pt-6"></div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="w-full bg-gray-900 text-white py-4 px-6 rounded-md font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all duration-200"
        >
          Update Settings
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/services/AxiosInstance";

const router = useRouter();
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
