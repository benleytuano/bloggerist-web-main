<template>
  <!-- Full viewport with two rows: header + content -->
  <div
    class="min-h-svh grid grid-rows-[auto,1fr] overflow-hidden bg-background"
  >
    <header
      class="sticky top-0 z-50 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b"
      style="padding-top: env(safe-area-inset-top)"
    >
      <UnauthenticatedNavbar />
    </header>

    <!-- Give the routed view a fixed area with no scrolling -->
    <main class="relative h-full overflow-hidden">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import UnauthenticatedNavbar from "@/components/UnauthenticatedNavbar.vue";
</script>
