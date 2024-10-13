<script setup lang="ts"></script>

<template>
  <div>
    <div class="flex flex-row h-[calc(100vh-7.4rem)]">
      <div class="overflow-y-auto w-[20rem]">
        <slot name="side-nav" />
      </div>

      <div class="flex-1 p-8 overflow-y-auto">
        <slot />
      </div>
    </div>

    <footer
      class="h-7 flex flex-row-reverse items-center border-t border-gray-200 bg-gray-100 px-3"
    >
      <div>Version: <code>dev</code></div>
    </footer>
  </div>
</template>
