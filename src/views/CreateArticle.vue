<template>
  <div class="h-full">
    <div class="mx-auto max-w-3xl h-full px-4 md:px-6">
      <div class="flex h-full items-start md:items-center py-6">
        <div class="w-full">
          <header class="mb-6">
            <h1 class="text-lg font-semibold text-gray-900">Create Article</h1>
            <p class="mt-1 text-sm text-gray-600">
              Write a short description and your article body below.
            </p>
          </header>

          <ArticleForm
            :initial="formData"
            buttonText="Publish Article"
            @created="onCreated"
            @error="onErrorFromForm"
            ref="articleForm"
          />
        </div>
      </div>
    </div>

    <!-- Minimal toast (top-right) -->
    <div
      v-if="toast.visible"
      :class="[
        'fixed right-4 top-4 z-50 flex w-full max-w-xs items-center gap-3 rounded-lg border px-3 py-2 text-sm shadow',
        toast.type === 'success'
          ? 'border-green-200 bg-white text-gray-700'
          : 'border-red-200 bg-white text-gray-700',
      ]"
      role="status"
    >
      <div
        :class="[
          'inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
          toast.type === 'success'
            ? 'bg-green-100 text-green-600'
            : 'bg-red-100 text-red-600',
        ]"
      >
        <svg
          v-if="toast.type === 'success'"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16Zm3.707-9.293a1 1 0 10-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4Z"
          />
        </svg>
        <svg
          v-else
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2L8 8m6 6l2 2M6 6l12 12"
          />
        </svg>
      </div>

      <div class="flex-1">
        {{ toast.message }}
      </div>

      <button
        type="button"
        class="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-50"
        @click="hideToast"
        aria-label="Close"
      >
        <svg class="h-3 w-3" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M1 1l12 12M13 1L1 13"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import ArticleForm from "@/components/ArticleForm.vue";

const router = useRouter();
const articleForm = ref(null);

const formData = reactive({
  title: "",
  description: "",
  body: "",
  tagString: "",
});

// toast state
const toast = reactive({
  visible: false,
  message: "",
  type: "success", // 'success' | 'error'
  timeoutId: null,
});

function showToast(message, type = "success", autoHide = true) {
  toast.message = message;
  toast.type = type;
  toast.visible = true;
  if (toast.timeoutId) {
    clearTimeout(toast.timeoutId);
  }
  if (autoHide) {
    toast.timeoutId = setTimeout(() => {
      hideToast();
    }, 3000);
  }
}

function hideToast() {
  toast.visible = false;
  toast.message = "";
  toast.type = "success";
  if (toast.timeoutId) {
    clearTimeout(toast.timeoutId);
    toast.timeoutId = null;
  }
}

// Called when ArticleForm successfully emits the created article object
async function onCreated(article) {
  showToast("Article published — redirecting...", "success", false);

  const slug = article?.slug;
  if (slug) {
    setTimeout(() => {
      hideToast();
      router.push({ name: "articles", params: { slug } }).catch(() => {
        router.push(`/articles/${slug}`).catch(() => {});
      });
    }, 700);
  } else {
    showToast("Article created but no slug returned.", "error");
  }
}

// Called when ArticleForm emits an error string
function onErrorFromForm(message) {
  showToast(message || "Failed to create article.", "error", true);
}
</script>
