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
import type { Widget } from '@/core/types'
import { useResourceManagerContext } from '@/composables/resource-manager'

const emit = defineEmits(['change-widget', 'delete'])

defineProps<{
  selectedWidget: Widget
  widgets: Widget[]
}>()

const { namedNode } = n3.DataFactory

const { isEditing } = useResourceManagerContext()
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
            <span>Widget</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                :model-value="selectedWidget.term.value"
                @update:model-value="emit('change-widget', namedNode($event))"
              >
                <DropdownMenuRadioItem
                  v-for="widget in widgets"
                  :key="widget.term.value"
                  :value="widget.term.value"
                >
                  <span>{{ widget.term.value.split('#').at(-1)?.split('/').at(-1) }}</span>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <template v-if="isEditing">
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="emit('delete')">
            <span>Delete</span>
          </DropdownMenuItem>
        </template>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
