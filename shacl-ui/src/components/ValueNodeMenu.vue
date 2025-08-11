<script setup lang="ts">
import { Button } from '@/components/ui/button'
import n3 from 'n3'
import { Ellipsis } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DropdownMenuPortal } from 'reka-ui'
import type { Widget } from '@/core/widgets'

const emit = defineEmits(['change-editor-widget', 'delete'])

defineProps<{
  selectedEditorWidget: Widget
  editorWidgets: Widget[]
}>()

const { namedNode } = n3.DataFactory
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost">
        <Ellipsis />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent class="w-56">
      <DropdownMenuGroup>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span>Editor widget</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                :model-value="selectedEditorWidget.term.value"
                @update:model-value="emit('change-editor-widget', namedNode($event))"
              >
                <DropdownMenuRadioItem
                  v-for="editorWidget in editorWidgets"
                  :key="editorWidget.term.value"
                  :value="editorWidget.term.value"
                >
                  <span>{{
                    editorWidget.term.value.split('#').slice(-1)[0].split('/').slice(-1)[0]
                  }}</span>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        <DropdownMenuItem @click="emit('delete')">
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
