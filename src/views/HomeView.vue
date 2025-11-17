<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="max-w-3xl md:max-w-4xl mx-auto px-4 md:px-6">
      <!-- Tabs -->
      <nav class="mb-6" role="tablist" aria-label="Feed tabs">
        <ul class="flex gap-6 border-b border-gray-200">
          <!-- Your Feed -->
          <li>
            <button
              role="tab"
              :aria-selected="selectedTab === 'followed'"
              @click="handleYourFeedClick"
              class="pb-2 text-sm font-medium -mb-px border-b-2 transition-colors"
              :class="
                selectedTab === 'followed'
                  ? 'text-gray-900 border-blue-500'
                  : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
              "
            >
              Your Feed
            </button>
          </li>

          <!-- Global Feed -->
          <li>
            <button
              role="tab"
              :aria-selected="selectedTab === 'global'"
              @click="handleGlobalFeedClick"
              class="pb-2 text-sm font-medium -mb-px border-b-2 transition-colors"
              :class="
                selectedTab === 'global'
                  ? 'text-gray-900 border-blue-500'
                  : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
              "
            >
              Global Feed
            </button>
          </li>
        </ul>
      </nav>

      <!-- Error state -->
      <div
        v-if="error"
        class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
      >
        <div class="flex items-center justify-between">
          <p class="text-red-800">{{ error }}</p>
          <button
            @click="retryLoad"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>

      <!-- Empty state (only show when not loading and no articles) -->
      <div
        v-if="articles.length === 0 && !isLoading && !isInitialLoad"
        class="py-16 text-center"
      >
        <h2 class="text-lg font-semibold text-gray-900">No articles yet</h2>
        <p class="mt-2 text-gray-600">
          When new posts arrive, they'll show up here. Try another tab.
        </p>
      </div>

      <!-- Initial loading state (first page load) -->
      <div v-if="isInitialLoad" class="divide-y divide-gray-200">
        <div v-for="i in 3" :key="`skeleton-${i}`" class="py-6">
          <SkeletonArticle />
        </div>
      </div>

      <!-- 
        INFINITE SCROLL COMPONENT
        
        Replaces the old pagination with cursor-based infinite scroll.
        Parent manages all state, InfiniteScroll handles scroll detection.
      -->
      <InfiniteScroll
        v-else-if="articles.length > 0"
        :items="articles"
        :is-loading="isLoading"
        :has-more="hasMore"
        :root-margin="'0px'"
        @load-more="loadMore"
      >
        <!-- 
          DEFAULT SLOT: Render article list
          Same layout as before, just wrapped in InfiniteScroll
        -->
        <template #default>
          <div class="divide-y divide-gray-200">
            <article
              v-for="(article, index) in articles"
              :key="article.id ?? index"
              class="py-6"
            >
              <!-- Meta -->
              <div
                class="flex items-center justify-between text-sm text-gray-600"
              >
                <div class="flex items-center">
                  <!-- Avatar initial -->
                  <img
                    v-if="article?.user?.image"
                    :src="article.user.profile_image_url"
                    :alt="`${article.user.username}'s avatar`"
                    class="mr-3 w-8 h-8 rounded-full object-cover"
                  />
                  <div
                    v-else
                    class="mr-3 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold"
                    aria-hidden="true"
                  >
                    {{
                      article?.user?.username
                        ? capitalizeFirstLetter(article.user.username[0])
                        : "A"
                    }}
                  </div>
                  <div>
                    <RouterLink
                      v-if="article?.user?.username"
                      :to="`/profile/${article.user.username}`"
                      class="font-medium text-gray-900 hover:underline"
                    >
                      {{ capitalizeFirstLetter(article.user.username) }}
                    </RouterLink>
                    <span v-else class="font-medium text-gray-900">
                      Unknown author
                    </span>
                    <span class="mx-1">·</span>
                    <time :datetime="article.created_at">
                      {{ formatRelative(article.created_at) }}
                    </time>
                    <template v-if="article.readMinutes">
                      <span class="mx-1">·</span>
                      <span>{{ article.readMinutes }} min read</span>
                    </template>
                  </div>
                </div>

                <!-- Favorites -->
                <div class="inline-flex items-center gap-1 text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                    />
                  </svg>
                  <span>{{ article.favorites_count ?? 0 }}</span>
                </div>
              </div>

              <!-- Title + excerpt -->
              <RouterLink
                :to="`/articles/${article.slug}`"
                class="block mt-3 group"
              >
                <h2
                  class="text-xl font-semibold text-gray-900 group-hover:underline"
                >
                  {{ article.title }}
                </h2>
                <p class="mt-2 text-gray-700">
                  {{ safeExcerpt(article) }}
                </p>
                <span class="mt-2 inline-block text-blue-600 font-medium">
                  Read more
                </span>
              </RouterLink>
            </article>
          </div>
        </template>

        <!-- 
          LOADER SLOT: Colorful skeleton loader (like your image)
          Shows animated skeleton cards while loading more articles
        -->
        <template #loader>
          <div class="divide-y divide-gray-200">
            <div v-for="i in 2" :key="`loading-${i}`" class="py-6">
              <SkeletonArticle />
            </div>
          </div>
        </template>

        <!-- 
          END SLOT: No more articles message
          Simple, clean message when all articles are loaded
        -->
        <template #end>
          <div class="py-12 text-center">
            <p class="text-gray-500">✨ You've reached the end!</p>
            <p class="mt-1 text-sm text-gray-400">
              All {{ articles.length }} articles loaded
            </p>
          </div>
        </template>
      </InfiniteScroll>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import apiClient from "@/services/AxiosInstance";
