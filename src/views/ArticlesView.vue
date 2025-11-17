<template>
  <div>
    <div v-if="isLoading" class="min-h-[40vh] flex items-center justify-center">
      <div class="text-gray-500">Loading...</div>
    </div>

    <div v-else class="bg-white">
      <div class="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <!-- Title + description -->
        <header class="mb-6">
          <h1
            class="text-3xl md:text-4xl font-extrabold leading-tight text-gray-900"
          >
            {{ articlesData.title }}
          </h1>
          <p v-if="articlesData.description" class="mt-3 text-gray-600">
            {{ articlesData.description }}
          </p>

          <!-- author row with thin top & bottom border -->
          <div
            class="mt-6 border-t border-b border-gray-100 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div class="flex items-center gap-4">
              <router-link
                :to="`/profile/${articlesData.user?.username || ''}`"
                class="flex items-center gap-3"
              >
                <div
                  class="h-12 w-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-sm font-medium text-gray-700"
                >
                  <img
                    v-if="articlesData.user?.profile_image_url"
                    :src="articlesData.user.profile_image_url"
                    alt="author"
                    class="h-full w-full object-cover"
                  />
                  <span v-else>{{ authorInitial }}</span>
                </div>

                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-900">{{
                    articlesData.user?.username || "Unknown"
                  }}</span>
                  <span class="text-xs text-gray-500">
                    {{ formattedDate }} · {{ readMinutes }} min read
                  </span>
                </div>
              </router-link>
            </div>

            <!-- Actions: creator kebab OR reader follow + favorite icon -->
            <div class="flex items-center gap-3">
              <!-- Creator: kebab menu -->
              <div
                v-if="articlesData && currentUser?.id === articlesData.user_id"
                class="relative"
                ref="kebabContainer"
              >
                <button
                  @click="toggleCreatorMenu"
                  aria-expanded="false"
                  class="p-2 rounded-full hover:bg-gray-100"
                >
                  <!-- kebab icon -->
                  <svg
                    class="w-5 h-5 text-gray-600"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <circle cx="5" cy="12" r="1.8" />
                    <circle cx="12" cy="12" r="1.8" />
                    <circle cx="19" cy="12" r="1.8" />
                  </svg>
                </button>

                <div
                  v-if="creatorMenuOpen"
                  ref="creatorMenu"
                  class="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded shadow-sm z-30"
                >
                  <RouterLink
                    :to="`/edit-article/${articlesData.slug}`"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >Edit</RouterLink
                  >
                  <button
                    @click="onDeleteArticle"
                    class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <!-- Reader controls -->
              <div v-else class="flex items-center gap-3">
                <button
                  @click="isFollowed ? unfollowUser() : followerUser()"
                  class="px-3 py-1.5 border rounded-full text-sm text-gray-700 hover:bg-sky-50"
                >
                  {{ isFollowed ? "Following" : "Follow" }}
                </button>

                <button
                  @click="isFavorite ? unfavoritePost() : favoritePost()"
                  class="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm text-gray-700 hover:bg-sky-50"
                  aria-label="Favorite"
                >
                  <!-- heart icon -->
                  <svg
                    class="w-4 h-4 text-red-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M12 21s-7-4.5-9-8a5 5 0 0110-2 5 5 0 0110 2c-2 3.5-9 8-9 8z"
                    />
                  </svg>
                  <span class="text-sm">{{
                    articlesData?.favorited_by_users_count ?? 0
                  }}</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- article body (markdown -> html) -->
        <article class="prose lg:prose-lg max-w-none text-gray-800">
          <div v-if="articlesData.body" v-html="renderedBody"></div>
          <div v-else class="text-gray-700">
            {{ articlesData.body }}
          </div>

          <!-- tags -->
          <div v-if="articlesData.tagList?.length" class="mt-6">
            <ul class="flex flex-wrap gap-2">
              <li
                v-for="(tag, idx) in articlesData.tagList"
                :key="idx"
                class="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700"
              >
                {{ tag }}
              </li>
            </ul>
          </div>
        </article>

        <hr class="my-8" />

        <!-- Comments -->
        <section class="comments-section">
          <!-- Composer header (avatar + name on top) with thin border top/bottom -->
          <div class="mb-6 border-t border-b border-gray-100 py-4">
            <div class="flex items-center gap-3 mb-3">
              <div>
                <img
                  v-if="currentUser?.profile_image_url"
                  :src="currentUser.profile_image_url"
                  alt="avatar"
                  class="w-10 h-10 rounded-full object-cover"
                />
                <div
                  v-else
                  class="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-medium"
                >
                  {{ capitalizeFirstLetter(currentUser.username?.[0] || "U") }}
                </div>
              </div>
              <div>
                <div class="text-sm font-semibold text-gray-900">
                  {{ currentUser.username || "You" }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ readMinutes }} min read
                </div>
              </div>
            </div>

            <div>
              <div class="bg-gray-50 border border-gray-100 rounded-md p-4">
                <textarea
                  v-model="commentText"
                  ref="commentRef"
                  placeholder="What are your thoughts?"
                  class="w-full min-h-[96px] bg-transparent placeholder-gray-400 resize-y outline-none text-gray-800"
                ></textarea>

                <div class="mt-3 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <button
                      @click="formatSelection('**')"
                      type="button"
                      class="text-sm font-semibold text-gray-700"
                    >
                      B
                    </button>
                    <button
                      @click="formatSelection('*')"
                      type="button"
                      class="text-sm italic text-gray-700"
                    >
                      i
                    </button>
                  </div>

                  <div class="flex items-center gap-3">
                    <button
                      v-if="commentText"
                      @click="clearCommentForm"
                      class="text-sm text-gray-600 hover:underline"
                    >
                      Cancel
                    </button>
                    <button
                      :disabled="!commentText.trim()"
                      @click="postComment"
                      class="px-4 py-1.5 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Respond
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Comments list -->
          <div class="space-y-4">
            <div
              v-for="comment in commentsList"
              :key="comment.id"
              class="border-t pt-4"
            >
              <div class="flex gap-4">
                <div>
                  <router-link :to="`/profile/${comment.user?.username}`">
                    <img
                      v-if="comment.user?.profile_image_url"
                      :src="comment.user.profile_image_url"
                      alt=""
                      class="w-10 h-10 rounded-full object-cover"
                    />
                    <div
                      v-else
                      class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700"
                    >
                      {{
                        capitalizeFirstLetter(
                          comment.user?.username?.[0] || "U"
                        )
                      }}
                    </div>
                  </router-link>
                </div>

                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <div>
                      <router-link
                        :to="`/profile/${comment.user?.username}`"
                        class="font-semibold text-sm text-gray-900"
                        >{{ comment.user?.username }}</router-link
                      >
                      <div class="text-xs text-gray-500">
                        {{ comment.formatted_date }}
                      </div>
                    </div>

                    <div class="flex items-center gap-3">
                      <button
                        v-if="comment.user_id === currentUser.id"
                        @click="deleteComment(comment.id)"
                        class="text-red-500"
                      >
                        <!-- trash icon -->
                        <svg
                          class="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            d="M3 6h18M8 6v14a2 2 0 002 2h4a2 2 0 002-2V6M10 6V4a2 2 0 012-2h0a2 2 0 012 2v2"
                            stroke-width="1.2"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <p class="mt-2 text-gray-700 leading-relaxed">
                    {{ comment.body }}
                  </p>

                  <div
                    class="mt-3 flex items-center gap-4 text-sm text-gray-500"
                  >
                    <div class="flex items-center gap-1">
                      <!-- clap placeholder -->
                      <svg
                        class="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          d="M12 21s-7-4.5-9-8a5 5 0 0110-2 5 5 0 0110 2c-2 3.5-9 8-9 8z"
                          stroke-width="1.2"
                        />
                      </svg>
                      <span>{{ comment.claps ?? 0 }}</span>
                    </div>

                    <button class="text-gray-500 hover:underline">Reply</button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="!commentsList.length" class="text-gray-500">
              No responses yet — be the first to respond.
            </div>
          </div>
        </section>

        <div v-if="page > 0" class="mt-6 text-center text-sm text-gray-500">
          Showing {{ commentsList.length }} responses
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import apiClient from "@/services/AxiosInstance";
import Toast from "@/services/toast";
import Swal from "sweetalert2";
import { marked } from "marked";
import DOMPurify from "dompurify";

