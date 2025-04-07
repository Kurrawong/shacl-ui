<script setup lang="ts">
import { onMounted, ref } from 'vue'

const isSupported = ref(false)

onMounted(() => {
  if (window.showOpenFilePicker) {
    isSupported.value = true
    console.log(window.showOpenFilePicker)
  }
})
</script>

<template>
  <div class="p-4 space-y-2">
    <template v-if="isSupported">
      <h2 class="text-xl">Getting Started</h2>
      <p>Use the menu to open a VocPub vocabulary file on your filesystem.</p>
    </template>
    <template v-else>
      <h2 class="text-xl">VocPub is not supported in your browser.</h2>
      <p>
        VocPub requires the
        <a
          class="text-blue-500 hover:underline"
          href="https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker"
          >Window: showOpenFilePicker() method</a
        >, which is not supported in your browser.
      </p>
    </template>
  </div>
</template>
