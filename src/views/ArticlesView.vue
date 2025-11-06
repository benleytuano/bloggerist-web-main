<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else class="article-page">
    <div class="banner bg-[#3b82f6] text-white py-8">
      <div class="container mx-auto px-4">
        <h1 class="text-3xl font-bold">{{ articlesData.title }}</h1>

        <div class="article-meta flex items-center mt-4 space-x-4">
          <router-link to="/profile/eric-simons">
            <img
              v-if="articlesData.user.image"
              :src="articlesData.user.profile_image_url"
              alt=""
              class="w-12 h-12 rounded-full"
            />
            <div
              v-else
              class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-white"
            >
              {{ capitalizeFirstLetter(articlesData.user.username[0]) }}
            </div>
          </router-link>
          <div class="info flex flex-col">
            <router-link
              to="/profile/eric-simons"
              class="author text-lg font-semibold"
              >{{ articlesData.user.username }}</router-link
            >
            <span class="date text-gray-300">January 20th</span>
          </div>
          <div
            v-if="articlesData && currentUser.id === articlesData.user_id"
            class="flex space-x-2"
          >
            <!-- <button
              class="btn btn-sm btn-outline-secondary border border-blue-400 px-4 py-2 rounded hover:bg-blue-600"
            >
              <i class="ion-edit"></i> Edit Article
            </button> -->
            <RouterLink
              :to="`/edit-article/${articlesData.slug}`"
              class="btn btn-sm btn-outline-secondary border border-blue-400 px-4 py-2 rounded hover:bg-blue-600"
            >
              <p>Edit Article</p>
            </RouterLink>
            <button
              @click="deleteArticle"
              class="btn btn-sm btn-outline-danger border border-red-500 px-4 py-2 rounded hover:bg-red-500 hover:text-white"
            >
              <i class="ion-trash-a"></i> Delete Article
            </button>
          </div>
          <div v-else class="flex space-x-2">
            <button
              v-if="isFollowed"
              class="btn btn-sm btn-outline-secondary border border-gray-300 px-4 py-2 rounded hover:bg-sky-500"
              @click="unfollowUser"
            >
              <i class="ion-plus-round"></i>
              <span class="ml-1"
                >Unfollow {{ articlesData.user.username }}
                <span class="counter text-gray-300">(10)</span></span
              >
            </button>

            <button
              v-else
              class="btn btn-sm btn-outline-secondary border border-gray-300 px-4 py-2 rounded hover:bg-sky-500"
              @click="followerUser"
            >
              <i class="ion-plus-round"></i>
              <span class="ml-1"
                >Follow {{ articlesData.user.username }}
                <span class="counter text-gray-300">(10)</span></span
              >
            </button>
            <button
              v-if="isFavorite"
              class="btn btn-sm btn-outline-primary border border-blue-300 px-4 py-2 rounded hover:bg-sky-500 hover:text-white"
              @click="unfavoritePost"
            >
              <i class="ion-heart"></i>
              <span class="ml-1"
                >Unfavorite Post
                <span class="counter text-gray-300">(29)</span></span
              >
            </button>
            <button
              v-else
              class="btn btn-sm btn-outline-primary border border-blue-300 px-4 py-2 rounded hover:bg-sky-500 hover:text-white"
              @click="favoritePost"
            >
              <i class="ion-heart"></i>
              <span class="ml-1"
                >Favorite Post
                <span class="counter text-gray-300">(29)</span></span
              >
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <div class="article-content space-y-4">
        <p class="">
          {{ articlesData.description }}
        </p>
        <p class="text-gray-700">
          {{ articlesData.body }}
        </p>
        <ul class="tag-list flex space-x-2">
          <li class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
            realworld
          </li>
          <li class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
            implementations
          </li>
        </ul>
      </div>

      <hr class="my-8" />

      <div class="comments-section">
        <form
          class="card comment-form bg-white shadow-md rounded-md p-4 space-y-4"
          @submit.prevent="postComment"
        >
          <textarea
            v-model="commentText"
            class="form-control w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Write a comment..."
            rows="3"
          ></textarea>
          <div class="flex items-center justify-between">
            <img
              v-if="currentUser.image"
              :src="currentUser.profile_image_url"
              alt=""
              class="w-12 h-12 rounded-full"
            />
            <div
              v-else
              class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-white"
            >
              {{ capitalizeFirstLetter(currentUser.username[0]) }}
            </div>
            <button
              type="submit"
              class="btn btn-primary bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Post Comment
            </button>
          </div>
        </form>

        <!-- Comments Card -->

        <div
          v-for="comment in commentsList"
          class="card bg-white shadow-md rounded-md p-4 mt-4"
        >
          <p class="card-text text-gray-700">
            {{ comment.body }}
          </p>
          <div
            class="card-footer flex items-center justify-between mt-4 text-sm text-gray-500"
          >
            <div class="flex items-center space-x-2">
              <router-link to="/profile/author">
                <img
                  v-if="comment.user.image"
                  :src="comment.user.profile_image_url"
                  alt=""
                  class="w-12 h-12 rounded-full"
                />
                <div
                  v-else
                  class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-white"
                >
                  {{ capitalizeFirstLetter(comment.user.username[0]) }}
                </div>
              </router-link>
              <router-link
                to="/profile/jacob-schmidt"
                class="comment-author font-semibold"
                >{{ comment.user.username }}</router-link
              >
            </div>
            <div class="flex flex-row items-center gap-2">
              <span class="date-posted">{{ comment.formatted_date }}</span>
              <button
                v-if="comment.user_id == currentUser.id"
                @click="deleteComment(comment.id)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6 text-red-500"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from "vue";