const route = useRoute();
const router = useRouter();

/* data */
const articlesData = ref({});
const currentUser = ref({});
const isLoading = ref(true);

const commentText = ref("");
const commentsList = ref([]);
const page = ref(0);

const isFollowed = ref(false);
const isFavorite = ref(false);

const creatorMenuOpen = ref(false);
const kebabContainer = ref(null);
const creatorMenu = ref(null);

/* computed helpers */
const authorInitial = computed(() => {
  const username = articlesData.value?.user?.username || "";
  return username ? username.charAt(0).toUpperCase() : "A";
});

const formattedDate = computed(() => {
  const d = articlesData.value?.created_at;
  if (!d) return "";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return d;
  }
});

const readMinutes = computed(() => {
  const text = String(articlesData.value?.body || "");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
});

/* markdown -> sanitized html */
const renderedBody = computed(() => {
  try {
    const md = articlesData.value?.body || "";
    const html = marked.parse(md);
    return DOMPurify.sanitize(html);
  } catch {
    return DOMPurify.sanitize(String(articlesData.value?.body || ""));
  }
});

/* API calls (kept behavior) */
async function getArticleData() {
  try {
    const slug = route.params.slug;
    const response = await apiClient.get(`/articles/${slug}`);
    if (response.status === 200 && response.data) {
      articlesData.value = response.data;
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

async function getCommentsList() {
  try {
    const nextPage = page.value + 1;
    const response = await apiClient.get(
      `/articles/${articlesData.value.slug}/comments?page=${nextPage}&limit=3`
    );
    if (response.status === 200) {
      if (response.data.data?.length > 0) {
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

async function postComment() {
  if (!commentText.value.trim()) return;
  try {
    const response = await apiClient.post(
      `/articles/${articlesData.value.slug}/comments`,
      { body: commentText.value }
    );
    if (response.status === 200) {
      clearCommentForm();
      commentsList.value = [];
      page.value = 0;
      await getCommentsList();
      await Toast.fire({ icon: "success", title: "Posted" });
    }
  } catch (error) {
    console.log(error);
    await Toast.fire({ icon: "error", title: "Could not post comment" });
  }
}

async function deleteComment(commentId) {
  try {
    const res = await apiClient.delete(
      `articles/${articlesData.value.slug}/comments/${commentId}`
    );
    if (res.status === 200) {
      commentsList.value = [];
      page.value = 0;
      await getCommentsList();
      await Toast.fire({
        icon: "success",
        title: res.data.message || "Deleted",
      });
    }
  } catch (error) {
    console.log(error);
  }
}

async function deleteArticle() {
  try {
    const res = await apiClient.delete(`/articles/${articlesData.value.slug}`);
    if (res.status === 200) {
      await Toast.fire({ icon: "success", title: "Article deleted" });
      // Optionally navigate away
    }
  } catch (error) {
    console.log(error);
  }
}

/* favorite / follow */
async function favoritePost() {
  try {
    const response = await apiClient.post(
      `articles/${articlesData.value.slug}/favorite`
    );
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
    if (response.status === 200) {
      isFollowed.value = response.data.isFollowed;
    }
  } catch (error) {
    console.log(error);
  }
}

/* helpers */
function capitalizeFirstLetter(text = "") {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}
function clearCommentForm() {
  commentText.value = "";
}

/* formatting helper for composer (insert markdown bold/italic) */
function formatSelection(marker) {
  const el =
    document.querySelector("textarea[ref='commentRef']") ||
    document.querySelector("textarea");
  const start = el?.selectionStart ?? null;
  const end = el?.selectionEnd ?? null;
  if (start === null) {
    commentText.value = marker + marker + commentText.value;
    return;
  }
  const before = commentText.value.slice(0, start);
  const selected = commentText.value.slice(start, end);
  const after = commentText.value.slice(end);
  if (selected.startsWith(marker) && selected.endsWith(marker)) {
    const unwrapped = selected.slice(
      marker.length,
      selected.length - marker.length
    );
    commentText.value = before + unwrapped + after;
    setTimeout(() => {
      if (el) el.selectionStart = before.length;
    }, 0);
    return;
  }
  commentText.value = before + marker + selected + marker + after;
  setTimeout(() => {
    if (el) {
      el.selectionStart = start + marker.length;
      el.selectionEnd = end + marker.length;
      el.focus();
    }
  }, 0);
}

async function onDeleteArticle() {
  // Show clean, minimalist confirmation dialog
  const result = await Swal.fire({
    text: "Delete this article? This action cannot be undone.",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#e5e7eb",
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    buttonsStyling: true,
    reverseButtons: true,
    customClass: {
      popup: "rounded-lg shadow-lg",
      confirmButton: "px-4 py-2 text-sm font-medium rounded-md",
      cancelButton: "px-4 py-2 text-sm font-medium text-gray-700 rounded-md",
    },
    // No timer, no icon, clean and minimal
    showClass: {
      popup: "swal2-show",
      backdrop: "swal2-backdrop-show",
    },
    hideClass: {
      popup: "swal2-hide",
      backdrop: "swal2-backdrop-hide",
    },
  });

  // If user cancels, exit early
  if (!result.isConfirmed) return;

  try {
    const response = await apiClient.delete(
      `/articles/${articlesData.value.slug}`
    );

    if (response.status === 200) {
      await Toast.fire({
        icon: "success",
        title: "Article deleted",
      });

      // Close the kebab menu
      closeCreatorMenu();

      // Navigate back to home or profile
      router.push("/");
    }
  } catch (error) {
    console.error("Delete article error:", error);

    // Handle different error scenarios
    if (error.response?.status === 403) {
      await Toast.fire({
        icon: "error",
        title: "Not authorized to delete this article",
      });
    } else if (error.response?.status === 404) {
      await Toast.fire({
        icon: "error",
        title: "Article not found",
      });
    } else {
      await Toast.fire({
        icon: "error",
        title: "Failed to delete article",
      });
    }
  }
}

/* kebab menu behavior: toggle + close on outside click / ESC */
function toggleCreatorMenu() {
  creatorMenuOpen.value = !creatorMenuOpen.value;
}
function closeCreatorMenu() {
  creatorMenuOpen.value = false;
}

function handleDocumentClick(e) {
  const menuEl = creatorMenu.value;
  const container = kebabContainer.value;
  if (!menuEl || !container) return;
  if (menuEl.contains(e.target) || container.contains(e.target)) {
    // clicked inside - do nothing
    return;
  }
  // clicked outside
  closeCreatorMenu();
}

function handleKeyDown(e) {
  if (e.key === "Escape") closeCreatorMenu();
}

/* infinite scroll debounce */
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

const handleScroll = debounce(async () => {
  const bottom =
    Math.ceil(window.innerHeight + window.scrollY) >=
    document.documentElement.scrollHeight - 200;
  if (bottom) {
    await getCommentsList();
  }
}, 400);

/* lifecycle */
onMounted(async () => {
  await getArticleData();
  await getCurrentUser();
  await getCommentsList();
  await checkIsFavorite();
  await checkIsFollowed();

  isLoading.value = false;

  window.addEventListener("scroll", handleScroll);
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
  document.removeEventListener("click", handleDocumentClick);
  document.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped>
/* small tweaks */
.prose img {
  border-radius: 8px;
  margin: 0.75rem 0;
}
</style>
