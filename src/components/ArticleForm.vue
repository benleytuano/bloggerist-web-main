<template>
  <div class="min-h-screen bg-gray-100 flex justify-center items-center">
    <div class="bg-white shadow-md rounded-lg p-8 w-full max-w-3xl">
      <div class="mb-6">
        <!-- <ul class="list-disc list-inside text-red-500">
          <li>That title is required</li>
        </ul> -->
      </div>

      <form @submit.prevent="submitArticle">
        <fieldset>
          <div class="mb-4">
            <input
              v-model="formData.title"
              type="text"
              placeholder="Article Title"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>
          <div class="mb-4">
            <input
              v-model="formData.description"
              type="text"
              placeholder="What's this article about?"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>
          <div class="mb-4">
            <textarea
              v-model="formData.body"
              rows="8"
              placeholder="Write your article (in markdown)"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-200 resize-none"
            ></textarea>
          </div>
          <div class="mb-4">
            <input
              type="text"
              placeholder="Enter tags"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            />
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                class="inline-flex items-center bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full"
              >
                <i class="ion-close-round mr-2"></i> tag
              </span>
            </div>
          </div>
          <button
            type="submit"
            class="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            {{ props.buttonText }}
          </button>
        </fieldset>
      </form>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  formData: Object,
  buttonText: String,
});
const emit = defineEmits(["submit"]);

function submitArticle() {
  emit("submit");
}
</script>
