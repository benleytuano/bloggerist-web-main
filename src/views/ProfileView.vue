<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else class="profile-page bg-gray-100 min-h-screen">
    <div class="user-info bg-white shadow-md py-8 px-6 mb-8">
      <div class="container mx-auto">
        <div class="flex flex-col items-center">
          <div>
            <img
              v-if="viewedUser.image"
              :src="viewedUser.profile_image_url"
              alt=""
              class="w-24 h-24 rounded-full mb-4"
            />
            <div
              v-else
              class="w-24 h-24 rounded-full mb-4 bg-gray-300 flex items-center justify-center font-bold text-white text-4xl"
            >
              {{ capitalizeFirstLetter(viewedUser.username[0]) }}
            </div>
          </div>
          <h4 class="text-xl font-semibold">{{ viewedUser.username }}</h4>
          <p class="text-gray-600 text-center mt-2 mb-4">
            {{ viewedUser.bio }}
          </p>
          <div class="flex gap-4">
            <div v-if="viewedUser.id !== currentUser.id">
              <button
                v-if="isFollowed"
                class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
                @click="unfollowUser"
              >
                <i class="ion-plus-round"></i>
                <span class="ml-2">Unfollow {{ viewedUser.username }}</span>
              </button>

              <button
                v-else
                class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
                @click="followerUser"
              >
                <i class="ion-plus-round"></i>
                <span class="ml-2">Follow {{ viewedUser.username }}</span>
              </button>
            </div>

            <router-link
              v-else
              to="/edit-profile"
              class="flex items-center px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
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
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>

              <span class="ml-2">Edit Profile Settings</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="feed-toggle mb-6">
      <ul class="flex border-b">
        <li class="mr-4">
          <button
            v-if="viewedUser.id === currentUser.id"
            @click="getMyArticles"
            class="inline-block px-4 py-2 text-gray-600"
            :class="{
              'border-b-2 border-blue-500 font-bold':
                selectedTab === 'myArticle',
              'hover:text-gray-900 border-b-2 border-transparent hover:border-gray-400':
                selectedTab !== 'myArticle',
            }"
          >
            My Articles
          </button>
          <button
            v-else
            @click=""
            class="inline-block px-4 py-2 text-gray-600"
            :class="{
              'border-b-2 border-blue-500 font-bold': selectedTab === 'viewed',
              'hover:text-gray-900 border-b-2 border-transparent hover:border-gray-400':
                selectedTab !== 'viewed',
            }"
          >
            Articles
          </button>
        </li>
        <li>
          <button
            v-if="viewedUser.id === currentUser.id"
            @click="getFavoriteArticles"
            class="inline-block px-4 py-2 text-gray-900"
            :class="{
              'border-b-2 border-blue-500 font-bold':
                selectedTab === 'favorite',
              'hover:text-gray-900 border-b-2 border-transparent hover:border-gray-400':
                selectedTab !== 'favorite',
            }"
          >
            Favorited Articles
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
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, viewDepthKey } from "vue-router";
import apiClient from "@/services/AxiosInstance";

const route = useRoute();
const isLoading = ref(true);
const viewedUser = ref();
const currentUser = ref({});
const articlesData = ref({});
const isFollowed = ref(false);

const articles = ref([]);
const selectedTab = ref("myArticle");
const fetchArticlesPaginationData = ref({});
const paginationLinks = ref([]);

async function getUserData() {
  const slug = route.params.slug;

  try {
    const response = await apiClient.get(`/profiles/${slug}`);

    console.log(response);

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

    // console.log(response);

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
    console.log(response);

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
    console.log(response);

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

    console.log(response);

    if (response.status === 200) {
      isFollowed.value = response.data.isFollowed;
    }
  } catch (error) {
    console.log(error);
  }
}

async function getMyArticles() {
  selectedTab.value = "myArticle";
  const authorId =
    viewedUser.value.id === currentUser.value.id
      ? currentUser.value.id
      : viewedUser.value.id;

  try {
    const response = await apiClient.get(
      `/articles?page=1&limit=1&author=${authorId}`
    );

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

async function paginate(url) {
  const authorId =
    viewedUser.value.id === currentUser.value.id
      ? currentUser.value.id
      : viewedUser.value.id;

  try {
    const response = await apiClient.get(`${url}&limit=1&author=${authorId}`);

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

async function getFavoriteArticles() {
  selectedTab.value = "favorite";
  try {
    const response = await apiClient.get(
      `/articles/favoriteFeed?page=1&limit=1`
    );

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
  await getUserData();
  await getCurrentUser();
  await checkIsFollowed();
  await getMyArticles();
  isLoading.value = false;

  console.log(viewedUser.value);
});
</script>
