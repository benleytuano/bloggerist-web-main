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
              @click="getGlobalFeed"
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

      <!-- Empty state (removed the border that caused the second line) -->
      <div v-if="articles.length === 0" class="py-16 text-center">
        <h2 class="text-lg font-semibold text-gray-900">No articles yet</h2>
        <p class="mt-2 text-gray-600">
          When new posts arrive, they’ll show up here. Try another tab.
        </p>
      </div>

      <!-- Feed (divider-separated rows) -->
      <div v-else class="divide-y divide-gray-200">
        <article
          v-for="(article, index) in articles"
          :key="article.id ?? index"
          class="py-6"
        >
          <!-- Meta -->
          <div class="flex items-center justify-between text-sm text-gray-600">
            <div class="flex items-center">
              <!-- Avatar initial only (no thumbnails column per spec) -->
              <div
                class="mr-3 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold"
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
                <span v-else class="font-medium text-gray-900"
                  >Unknown author</span
                >
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
              <span>{{ article.favorited_by_users_count ?? 0 }}</span>
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
            <span class="mt-2 inline-block text-blue-600 font-medium"
              >Read more</span
            >
          </RouterLink>
        </article>
      </div>

      <!-- Pagination -->
      <ul
        v-if="paginationLinks.length > 0"
        class="flex justify-center mt-8"
        aria-label="Pagination"
      >
        <li v-for="link in paginationLinks" :key="link.label" class="mx-1">
          <button
            type="button"
            :class="[
              'px-4 py-2 rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              link.active
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
            ]"
            @click="paginate(link.url)"
            v-html="link.label"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { RouterLink, useRouter } from "vue-router";
import apiClient from "@/services/AxiosInstance";
import { isAuthenticated } from "@/services/auth.js";

const router = useRouter();

const userIsAuthenticated = ref(false);
const selectedTab = ref("global");

const articles = ref([]);
const fetchArticlesPaginationData = ref({});
const paginationLinks = ref([]);

async function handleYourFeedClick() {
  if (!userIsAuthenticated.value) {
    router.push("/login");
    return;
  }
  await getFollowedFeed();
}

async function getFollowedFeed() {
  selectedTab.value = "followed";
  try {
    const response = await apiClient.get("/articles/feed?page=1&limit=2");
    handlePageResponse(response);
  } catch (error) {
    console.error(error);
    articles.value = [];
    paginationLinks.value = [];
  }
}

async function getGlobalFeed() {
  selectedTab.value = "global";
  try {
    const response = await apiClient.get("/articles?page=1&limit=2");
    handlePageResponse(response);
  } catch (error) {
    console.error(error);
    articles.value = [];
    paginationLinks.value = [];
  }
}

async function paginate(url) {
  try {
    const response = await apiClient.get(`${url}&limit=2`);
    handlePageResponse(response);
  } catch (error) {
    console.error(error);
  }
}

function handlePageResponse(response) {
  if (response.status === 200 && response.data) {
    const { current_page, last_page, links, data } = response.data;
    articles.value = Array.isArray(data) ? data : [];
    fetchArticlesPaginationData.value = response.data;

    if (!Array.isArray(links) || links.length === 0) {
      paginationLinks.value = [];
      return;
    }

    // window of 3 links centered on current page
    if (current_page === 1) {
      paginationLinks.value = links.slice(current_page, current_page + 3);
    } else if (current_page === last_page) {
      paginationLinks.value = links.slice(current_page - 2, current_page + 1);
    } else {
      paginationLinks.value = links.slice(current_page - 1, current_page + 2);
    }
  }
}

// --- Helpers (self-contained) ---
function capitalizeFirstLetter(text = "") {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

// Relative date like “2h ago”, then short absolute (e.g., “Jul 22”)
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

// Prefer description; otherwise clamp content/text to ~160 chars
function safeExcerpt(article) {
  const text = article?.description || article?.content || "";
  if (!text) return "";
  return text.length > 160 ? text.slice(0, 160).trim() + "…" : text;
}

onMounted(async () => {
  userIsAuthenticated.value = await isAuthenticated();
  await getGlobalFeed();
});
</script>
