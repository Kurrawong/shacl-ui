<script setup lang="ts">
import { Button } from '@/components/ui/button'
import n3 from 'n3'
import { Ellipsis } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { EditorWidget } from '@/lib/widgets'

const emit = defineEmits(['change-editor-widget'])

defineProps<{
  selectedEditorWidget: EditorWidget
  editorWidgets: EditorWidget[]
}>()

const { namedNode } = n3.DataFactory
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline">
        <Ellipsis />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-56">
      <DropdownMenuLabel>Editor widget</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuRadioGroup
        :model-value="selectedEditorWidget.term.value"
        @update:model-value="emit('change-editor-widget', namedNode($event))"
      >
        <DropdownMenuRadioItem
          v-for="editorWidget in editorWidgets"
          :key="editorWidget.term.value"
          :value="editorWidget.term.value"
        >
          <span>{{ editorWidget.term.value.split('#').slice(-1)[0].split('/').slice(-1)[0] }}</span>
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