import { useRoute } from "vue-router";
import apiClient from "@/services/AxiosInstance";
import { isAuthenticated } from "@/services/auth.js";
import Toast from "@/services/toast";

const route = useRoute();
const articlesData = ref({});
const currentUser = ref({});

const isLoading = ref(true);

const commentText = ref("");
const commentsList = ref([]);
const page = ref(0);

const isFollowed = ref(false);
const isFavorite = ref(false);

async function getArticleData() {
  console.log(route);
  try {
    const slug = route.params.slug;
    const response = await apiClient.get(`/articles/${slug}`);

    console.log(response);

    if (response.status === 200 && response.data) {
      articlesData.value = response.data;
    }
  } catch (error) {
    console.error(error);
  }
}

async function getArticleComments() {
  try {
    const slug = route.params.slug;
    const response = await apiClient.get(`/articles/${slug}/comments`);

    console.log(response);

    if (response.status === 200 && response.data) {
      currentUser.value = response.data;
    }
  } catch (error) {
    console.error(error);
  }
}

async function getCurrentUser() {
  try {
    const response = await apiClient.get(`/user`);

    console.log(response);

    if (response.status === 200 && response.data) {
      currentUser.value = response.data;
    }
  } catch (error) {
    console.error(error);
  }
}

async function deleteArticle() {
  try {
    const response = await apiClient.delete(
      `/articles/${articlesData.value.slug}`
    );

    console.log(response);

    if (response.status === 200 && response.data) {
      currentUser.value = response.data;
    }
  } catch (error) {
    console.error(error);
  }
}

async function postComment() {
  try {
    const response = await apiClient.post(
      `/articles/${articlesData.value.slug}/comments`,
      {
        body: commentText.value,
      }
    );
    console.log(response);

    if (response.status === 200) {
      clearCommentForm();
      await getCommentsList();
      await Toast.fire({
        icon: "success",
        title: "Success",
      });
      // get the list of comments again
    }
  } catch (error) {
    console.log(error);
  }
}

async function deleteComment(commentId) {
  try {
    const res = await apiClient.delete(
      `articles/${articlesData.value.slug}/comments/${commentId}`
    );

    console.log(res);
    if (res.status === 200) {
      page.value = 0;
      commentsList.value = [];
      await getCommentsList();
      await Toast.fire({
        icon: "error",
        title: res.data.message,
      });
    }
  } catch (error) {
    console.log(error);
  }
}

async function getCommentsList() {
  console.log(page.value);
  try {
    const nextPage = page.value + 1;

    const response = await apiClient.get(
      `/articles/${articlesData.value.slug}/comments?page=${nextPage}&limit=3`
    );

    console.log(response);
    if (response.status === 200) {
      if (response.data.data.length > 0) {
        commentsList.value = [...commentsList.value, ...response.data.data];
        page.value = nextPage;
      } else {
        return;
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function favoritePost() {
  try {
    const response = await apiClient.post(
      `articles/${articlesData.value.slug}/favorite`
    );

    console.log(response);
    if (response.status === 200) {
      await checkIsFavorite();
    }
  } catch (error) {
    console.log(error);
  }
}

async function unfavoritePost() {
  try {
    const response = await apiClient.delete(
      `articles/${articlesData.value.slug}/favorite`
    );

    console.log(response);
    if (response.status === 200) {
      await checkIsFavorite();
    }
  } catch (error) {
    console.log(error);
  }
}

async function checkIsFavorite() {
  try {
    const res = await apiClient.get(
      `articles/${articlesData.value.slug}/isFavorite`
    );

    console.log(res);

    if (res.status === 200) {
      isFavorite.value = res.data.isFavorite;
    }
  } catch (error) {
    console.log(error);
  }
}

async function followerUser() {
  try {
    const response = await apiClient.post(
      `profiles/${articlesData.value.user.username}/follow`
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
      `profiles/${articlesData.value.user.username}/follow`
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
      `/profiles/${articlesData.value.user.id}/checkIsFollowed`
    );

    console.log(response);

    if (response.status === 200) {
      isFollowed.value = response.data.isFollowed;
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

function clearCommentForm() {
  commentText.value = "";
}

function debounce(func, delay) {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const handleScroll = debounce(async () => {
  const bottom =
    Math.ceil(window.innerHeight + window.scrollY) >=
    document.documentElement.scrollHeight - 200;
  if (bottom) {
    await getCommentsList();
    // setPage((prevPage) => {
    //   const nextPage = prevPage + 1;
    //   fetchData(nextPage);
    //   return nextPage;
    // });
  }
}, 400);

onMounted(async () => {
  await getArticleData();
  await getArticleComments();
  await getCurrentUser();
  await getCommentsList();
  await checkIsFavorite();
  await checkIsFollowed();
  isLoading.value = false;

  console.log(articlesData.value);

  window.addEventListener("scroll", handleScroll);

  // await getArticleComments();
  // await getCurrentUser();
});
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style>