import { isAuthenticated } from "@/services/auth.js";
import InfiniteScroll from "@/components/InfiniteScroll.vue";

const router = useRouter();

/**
 * ==========================================
 * AUTHENTICATION STATE
 * ==========================================
 */
const userIsAuthenticated = ref(false);

/**
 * ==========================================
 * TAB STATE
 * ==========================================
 */
const selectedTab = ref("global");

/**
 * ==========================================
 * INFINITE SCROLL STATE
 * ==========================================
 *
 * All state required for cursor-based pagination.
 */

// Articles array - appended to on each successful fetch
const articles = ref([]);

// Loading state - prevents concurrent requests
const isLoading = ref(false);

// Initial load flag - for showing skeleton on first load
const isInitialLoad = ref(true);

// Has more articles - from backend meta.has_more
const hasMore = ref(true);

// Next cursor - from backend meta.next_cursor
const nextCursor = ref(null);

// Error handling
const error = ref(null);

// Current feed endpoint (changes based on tab)
const currentEndpoint = ref("/articles");

/**
 * ==========================================
 * SKELETON ARTICLE COMPONENT
 * ==========================================
 * Colorful animated skeleton loader matching your design
 */
const SkeletonArticle = {
  template: `
    <div class="animate-pulse">
      <!-- Meta skeleton -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <!-- Colorful avatar skeleton -->
          <div class="mr-3 w-8 h-8 rounded-full skeleton-gradient"></div>
          <div class="space-y-2">
            <div class="h-3 w-24 skeleton-gradient rounded"></div>
            <div class="h-2 w-32 skeleton-gradient rounded"></div>
          </div>
        </div>
        <div class="h-5 w-10 skeleton-gradient rounded"></div>
      </div>
      
      <!-- Title skeleton -->
      <div class="mt-3 space-y-2">
        <div class="h-5 w-3/4 skeleton-gradient rounded"></div>
        <div class="h-5 w-1/2 skeleton-gradient rounded"></div>
      </div>
      
      <!-- Excerpt skeleton -->
      <div class="mt-3 space-y-2">
        <div class="h-3 w-full skeleton-gradient rounded"></div>
        <div class="h-3 w-full skeleton-gradient rounded"></div>
        <div class="h-3 w-2/3 skeleton-gradient rounded"></div>
      </div>
      
      <!-- Read more skeleton -->
      <div class="mt-3 h-4 w-20 skeleton-gradient rounded"></div>
    </div>
  `,
};

/**
 * ==========================================
 * FETCH PAGE FUNCTION
 * ==========================================
 */
