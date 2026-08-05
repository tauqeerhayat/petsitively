<template>
  <NuxtLayout>
    <NuxtPage
      :transition="{
        name: 'page',
        mode: 'out-in',
      }"
    />
  </NuxtLayout>
  <ClientOnly>
    <ChatWidget v-if="showChat" />
  </ClientOnly>
</template>

<script setup>
const route = useRoute()
const showChat = computed(() => !route.path.startsWith('/admin'))
</script>
