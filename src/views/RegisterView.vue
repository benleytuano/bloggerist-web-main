<template>
  <div class="h-full bg-gray-50">
    <div class="mx-auto max-w-md h-full px-4 md:px-6">
      <div class="flex h-full items-center">
        <div class="w-full rounded-lg border bg-white shadow-sm">
          <!-- Header -->
          <div class="px-6 pt-6 text-center">
            <h1 class="text-xl font-semibold text-gray-900">Sign up</h1>
            <p class="mt-1 text-sm text-gray-600">
              Have an account?
              <RouterLink
                to="/signin"
                class="font-medium text-blue-600 hover:underline"
              >
                Sign in
              </RouterLink>
            </p>
          </div>

          <!-- Body -->
          <div class="px-6 pb-6 pt-4">
            <!-- Global error (API) -->
            <div
              v-if="globalError"
              class="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {{ globalError }}
            </div>

            <form class="space-y-4" @submit.prevent="registerUser">
              <!-- Username -->
              <div class="space-y-1">
                <label
                  for="username"
                  class="block text-sm font-medium text-gray-900"
                >
                  Username
                </label>
                <input
                  id="username"
                  v-model.trim="userData.username"
                  type="text"
                  autocomplete="username"
                  required
                  class="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500"
                  placeholder="yourusername"
                />
                <p v-if="errors.username" class="text-xs text-red-600">
                  {{ errors.username }}
                </p>
              </div>

              <!-- Email -->
              <div class="space-y-1">
                <label
                  for="email"
                  class="block text-sm font-medium text-gray-900"
                >
                  Email
                </label>
                <input
                  id="email"
                  v-model.trim="userData.email"
                  type="email"
                  inputmode="email"
                  autocomplete="email"
                  required
                  class="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500"
                  placeholder="you@example.com"
                />
                <p v-if="errors.email" class="text-xs text-red-600">
                  {{ errors.email }}
                </p>
              </div>

              <!-- Password -->
              <div class="space-y-1">
                <label
                  for="password"
                  class="block text-sm font-medium text-gray-900"
                >
                  Password
                </label>
                <div class="relative">
                  <input
                    id="password"
                    v-model="userData.password"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    required
                    class="h-10 w-full rounded-md border border-gray-300 bg-white px-3 pr-10 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500"
                    placeholder="••••••••"
                  />
                  <!-- Eye toggle -->
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus-visible:outline-none"
                    tabindex="-1"
                    aria-label="Toggle password visibility"
                  >
                    <!-- Eye (visible) -->
                    <svg
                      v-if="showPassword"
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <!-- Eye-off (hidden) -->
                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 002.458 12C3.732 16.057 7.523 19 12 19c1.65 0 3.217-.363 4.617-1.016M21 21L3 3m10.5 7.5A3 3 0 009.88 9.88M12 5c4.477 0 8.268 2.943 9.542 7a10.478 10.478 0 01-1.758 3.088"
                      />
                    </svg>
                  </button>
                </div>
                <p v-if="errors.password" class="text-xs text-red-600">
                  {{ errors.password }}
                </p>
              </div>

              <!-- Submit -->
              <button
                type="submit"
                :disabled="loading"
                class="inline-flex h-10 w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  v-if="loading"
                  class="mr-2 h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
                  />
                </svg>
                Register
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Success toast -->
    <div
      v-if="toast"
      class="fixed top-4 right-4 z-50 flex w-full max-w-xs items-center gap-3 rounded-lg border border-green-200 bg-white px-3 py-2 text-sm text-gray-700 shadow"
      role="status"
    >
      <div
        class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600"
      >
        <svg
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16Zm3.707-9.293a1 1 0 10-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4Z"
          />
        </svg>
      </div>
      <div>Registered successfully.</div>
      <button
        type="button"
        class="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-50"
        @click="toast = false"
        aria-label="Close"
      >
        <svg class="h-3 w-3" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M1 1l12 12M13 1L1 13"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import apiClient from "@/services/AxiosInstance";

const api = "/register";

const userData = ref({
  username: "",
  email: "",
  password: "",
});

const errors = ref({});
const globalError = ref("");
const toast = ref(false);
const loading = ref(false);
const showPassword = ref(false);

async function registerUser() {
  globalError.value = "";
  loading.value = true;
  try {
    if (!validateFields()) {
      loading.value = false;
      return;
    }

    const response = await apiClient.post(api, userData.value);
    // console.log("Response", response);

    userData.value = { username: "", email: "", password: "" };
    toast.value = true;
    setTimeout(() => {
      toast.value = false;
    }, 3000);
  } catch (error) {
    // Field-level errors from API
    if (error?.response?.status === 422 && error?.response?.data?.errors) {
      const e = error.response.data.errors;
      errors.value = {
        email: e.email?.[0] || "",
        username: e.username?.[0] || "",
        password: e.password?.[0] || "",
      };
    } else {
      globalError.value =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed. Please try again.";
    }
  } finally {
    loading.value = false;
  }
}

function validateFields() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nextErrors = {};

  if (!userData.value.username) {
    nextErrors.username = "Username is required.";
  }

  if (!userData.value.email) {
    nextErrors.email = "Email is required.";
  } else if (!emailRegex.test(userData.value.email)) {
    nextErrors.email = "Invalid email address.";
  }

  if (!userData.value.password) {
    nextErrors.password = "Password is required.";
  } else if (userData.value.password.length < 8) {
    nextErrors.password = "Password must be at least 8 characters.";
  }

  errors.value = nextErrors;
  return Object.keys(nextErrors).length === 0;
}
</script>
