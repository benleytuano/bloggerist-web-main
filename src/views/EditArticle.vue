<template>
  <div v-if="isLoading">Loading...</div>
  <ArticleForm
    v-else
    :formData="formData"
    buttonText="Update Article"
    @submit="onSubmit"
  />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/services/AxiosInstance";
import ArticleForm from "@/components/ArticleForm.vue";

const route = useRoute();
const router = useRouter();
const isLoading = ref(true);

const articleData = ref({});

const formData = ref({
  title: "",
  description: "",
  body: "",
  tagList: [],
});

async function onSubmit() {
  try {
    const response = await apiClient.put(
      `/articles/${articleData.value.slug}`,
      formData.value
    );
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}
async function getArticleData() {
  try {
    const slug = route.params.slug;
    const response = await apiClient.get(`/articles/${slug}`);
    if (response.status === 200 && response.data) {
      const { title, description, body, tagList } = response.data;
      articleData.value = response.data;
      formData.value = { title, description, body, tagList };
    }
  } catch (error) {
    console.error(error);
  }
}

onMounted(async () => {
  await getArticleData();
  isLoading.value = false;
});
</script>
