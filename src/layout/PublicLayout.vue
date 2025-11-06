<template>
  <div class="relative">
    <UnauthenticatedNavbar />
    <main class="bg-main h-screen relative bg-background">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import UnauthenticatedNavbar from "@/components/UnauthenticatedNavbar.vue";
</script>
