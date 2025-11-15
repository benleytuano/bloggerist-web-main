<template>
  <form class="w-full" @submit.prevent="submit">
    <!-- Title -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700"
        >Article Title</label
      >
      <input
        v-model.trim="form.title"
        type="text"
        required
        class="mt-1 block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        placeholder="Article Title"
        :aria-invalid="!!errors.title"
      />
      <p v-if="errors.title" class="mt-1 text-xs text-red-600">
        {{ errors.title }}
      </p>
    </div>

    <!-- Description -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700"
        >What's this article about?</label
      >
      <div class="relative">
        <input
          v-model="form.description"
          type="text"
          maxlength="55"
          required
          class="mt-1 block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          placeholder="A short description (max 55 chars)"
          :aria-invalid="!!errors.description"
        />
        <span
          class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500"
        >
          {{ form.description.length }}/55
        </span>
      </div>
      <p v-if="errors.description" class="mt-1 text-xs text-red-600">
        {{ errors.description }}
      </p>
    </div>

    <!-- Body (textarea + preview) -->
    <div class="mb-4">
      <div class="flex items-center justify-between">
        <label class="block text-sm font-medium text-gray-700"
          >Write your article</label
        >
        <div class="text-xs text-gray-500">
          Paste from docs/web — it will keep formatting
        </div>
      </div>

      <textarea
        id="articleBody"
        ref="bodyRef"
        v-model="form.body"
        required
        @paste="onPaste"
        class="mt-1 block w-full h-48 resize-y rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        placeholder="Write your article... (you can paste formatted content)"
        :aria-invalid="!!errors.body"
      ></textarea>
      <p v-if="errors.body" class="mt-1 text-xs text-red-600">
        {{ errors.body }}
      </p>
      <p class="mt-1 text-xs text-gray-500">
        Tip: When you paste formatted content, it will be converted internally
        and shown in the preview below.
      </p>

      <!-- Live preview -->
      <div class="mt-4">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-medium text-gray-700">Preview</h4>
          <button
            type="button"
            class="text-xs text-blue-600 hover:underline"
            @click="togglePreview"
          >
            {{ showPreview ? "Hide" : "Show" }} preview
          </button>
        </div>

        <div
          v-if="showPreview"
          class="prose max-w-none rounded-md border border-gray-100 bg-white p-4"
        >
          <div v-html="renderedBody"></div>
        </div>
      </div>
    </div>

    <!-- Tags (simple input) -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700">Enter tags</label>
      <input
        v-model="form.tagString"
        type="text"
        class="mt-1 block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        placeholder="tag1, tag2, tag3 (not submitted server-side yet)"
      />
      <p class="mt-1 text-xs text-gray-500">
        Separate tags with commas. (Not processed server-side yet)
      </p>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-3">
      <button
        type="button"
        @click="resetForm"
        :disabled="loading"
        class="inline-flex h-10 items-center justify-center rounded-md border border-transparent bg-gray-100 px-4 text-sm text-gray-700 hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
      >
        Reset
      </button>

      <button
        type="submit"
        :disabled="loading"
        class="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          v-if="loading"
          class="mr-2 h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
          />
        </svg>
        {{ buttonText }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref, watch, computed } from "vue";
import TurndownService from "turndown";
import { marked } from "marked";
import DOMPurify from "dompurify";
import apiClient from "@/services/AxiosInstance";

const props = defineProps({
  initial: {
    type: Object,
    default: () => ({ title: "", description: "", body: "", tagString: "" }),
  },
  buttonText: { type: String, default: "Publish Article" },
  isEditing: { type: Boolean, default: false },
  articleSlug: { type: String, default: null },
});

const emit = defineEmits(["created", "error"]);

const turndownService = new TurndownService();

// local form state
const form = reactive({
  title: props.initial.title || "",
  description: props.initial.description || "",
  body: props.initial.body || "",
  tagString: props.initial.tagString || "",
});

const loading = ref(false);
const errors = reactive({});
const bodyRef = ref(null);

const showPreview = ref(true);

// sync if parent updates initial
watch(
  () => props.initial,
  (v) => {
    form.title = v.title || "";
    form.description = v.description || "";
    form.body = v.body || "";
    form.tagString = v.tagString || "";
  }
);

// rendered HTML for preview (safe)
const renderedBody = computed(() => {
  try {
    const html = marked.parse(form.body || "");
    return DOMPurify.sanitize(html);
  } catch {
    return DOMPurify.sanitize(String(form.body || ""));
  }
});

// helper to reset
function resetForm() {
  form.title = "";
  form.description = "";
  form.body = "";
  form.tagString = "";
  Object.keys(errors).forEach((k) => delete errors[k]);
}

// client-side validation
function validate() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (!form.title || !form.title.trim()) errors.title = "Title is required.";
  if (!form.description || !form.description.trim())
    errors.description = "Description is required.";
  else if (form.description.length > 55)
    errors.description = "Description must be 55 characters or less.";
  if (!form.body || !form.body.trim()) errors.body = "Body is required.";
  return Object.keys(errors).length === 0;
}

// insert text at caret (used for paste)
function insertAtCursor(text) {
  const el = bodyRef.value;
  if (!el) {
    form.body += text;
    return;
  }
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? start;
  const before = form.body.slice(0, start);
  const after = form.body.slice(end);
  form.body = before + text + after;
  // set caret after inserted text (next tick)
  setTimeout(() => {
    el.selectionStart = el.selectionEnd = start + text.length;
    el.focus();
  }, 0);
}

// paste handler: convert HTML -> Markdown when possible, insert markdown into textarea
function onPaste(e) {
  const clipboard = e.clipboardData || window.clipboardData;
  if (!clipboard) return;
  const html = clipboard.getData("text/html");
  const plain = clipboard.getData("text/plain");

  if (html) {
    e.preventDefault();
    try {
      const md = turndownService.turndown(html);
      insertAtCursor(md);
    } catch (err) {
      insertAtCursor(plain || "");
    }
  } else {
    // allow default paste for plain text
    // (it will update v-model automatically)
  }
}

function togglePreview() {
  showPreview.value = !showPreview.value;
}

// submit: post to /articles or put to /articles/{slug}
async function submit() {
  if (!validate()) return;
  loading.value = true;
  try {
    const payload = {
      title: form.title,
      description: form.description,
      body: form.body,
      // tags not submitted yet per requirement
    };

    // Use PUT if editing, POST if creating
    const method = props.isEditing ? "put" : "post";
    const url = props.isEditing
      ? `/articles/${props.articleSlug}`
      : "/articles";

    const res = await apiClient[method](url, payload);
    if (res && res.status >= 200 && res.status < 300) {
      emit("created", res.data);
      resetForm();
    } else {
      emit("error", "Unexpected server response.");
    }
  } catch (err) {
    const resp = err?.response?.data;
    if (resp && resp.errors) {
      Object.keys(resp.errors).forEach((field) => {
        errors[field] = resp.errors[field]?.[0] || "Invalid";
      });
    } else {
      const message = resp?.message || err?.message || "Submission failed.";
      emit("error", message);
    }
  } finally {
    loading.value = false;
  }
}
</script>
