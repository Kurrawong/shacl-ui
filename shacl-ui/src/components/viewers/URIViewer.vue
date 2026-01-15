<script setup lang="ts">
import type { NamedNode } from '@rdfjs/types'
import { useNavigationContext } from '@/composables/navigation'

const props = defineProps<{
  term: NamedNode
}>()

const { navigate } = useNavigationContext()

function handleClick() {
  navigate(props.term)
}
</script>

<template>
  <code class="text-xs cursor-pointer hover:underline" @click="handleClick"
    >&lt;{{ term.value }}&gt;</code
  >
</template>
