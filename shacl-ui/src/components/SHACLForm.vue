<script setup lang="ts">
import { onMounted } from 'vue'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  focusNode: string
  dataGraph: string
  shapesGraph: string
  nodeShape: string | null
}>()

onMounted(() => {
  console.log('Hello')
})
</script>

<template>
  <Button @click="() => console.log('Clicked')">Hello</Button>
</template>
