<template>
  <div class="infinite-scroll-container">
    <!-- 
      DEFAULT SLOT: Parent component renders the list items here.
      This keeps the component fully reusable - the parent controls
      how each item is displayed.
    -->
    <slot name="default" :items="items"></slot>

    <!-- 
      SENTINEL DIV: This is the key element for IntersectionObserver.
      When this element becomes visible in the viewport, it triggers
      the load-more event. We use IntersectionObserver instead of
      scroll events because:
      1. Better performance (native browser API, no scroll throttling needed)
      2. More reliable (works with any scrollable container)
      3. Declarative approach (observe visibility, not calculate positions)
      
      CRITICAL FIX: Must have visible height (20px) for IntersectionObserver to work!
      Previously was 1px which was too small to reliably detect.
    -->
    <div
      v-if="hasMore"
      ref="sentinelRef"
      class="sentinel"
      aria-hidden="true"
    ></div>

    <!-- 
      LOADER SLOT: Shown when data is being fetched.
      Parent can customize the loading indicator.
      Only visible when isLoading is true.
    -->
    <div v-if="isLoading" class="loader-container">
      <slot name="loader">
        <!-- Default loader if parent doesn't provide one -->
        <div class="default-loader">
          <div class="spinner"></div>
          <p>Loading more...</p>
        </div>
      </slot>
    </div>

    <!-- 
      END SLOT: Shown when all data has been loaded.
      Only visible when hasMore is false and not loading.
    -->
    <div
      v-if="!hasMore && !isLoading && items.length > 0"
      class="end-container"
    >
      <slot name="end">
        <!-- Default end message if parent doesn't provide one -->
        <p class="default-end">No more items to load</p>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";

/**
 * PROPS DEFINITION
 * These props make the component completely reusable.
 * The parent manages all state and business logic.
 */
const props = defineProps({
  // Array of items to display (managed by parent)
  items: {
    type: Array,
    required: true,
    default: () => [],
  },

  // Loading state (prevents duplicate requests)
  isLoading: {
    type: Boolean,
    required: true,
    default: false,
  },

  // Whether more items exist on the backend
  hasMore: {
    type: Boolean,
    required: true,
    default: true,
  },

  // IntersectionObserver root margin
  // Positive values trigger loading before sentinel is visible (prefetch)
  // "200px" means load when sentinel is 200px away from viewport
  rootMargin: {
    type: String,
    default: "200px",
  },

  // IntersectionObserver threshold
  // 0.5 means trigger when 50% of sentinel is visible
  threshold: {
    type: [Number, Array],
    default: 0,
  },
});

/**
 * EVENTS DEFINITION
 * Single event emitted when more data should be loaded
 */
const emit = defineEmits(["load-more"]);

/**
 * REFS
 * sentinelRef: Template ref to the sentinel div element
 * observer: IntersectionObserver instance
 */
const sentinelRef = ref(null);
let observer = null;

/**
 * LOAD MORE HANDLER
 * This function is called when the sentinel becomes visible.
 *
 * GUARDING LOGIC (Critical for preventing duplicate requests):
 * 1. Check if already loading → prevent concurrent requests
 * 2. Check if hasMore is true → don't request if no more data
 * 3. Only then emit load-more to parent
 *
 * The parent component will:
 * - Set isLoading = true
 * - Fetch data from API
 * - Append new items
 * - Update hasMore and cursor
 * - Set isLoading = false
 */
const handleLoadMore = () => {
  // Guard: Don't load if already loading or no more items
  if (props.isLoading || !props.hasMore) {
    console.log("[InfiniteScroll] Load blocked:", {
      isLoading: props.isLoading,
      hasMore: props.hasMore,
    });
    return;
  }

  console.log("[InfiniteScroll] Emitting load-more event");

  // Emit event to parent to trigger data fetching
  emit("load-more");
};

/**
 * SETUP INTERSECTION OBSERVER
 * Creates and configures the IntersectionObserver.
 *
 * WHY INTERSECTION OBSERVER?
 * - Performant: Browser-native API, runs on compositor thread
 * - Reliable: Works regardless of scroll container
 * - Clean: No need for scroll event listeners or throttling
 * - Flexible: rootMargin allows prefetching before visible
 */
