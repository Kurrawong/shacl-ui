<script setup lang="ts">
import n3 from 'n3'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus } from 'lucide-vue-next'

const emit = defineEmits(['add-new-value'])
const { namedNode, literal } = n3.DataFactory
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="secondary"><Plus /></Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent class="w-56">
      <DropdownMenuLabel>Add new value</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem @click="emit('add-new-value', namedNode(''))">
          <span>IRI</span>
        </DropdownMenuItem>
        <DropdownMenuItem @click="emit('add-new-value', literal(''))">
          <span>Literal</span>
        </DropdownMenuItem>
        <DropdownMenuItem @click="emit('add-new-value', literal('', ''))">
          <span>Literal with language</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
