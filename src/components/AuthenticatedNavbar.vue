<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else class="container mx-auto flex justify-between items-center py-4">
    <RouterLink to="/dashboard">
      <h1 class="text-2xl font-bold text-gray-800">Devlog</h1>
    </RouterLink>
    <ul class="flex space-x-6 items-center">
      <!-- Home Icon -->
      <li>
        <RouterLink
          to="/dashboard"
          class="text-gray-600 hover:text-blue-600 font-medium flex items-center"
          :class="{
            'text-blue-600 font-semibold': $route.path === '/dashboard',
          }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="size-6"
          >
            <path
              d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z"
            />
            <path
              d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z"
            />
          </svg>
        </RouterLink>
      </li>

      <!-- New Article Icon -->
      <li>
        <RouterLink
          to="/create-article"
          class="text-gray-600 hover:text-blue-600 font-medium flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="size-6"
          >
            <path
              d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z"
            />
            <path
              d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z"
            />
          </svg>
        </RouterLink>
      </li>

      <!-- Profile -->
      <li class="relative">
        <button
          @click="toggleDropdown"
          class="flex items-center text-gray-600 hover:text-blue-600 font-medium"
        >
          <img
            v-if="user.image"
            :src="user.profile_image_url"
            alt="User"
            class="w-8 h-8 rounded-full mr-2"
          />
          <div
            v-else
            class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-white"
          >
            {{ capitalizeFirstLetter(user.username[0]) }}
          </div>
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="showDropdown"
          class="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg border py-2"
        >
          <RouterLink
            :to="`/profile/${user.username}`"
            class="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600"
          >
            Profile
          </RouterLink>
          <button
            @click="logout"
            class="w-full text-left block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600"
          >
            Logout
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/services/AxiosInstance";
import { isAuthenticated } from "@/services/auth.js";

const isLoading = ref(true);
const router = useRouter();

const user = ref({});

const showDropdown = ref(false);

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

async function getCurrentUser() {
  try {
    const response = await apiClient.get(`/user`);

    console.log(response);

    if (response.status === 200 && response.data) {
      user.value = response.data;
    }
  } catch (error) {
    console.error(error);
  }
}

async function logout() {
  try {
    const response = await apiClient.post(`/logout`);

    console.log(response);

    if (response.status === 200) {
      router.push("/");
    }
  } catch (error) {
    console.error(error);
  }
}
//Helper function

//Text

function capitalizeFirstLetter(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

onMounted(async () => {
  await getCurrentUser();
  isLoading.value = false;
});
</script>