const setupObserver = () => {
  // Cleanup existing observer if it exists
  if (observer) {
    observer.disconnect();
  }

  // Don't create observer if sentinel ref isn't available yet
  if (!sentinelRef.value) {
    console.log("[InfiniteScroll] Sentinel ref not available yet");
    return;
  }

  console.log("[InfiniteScroll] Setting up observer with config:", {
    rootMargin: props.rootMargin,
    threshold: props.threshold,
  });

  // Create new IntersectionObserver
  observer = new IntersectionObserver(
    (entries) => {
      // entries is an array, but we only observe one element
      const entry = entries[0];

      console.log("[InfiniteScroll] Intersection detected:", {
        isIntersecting: entry.isIntersecting,
        intersectionRatio: entry.intersectionRatio,
      });

      /**
       * INTERSECTION LOGIC
       * entry.isIntersecting = true when sentinel is visible
       * This triggers the load-more event (with guards)
       */
      if (entry.isIntersecting) {
        handleLoadMore();
      }
    },
    {
      // Root: null means viewport (can be customized for scrollable containers)
      root: null,

      // How far outside viewport to trigger (prefetch distance)
      rootMargin: props.rootMargin,

      // Percentage of sentinel that must be visible
      threshold: props.threshold,
    }
  );

  // Start observing the sentinel element
  observer.observe(sentinelRef.value);
  console.log("[InfiniteScroll] Observer started");
};

/**
 * LIFECYCLE: MOUNTED
 * Setup observer once component is mounted and DOM is ready
 */
onMounted(() => {
  setupObserver();
});

/**
 * LIFECYCLE: UNMOUNTED
 * Cleanup observer to prevent memory leaks
 */
onUnmounted(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
    console.log("[InfiniteScroll] Observer disconnected");
  }
});

/**
 * WATCH: RECONNECT OBSERVER
 *
 * WHEN TO RECONNECT:
 * 1. When rootMargin or threshold props change
 * 2. When sentinel element changes (edge case)
 * 3. When hasMore changes (need to reconnect if it becomes true again)
 *
 * WHY WATCH THESE PROPS?
 * If parent changes observer configuration dynamically,
 * we need to recreate the observer with new settings.
 */
watch(
  [
    () => props.rootMargin,
    () => props.threshold,
    () => props.hasMore,
    sentinelRef,
  ],
  () => {
    setupObserver();
  }
);
</script>

<style scoped>
/**
 * CONTAINER STYLES
 * Minimal styling to ensure component works out of the box
 */
.infinite-scroll-container {
  width: 100%;
  position: relative;
}

/**
 * SENTINEL STYLES
 * 
 * CRITICAL FIX: The sentinel must have visible height!
 * Previously was 1px which was too small for reliable detection.
 * Now set to 20px to ensure IntersectionObserver can detect it.
 * 
 * IMPORTANT: The sentinel must:
 * 1. Be visible (height > 1px) for IntersectionObserver to work reliably
 * 2. Not interfere with layout (transparent)
 * 3. Be accessible-hidden (aria-hidden="true")
 */
.sentinel {
  height: 20px;
  width: 100%;
  pointer-events: none;
  background: transparent;
}

/**
 * LOADER CONTAINER
 * Centers the loading indicator
 */
.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
  min-height: 100px;
}

/**
 * DEFAULT LOADER STYLES
 * Simple spinner animation
 */
.default-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.default-loader p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

/**
 * END CONTAINER
 * Centers the "no more items" message
 */
.end-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
  min-height: 80px;
}

.default-end {
  margin: 0;
  color: #999;
  font-size: 0.9rem;
  font-style: italic;
}

/**
 * RESPONSIVE ADJUSTMENTS
 */
@media (max-width: 768px) {
  .loader-container,
  .end-container {
    padding: 1.5rem 1rem;
    min-height: 80px;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border-width: 3px;
  }
}
</style>
