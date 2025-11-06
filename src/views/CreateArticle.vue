<template>
  <ArticleForm
    :formData="formData"
    buttonText="Publish Article"
    @submit="onSubmit"
  />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/services/AxiosInstance";
import ArticleForm from "@/components/ArticleForm.vue";

const formData = ref({
  title: "",
  description: "",
  body: "",
  tagList: [],
});

async function onSubmit() {
  try {
    const response = await apiClient.post("/articles", formData.value);
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}
</script>
