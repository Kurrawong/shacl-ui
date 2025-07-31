<script setup lang="ts">
import { computed } from 'vue'
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
import TermSet from '@rdfjs/term-set'
import { rdf, xsd } from '@/core/namespaces'
import type { NamedNode } from '@rdfjs/types'

const emit = defineEmits(['add-new-value'])
const { namedNode, literal } = n3.DataFactory
const props = defineProps<{
  datatypes: TermSet<NamedNode>
}>()

// TODO: consider sh:nodeKind

const containsXsdString = computed(() => {
  return props.datatypes.has(xsd.string)
})

const containsXsdLangString = computed(() => {
  return props.datatypes.has(rdf.langString)
})

const otherXsdDatatypes = computed(() => {
  return Array.from(props.datatypes).filter((term) => !term.equals(xsd.string) && !term.equals(rdf.langString))
})
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
        <DropdownMenuItem v-for="datatype in otherXsdDatatypes" :key="datatype.value" @click="emit('add-new-value', literal('', datatype))">
          <span>{{ datatype.value.split('#').slice(-1)[0].split('/').slice(-1)[0] }}</span>
        </DropdownMenuItem>

        <DropdownMenuItem v-if="props.datatypes.size === 0" @click="emit('add-new-value', namedNode(''))">
          <span>IRI</span>
        </DropdownMenuItem>
        <DropdownMenuItem v-if="containsXsdString || props.datatypes.size === 0" @click="emit('add-new-value', literal(''))">
          <span>Literal string</span>
        </DropdownMenuItem>
        <DropdownMenuItem v-if="containsXsdLangString || props.datatypes.size === 0" @click="emit('add-new-value', literal('', ''))">
          <span>Literal with language</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
