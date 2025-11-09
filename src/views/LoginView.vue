<template>
  <div class="h-full bg-gray-50">
    <div class="mx-auto max-w-md h-full px-4 md:px-6">
      <div class="flex h-full items-center">
        <div class="w-full rounded-lg border bg-white shadow-sm">
          <!-- Header -->
          <div class="px-6 pt-6">
            <h1 class="text-xl font-semibold text-gray-900">Sign in</h1>
            <p class="mt-1 text-sm text-gray-600">
              Need an account?
              <RouterLink
                to="/signup"
                class="font-medium text-blue-600 hover:underline"
              >
                Create one
              </RouterLink>
            </p>
          </div>

          <!-- Body -->
          <div class="px-6 pb-6 pt-4">
            <!-- Error -->
            <div
              v-if="errorMessage"
              class="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {{ errorMessage }}
            </div>

            <form class="space-y-4" @submit.prevent="login">
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
                  v-model.trim="loginData.email"
                  type="email"
                  inputmode="email"
                  autocomplete="email"
                  autofocus
                  required
                  class="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500"
                  placeholder="you@example.com"
                />
              </div>

              <!-- Password -->
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
                    v-model="loginData.password"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="current-password"
                    required
                    class="h-10 w-full rounded-md border border-gray-300 bg-white px-3 pr-10 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500"
                    placeholder="••••••••"
                  />

                  <!-- Eye Icon Button -->
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus-visible:outline-none"
                    tabindex="-1"
                  >
                    <!-- Eye (password visible) -->
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

                    <!-- Eye-off (password hidden) -->
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
                Sign in
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Removed footer padding to avoid pushing past viewport -->
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import apiClient from "@/services/AxiosInstance";
import Cookies from "js-cookie";

const router = useRouter();
const route = useRoute();

const api = "/login";

const loginData = ref({
  email: "",
  password: "",
});

const loading = ref(false);
const errorMessage = ref("");
const showPassword = ref(false);

async function login() {
  errorMessage.value = "";
  loading.value = true;
  try {
    const response = await apiClient.post(api, loginData.value);

    if (response.status === 200) {
      const token = response.data?.user?.token;
      if (token) {
        Cookies.set("token", token, { expires: 7 });
        loginData.value = { email: "", password: "" };

        const redirect = route.query.redirect || "/dashboard";
        router.push(redirect);
      } else {
        errorMessage.value = "Missing token in response.";
      }
    } else {
      errorMessage.value = "Unable to sign in. Please try again.";
    }
  } catch (err) {
    errorMessage.value =
      err?.response?.data?.message ||
      err?.message ||
      "Sign in failed. Check your credentials and try again.";
  } finally {
    loading.value = false;
  }
}
</script>
