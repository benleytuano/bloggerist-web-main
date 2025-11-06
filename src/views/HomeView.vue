<template>
  <div class="bg-gray-100 min-h-screen py-8">
    <div class="container mx-auto">
      <div class="flex flex-wrap">
        <!-- Main Content -->
        <div class="w-full lg:w-3/4 px-4">
          <!-- Navigation -->
          <div class="feed-toggle mb-6">
            <ul class="flex border-b">
              <li class="mr-4" v-if="userIsAuthenticated">
                <button
                  @click="getFollowedFeed"
                  class="inline-block px-4 py-2 text-gray-600"
                  :class="{
                    'border-b-2 border-blue-500 font-bold':
                      selectedTab === 'followed',
                    'hover:text-gray-900 border-b-2 border-transparent hover:border-gray-400':
                      selectedTab !== 'followed',
                  }"
                >
                  Your Feed
                </button>
              </li>
              <li>
                <button
                  @click="getGlobalFeed"
                  class="inline-block px-4 py-2 text-gray-900"
                  :class="{
                    'border-b-2 border-blue-500 font-bold':
                      selectedTab === 'global',
                    'hover:text-gray-900 border-b-2 border-transparent hover:border-gray-400':
                      selectedTab !== 'global',
                  }"
                >
                  Global Feed
                </button>
              </li>
            </ul>
          </div>

          <!-- Articles -->
          <div
            v-for="(article, index) in articles"
            :key="index"
            class="article-preview bg-white shadow-md rounded-lg p-4 mb-6"
          >
            <div class="article-meta flex items-center justify-between mb-4">
              <div class="flex items-center">
                <div class="mr-4">
                  <RouterLink
                    :to="`/profile/${article.user.username}`"
                    class="flex items-center text-gray-600 hover:text-blue-600 font-medium"
                  >
                    <img
                      v-if="article.user.image"
                      :src="article.user.profile_image_url"
                      alt="Author"
                      class="w-8 h-8 rounded-full mr-2"
                    />
                    <div
                      v-else
                      class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-white"
                    >
                      {{ capitalizeFirstLetter(article.user.username[0]) }}
                    </div>
                  </RouterLink>
                </div>
                <div>
                  <RouterLink
                    :to="`/profile/${article.user.username}`"
                    class="text-blue-500 font-semibold"
                  >
                    {{ capitalizeFirstLetter(article.user.username) }}
                  </RouterLink>
                  <span class="block text-gray-500 text-sm">{{
                    formatDate(article.created_at)
                  }}</span>
                </div>
              </div>
              <button
                class="flex items-center text-gray-500 hover:text-blue-500 border border-[#3b82f6] px-2 py-1 rounded-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
                {{ article.favorited_by_users_count }}
              </button>
            </div>
            <RouterLink :to="`/articles/${article.slug}`" class="preview-link">
              <h1 class="text-xl font-semibold text-gray-900 mb-2">
                {{ article.title }}
              </h1>
              <p class="text-gray-600 mb-2">{{ article.description }}</p>
              <span class="text-blue-500 font-medium">Read more...</span>
              <!-- <ul class="tag-list flex flex-wrap mt-2">
                <li
                  v-for="(tag, tagIndex) in article.tags"
                  :key="tagIndex"
                  class="mr-2 mb-2 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-full"
                >
                  {{ tag }}
                </li>
              </ul> -->
            </RouterLink>
          </div>

          <!-- Pagination -->
          <ul class="pagination flex justify-center mt-8">
            <li v-for="link in paginationLinks" :key="link.label" class="mx-1">
              <button
                type="button"
                :class="[
                  'px-4 py-2 rounded-md',
                  {
                    'bg-blue-500 text-white': link.active === true,
                    'bg-gray-200 text-gray-700 hover:bg-gray-300':
                      link.active !== true,
                  },
                ]"
                @click="paginate(link.url)"
              >
                <span v-html="link.label"></span>
              </button>
            </li>
          </ul>
        </div>

        <!-- Sidebar -->
        <div class="w-full lg:w-1/4 px-4 mt-8 lg:mt-0">
          <div class="sidebar bg-white shadow-md rounded-lg p-4">
            <p class="text-gray-900 font-semibold mb-4">Popular Tags</p>
            <div class="tag-list flex flex-wrap">
              <a
                v-for="(tag, index) in popularTags"
                :key="index"
                href=""
                class="mr-2 mb-2 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-full hover:bg-blue-500 hover:text-white"
              >
                {{ tag }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, capitalize } from "vue";
import apiClient from "@/services/AxiosInstance";
import { isAuthenticated } from "@/services/auth.js";

const userIsAuthenticated = ref(false);
const selectedTab = ref("global");

const articleList = ref("list");
const articles = ref([]);
const fetchArticlesPaginationData = ref({});
const paginationLinks = ref([]);

const popularTags = ref([
  "programming",
  "javascript",
  "emberjs",
  "angularjs",
  "react",
  "mean",
  "node",
  "rails",
]);

const totalPages = ref([1, 2]);
const currentPage = 1;

async function getFollowedFeed() {
  selectedTab.value = "followed";
  try {
    const response = await apiClient.get(`/articles/feed?page=1&limit=2`);

    console.log(response);

    if (response.status === 200 && response.data) {
      const { current_page, last_page, links } = response.data;
      articles.value = response.data.data;
      fetchArticlesPaginationData.value = response.data;

      // First Page
      if (current_page === 1) {
        paginationLinks.value = links.slice(current_page, current_page + 3);
      }
      // Last Page
      else if (current_page === last_page) {
        paginationLinks.value = links.slice(current_page - 2, current_page + 1);
      }
      // Middle Pages
      else {
        paginationLinks.value = links.slice(current_page - 1, current_page + 2);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function getGlobalFeed() {
  selectedTab.value = "global";
  try {
    const response = await apiClient.get("/articles?page=1&limit=2");

    if (response.status === 200 && response.data) {
      const { current_page, last_page, links } = response.data;
      articles.value = response.data.data;
      fetchArticlesPaginationData.value = response.data;

      // First Page
      if (current_page === 1) {
        paginationLinks.value = links.slice(current_page, current_page + 3);
      }
      // Last Page
      else if (current_page === last_page) {
        paginationLinks.value = links.slice(current_page - 2, current_page + 1);
      }
      // Middle Pages
      else {
        paginationLinks.value = links.slice(current_page - 1, current_page + 2);
      }
    }

    console.log(response);
    console.log(paginationLinks.value);
  } catch (error) {
    console.error(error);
  }
}

async function paginate(url) {
  try {
    const response = await apiClient.get(`${url}&limit=2`);

    if (response.status === 200 && response.data) {
      const { current_page, last_page, links } = response.data;
      articles.value = response.data.data;
      fetchArticlesPaginationData.value = response.data;

      // First Page
      if (current_page === 1) {
        paginationLinks.value = links.slice(current_page, current_page + 3);
      }
      // Last Page
      else if (current_page === last_page) {
        paginationLinks.value = links.slice(current_page - 2, current_page + 1);
      }
      // Middle Pages
      else {
        paginationLinks.value = links.slice(current_page - 1, current_page + 2);
      }
    }

    console.log(response);
    console.log(paginationLinks.value);
  } catch (error) {
    console.error(error);
  }
}

//Helper function

//Text

function capitalizeFirstLetter(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

//Dates
function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

onMounted(async () => {
  console.log("On mounted");
  userIsAuthenticated.value = await isAuthenticated();
  console.log(userIsAuthenticated.value);
  await getGlobalFeed();
});
</script>
