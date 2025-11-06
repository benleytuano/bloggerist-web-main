<template>
  <nav class="bg-gray-100 border-b border-gray-200 p-5">
    <div class="container mx-auto flex justify-between items-center">
      <RouterLink to="/">
        <h1 class="text-2xl font-bold text-gray-800">Devlog</h1>
      </RouterLink>
      <div class="flex gap-2">
        <RouterLink
          to="/login"
          class="text-blue-600 hover:underline font-medium"
        >
          <button
            type="button"
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            Sign In
          </button>
        </RouterLink>
        <RouterLink
          to="/register"
          class="text-blue-600 hover:underline font-medium"
        >
          <button
            type="button"
            class="text-white hover:text-white bg-transparent hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium border border-blue-500 rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            Create Account
          </button>
        </RouterLink>
      </div>
    </div>
  </nav>
</template>

<script setup></script>