async function fetchPage(cursor = null) {
  try {
    // Set loading state
    isLoading.value = true;
    error.value = null;

    console.log("[Feed] Fetching page:", {
      cursor,
      endpoint: currentEndpoint.value,
      currentArticles: articles.value.length,
    });

    /**
     * BUILD REQUEST PARAMS
     */
    const params = {
      limit: 5, // Using your limit of 5
      ...(cursor && { cursor }),
    };

    /**
     * MAKE API REQUEST
     */
    const response = await apiClient.get(currentEndpoint.value, { params });

    console.log("[Feed] Response received:", {
      dataLength: response.data?.data?.length,
      hasMore: response.data?.meta?.has_more,
      nextCursor: response.data?.meta?.next_cursor,
    });

    /**
     * VALIDATE RESPONSE STRUCTURE
     */
    if (
      !response.data ||
      !Array.isArray(response.data.data) ||
      !response.data.meta
    ) {
      throw new Error("Invalid API response structure");
    }

    const { data, meta } = response.data;

    /**
     * APPEND NEW ARTICLES
     */
    articles.value.push(...data);

    /**
     * UPDATE PAGINATION STATE
     */
    hasMore.value = meta.has_more;
    nextCursor.value = meta.next_cursor || null;

    console.log("[Feed] State updated:", {
      totalArticles: articles.value.length,
      hasMore: hasMore.value,
      nextCursor: nextCursor.value,
    });
  } catch (err) {
    console.error("[Feed] Failed to fetch articles:", err);

    // Set user-friendly error message
    if (err.response?.status === 401) {
      error.value = "Please log in to view this feed.";
    } else if (err.response?.status === 429) {
      error.value = "Too many requests. Please wait a moment.";
    } else if (!navigator.onLine) {
      error.value = "No internet connection. Check your network.";
    } else {
      error.value = "Failed to load articles. Please try again.";
    }
  } finally {
    // Always reset loading states
    isLoading.value = false;
    isInitialLoad.value = false;
  }
}

/**
 * ==========================================
 * LOAD MORE HANDLER
 * ==========================================
 */
function loadMore() {
  console.log("[Feed] loadMore called:", {
    isLoading: isLoading.value,
    hasMore: hasMore.value,
    nextCursor: nextCursor.value,
  });

  // Guard: Don't load if already loading
  if (isLoading.value) {
    console.warn("[Feed] Already loading, skipping");
    return;
  }

  // Guard: Don't load if no more articles
  if (!hasMore.value) {
    console.warn("[Feed] No more articles to load");
    return;
  }

  /**
   * FETCH NEXT PAGE
   */
  fetchPage(nextCursor.value);
}

/**
 * ==========================================
 * RESET STATE HELPER
 * ==========================================
 */
function resetState() {
  console.log("[Feed] Resetting state");
  articles.value = [];
  nextCursor.value = null;
  hasMore.value = true;
  error.value = null;
  isLoading.value = false;
  isInitialLoad.value = true;
}

/**
 * ==========================================
 * TAB HANDLERS
 * ==========================================
 */
async function handleYourFeedClick() {
  if (!userIsAuthenticated.value) {
    router.push("/login");
    return;
  }

  if (selectedTab.value !== "followed") {
    selectedTab.value = "followed";
    currentEndpoint.value = "/articles/feed";
    resetState();
    await fetchPage(null);
  }
}

async function handleGlobalFeedClick() {
  if (selectedTab.value !== "global") {
    selectedTab.value = "global";
    currentEndpoint.value = "/articles";
    resetState();
    await fetchPage(null);
  }
}

/**
 * ==========================================
 * RETRY HANDLER
 * ==========================================
 */
function retryLoad() {
  error.value = null;
  fetchPage(nextCursor.value);
}

/**
 * ==========================================
 * UTILITY FUNCTIONS
 * ==========================================
 */
function capitalizeFirstLetter(text = "") {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

function formatRelative(input) {
  const date = new Date(input);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now - date;
  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (sec < 60) return "just now";
  if (min < 60) return `${min} min${min > 1 ? "s" : ""} ago`;
  if (hr < 24) return `${hr} hour${hr > 1 ? "s" : ""} ago`;
  if (day < 7) return `${day} day${day > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function safeExcerpt(article) {
  const text = article?.description || article?.body || "";
  if (!text) return "";
  return text.length > 160 ? text.slice(0, 160).trim() + "…" : text;
}

/**
 * ==========================================
 * LIFECYCLE: MOUNTED
 * ==========================================
 */
onMounted(async () => {
  console.log("[Feed] Component mounted");
  userIsAuthenticated.value = await isAuthenticated();
  await fetchPage(null);
});
</script>

<style scoped>
/**
 * COLORFUL SKELETON GRADIENT ANIMATION
 * Creates the animated gradient effect like in your image
 */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton-gradient {
  background: linear-gradient(
    90deg,
    #60d5f2 0%,
    #e551e8 25%,
    #1e40af 50%,
    #7c3aed 75%,
    #dc2626 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
</style>
