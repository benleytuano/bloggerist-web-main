<template>
  <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
    <div class="text-lg text-gray-600">Loading...</div>
  </div>

  <div v-else class="min-h-screen bg-white">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex gap-16">
        <!-- LEFT SIDEBAR - FIXED USER INFO -->
        <aside class="w-72 flex-shrink-0">
          <div class="sticky top-8">
            <!-- User Avatar -->
            <div class="flex justify-center mb-4">
              <img
                v-if="viewedUser.image"
                :src="viewedUser.profile_image_url"
                alt="Profile"
                class="w-20 h-20 rounded-full object-cover"
              />
              <div
                v-else
                class="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-3xl"
              >
                {{ capitalizeFirstLetter(viewedUser.username[0]) }}
              </div>
            </div>

            <!-- Username -->
            <h1 class="text-xl font-bold text-gray-900 text-center mb-2">
              {{ viewedUser.username }}
            </h1>

            <!-- Bio -->
            <p class="text-gray-600 text-center text-sm mb-6">
              {{ viewedUser.bio || "No bio yet" }}
            </p>

            <!-- Follow/Edit Button -->
            <div class="mb-6">
              <button
                v-if="viewedUser.id !== currentUser.id && isFollowed"
                @click="unfollowUser"
                class="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                Unfollow
              </button>

              <button
                v-else-if="viewedUser.id !== currentUser.id && !isFollowed"
                @click="followerUser"
                class="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
              >
                Follow
              </button>

              <router-link
                v-else
                to="/edit-profile"
                class="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-4 h-4 mr-2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
                Edit Profile
              </router-link>
            </div>

            <!-- Stats -->
            <div class="pt-4 border-t border-gray-200">
              <div class="text-sm text-gray-600">
                <div class="flex justify-between">
                  <span>Articles</span>
                  <span class="font-semibold text-gray-900">{{
                    articles.length
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- RIGHT CONTENT - SCROLLABLE ARTICLES -->
        <main class="flex-1 min-w-0 max-w-4xl">
          <!-- Tabs -->
          <nav class="mb-8" role="tablist" aria-label="Article tabs">
            <ul class="flex gap-8 border-b border-gray-200">
              <li>
                <button
                  role="tab"
                  :aria-selected="selectedTab === 'myArticle'"
                  @click="handleMyArticlesClick"
                  class="pb-3 text-sm font-medium border-b-2 transition-colors"
                  :class="
                    selectedTab === 'myArticle'
                      ? 'text-gray-900 border-gray-900'
                      : 'text-gray-500 border-transparent hover:text-gray-900'
                  "
                >
                  {{
                    viewedUser.id === currentUser.id
                      ? "My Articles"
                      : "Articles"
                  }}
                </button>
              </li>

              <li v-if="viewedUser.id === currentUser.id">
                <button
                  role="tab"
                  :aria-selected="selectedTab === 'favorite'"
                  @click="handleFavoriteArticlesClick"
                  class="pb-3 text-sm font-medium border-b-2 transition-colors"
                  :class="
                    selectedTab === 'favorite'
                      ? 'text-gray-900 border-gray-900'
                      : 'text-gray-500 border-transparent hover:text-gray-900'
                  "
                >
                  Favorited Articles
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

          <!-- Empty state -->
          <div
            v-if="
              articles.length === 0 &&
              !isArticlesLoading &&
              !isInitialArticlesLoad
            "
            class="py-16 text-center"
          >
            <h2 class="text-lg font-semibold text-gray-900">No articles yet</h2>
            <p class="mt-2 text-gray-600 text-sm">
              {{
                viewedUser.id === currentUser.id
                  ? "Start writing your first article!"
                  : "This user hasn't written any articles yet."
              }}
            </p>
          </div>

          <!-- Initial loading state -->
          <div v-if="isInitialArticlesLoad" class="space-y-8">
            <div v-for="i in 3" :key="`skeleton-${i}`">
              <SkeletonArticle />
            </div>
          </div>

          <!-- INFINITE SCROLL COMPONENT -->
          <InfiniteScroll
            v-else-if="articles.length > 0"
            :items="articles"
            :is-loading="isArticlesLoading"
            :has-more="hasMore"
            :root-margin="'200px'"
            @load-more="loadMore"
          >
            <!-- DEFAULT SLOT: Render article list -->
            <template #default>
              <div>
                <article
                  v-for="(article, index) in articles"
                  :key="article.id ?? index"
                  class="py-8"
                >
                  <!-- Article Meta -->
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center text-sm text-gray-500">
                      <RouterLink
                        :to="`/profile/${article.user.username}`"
                        class="flex items-center hover:text-gray-900 transition-colors"
                      >
                        <img
                          v-if="article.user.image"
                          :src="article.user.profile_image_url"
                          alt="Author"
                          class="w-6 h-6 rounded-full object-cover mr-2"
                        />
                        <div
                          v-else
                          class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs mr-2"
                        >
                          {{ capitalizeFirstLetter(article.user.username[0]) }}
                        </div>
                        <span class="font-medium">{{
                          capitalizeFirstLetter(article.user.username)
                        }}</span>
                      </RouterLink>
                      <span class="mx-2">·</span>
                      <time :datetime="article.created_at">
                        {{ formatDate(article.created_at) }}
                      </time>
                    </div>

                    <!-- Favorites -->
                    <div class="flex items-center gap-1 text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-5 h-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                        />
                      </svg>
                      <span class="text-sm">{{
                        article.favorited_by_users_count ?? 0
                      }}</span>
                    </div>
                  </div>

                  <!-- Article Content -->
                  <RouterLink
                    :to="`/articles/${article.slug}`"
                    class="block group"
                  >
                    <h2
                      class="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors leading-snug"
                    >
                      {{ article.title }}
                    </h2>
                    <p class="text-gray-600 mb-3 leading-relaxed">
                      {{ article.description }}
                    </p>
                    <span
                      class="text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors"
                    >
                      Read more →
                    </span>
                  </RouterLink>

                  <!-- Divider -->
                  <hr
                    v-if="index < articles.length - 1"
                    class="mt-8 border-gray-200"
                  />
                </article>
              </div>
            </template>

            <!-- LOADER SLOT -->
            <template #loader>
              <div class="space-y-8 mt-8">
                <div v-for="i in 2" :key="`loading-${i}`">
                  <SkeletonArticle />
                </div>
              </div>
            </template>

            <!-- END SLOT -->
            <template #end>
              <div class="py-12 text-center border-t border-gray-200">
                <p class="text-gray-500 text-sm">You've reached the end</p>
                <p class="mt-1 text-xs text-gray-400">
                  All {{ articles.length }} articles loaded
                </p>
              </div>
            </template>
          </InfiniteScroll>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import apiClient from "@/services/AxiosInstance";
import InfiniteScroll from "@/components/InfiniteScroll.vue";

const route = useRoute();

// User data
const isLoading = ref(true);
const viewedUser = ref({});
const currentUser = ref({});
const isFollowed = ref(false);

// Articles infinite scroll state
const articles = ref([]);
const selectedTab = ref("myArticle");
const isArticlesLoading = ref(false);
const isInitialArticlesLoad = ref(true);
const hasMore = ref(true);
const nextCursor = ref(null);
const error = ref(null);

/**
 * SKELETON ARTICLE COMPONENT
 */
const SkeletonArticle = {
  template: `
    <div class="py-8 animate-pulse">
      <!-- Meta skeleton -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center">
          <div class="w-6 h-6 rounded-full bg-gray-200 mr-2"></div>
          <div class="h-3 w-32 bg-gray-200 rounded"></div>
        </div>
        <div class="h-5 w-10 bg-gray-200 rounded"></div>
      </div>
      
      <!-- Title skeleton -->
      <div class="space-y-2 mb-3">
        <div class="h-5 w-3/4 bg-gray-200 rounded"></div>
        <div class="h-5 w-1/2 bg-gray-200 rounded"></div>
      </div>
      
      <!-- Description skeleton -->
      <div class="space-y-2 mb-3">
        <div class="h-3 w-full bg-gray-200 rounded"></div>
        <div class="h-3 w-full bg-gray-200 rounded"></div>
        <div class="h-3 w-2/3 bg-gray-200 rounded"></div>
      </div>
      
      <!-- Read more skeleton -->
      <div class="h-3 w-24 bg-gray-200 rounded"></div>
      
      <!-- Divider -->
      <hr class="mt-8 border-gray-200" />
    </div>
  `,
};

/**
 * FETCH ARTICLES PAGE
 */
async function fetchArticlesPage(cursor = null) {
  try {
    isArticlesLoading.value = true;
    error.value = null;

    console.log("[Profile] Fetching articles:", {
      cursor,
      tab: selectedTab.value,
      currentArticles: articles.value.length,
    });

    let endpoint = "";
    let params = { limit: 5 };

    if (selectedTab.value === "myArticle") {
      const authorId =
        viewedUser.value.id === currentUser.value.id
          ? currentUser.value.id
          : viewedUser.value.id;
      endpoint = "/articles";
      params.author = authorId;
    } else if (selectedTab.value === "favorite") {
      endpoint = "/articles/favoriteFeed";
    }

    if (cursor) {
      params.cursor = cursor;
    }

    const response = await apiClient.get(endpoint, { params });

    console.log("[Profile] Response:", response.data);

    if (
      !response.data ||
      !Array.isArray(response.data.data) ||
      !response.data.meta
    ) {
      throw new Error("Invalid API response structure");
    }

    const { data, meta } = response.data;

    // Append new articles
    articles.value.push(...data);

    // Update pagination state
    hasMore.value = meta.has_more;
    nextCursor.value = meta.next_cursor || null;

    console.log("[Profile] State updated:", {
      totalArticles: articles.value.length,
      hasMore: hasMore.value,
      nextCursor: nextCursor.value,
    });
  } catch (err) {
    console.error("[Profile] Failed to fetch articles:", err);

    if (err.response?.status === 401) {
      error.value = "Please log in to view this content.";
    } else if (err.response?.status === 429) {
      error.value = "Too many requests. Please wait a moment.";
    } else if (!navigator.onLine) {
      error.value = "No internet connection. Check your network.";
    } else {
      error.value = "Failed to load articles. Please try again.";
    }
  } finally {
    isArticlesLoading.value = false;
    isInitialArticlesLoad.value = false;
  }
}

/**
 * LOAD MORE HANDLER
 */
function loadMore() {
  console.log("[Profile] loadMore called:", {
    isLoading: isArticlesLoading.value,
    hasMore: hasMore.value,
    nextCursor: nextCursor.value,
  });

  if (isArticlesLoading.value) {
    console.warn("[Profile] Already loading, skipping");
    return;
  }

  if (!hasMore.value) {
    console.warn("[Profile] No more articles to load");
    return;
  }

  fetchArticlesPage(nextCursor.value);
}

/**
 * RESET ARTICLES STATE
 */
function resetArticlesState() {
  console.log("[Profile] Resetting articles state");
  articles.value = [];
  nextCursor.value = null;
  hasMore.value = true;
  error.value = null;
  isArticlesLoading.value = false;
  isInitialArticlesLoad.value = true;
}

/**
 * TAB HANDLERS
 */
async function handleMyArticlesClick() {
  if (selectedTab.value !== "myArticle") {
    selectedTab.value = "myArticle";
    resetArticlesState();
    await fetchArticlesPage(null);
  }
}

async function handleFavoriteArticlesClick() {
  if (selectedTab.value !== "favorite") {
    selectedTab.value = "favorite";
    resetArticlesState();
    await fetchArticlesPage(null);
  }
}

/**
 * RETRY HANDLER
 */
function retryLoad() {
  error.value = null;
  fetchArticlesPage(nextCursor.value);
}

/**
 * USER DATA FUNCTIONS
 */
async function getUserData() {
  const slug = route.params.slug;

  try {
    const response = await apiClient.get(`/profiles/${slug}`);

    if (response.data) {
      viewedUser.value = response.data;
    }
  } catch (error) {
    console.error(error);
  }
}

async function getCurrentUser() {
  try {
    const response = await apiClient.get(`/user`);

    if (response.status === 200 && response.data) {
      currentUser.value = response.data;
    }
  } catch (error) {
    console.error(error);
  }
}

async function followerUser() {
  try {
    const response = await apiClient.post(
      `profiles/${viewedUser.value.username}/follow`
    );

    if (response.status === 200) {
      await checkIsFollowed();
    }
  } catch (error) {
    console.log(error);
  }
}

async function unfollowUser() {
  try {
    const response = await apiClient.delete(
      `profiles/${viewedUser.value.username}/follow`
    );

    if (response.status === 200) {
      await checkIsFollowed();
    }
  } catch (error) {
    console.log(error);
  }
}

async function checkIsFollowed() {
  try {
    const response = await apiClient.get(
      `/profiles/${viewedUser.value.id}/checkIsFollowed`
    );

    if (response.status === 200) {
      isFollowed.value = response.data.isFollowed;
    }
  } catch (error) {
    console.log(error);
  }
}

/**
 * UTILITY FUNCTIONS
 */
function capitalizeFirstLetter(text = "") {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * LIFECYCLE: MOUNTED
 */
onMounted(async () => {
  console.log("[Profile] Component mounted");
  await getUserData();
  await getCurrentUser();
  await checkIsFollowed();
  await fetchArticlesPage(null);
  isLoading.value = false;
});
</script>

<style scoped>
/* Ensure sidebar stays fixed on scroll */
@media (min-width: 1024px) {
  aside {
    position: sticky;
    top: 2rem;
    align-self: flex-start;
  }
}

/* Responsive adjustments */
@media (max-width: 1023px) {
  .flex {
    flex-direction: column;
  }

  aside {
    width: 100%;
    max-width: none;
    margin-bottom: 2rem;
  }

  aside > div {
    position: static;
  }

  main {
    max-width: 100%;
  }
}

/* Smooth transitions */
a,
button {
  transition: all 0.2s ease;
}
</style>
