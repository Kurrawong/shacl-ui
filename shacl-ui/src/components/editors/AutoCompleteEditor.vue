<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { NamedNode } from '@rdfjs/types'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import { Check, ChevronsUpDown, Search } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/combobox'
import { useAutocomplete } from '@/composables/autocomplete'
import { cn } from '@/core/utils'

const props = defineProps<{
  term: NamedNode
  propertyShape?: Shape
}>()
const emit = defineEmits(['update', 'blur'])

const { getAutocompleteTerms } = useAutocomplete(props.propertyShape)
const value = ref('')
const autocompleteTerms = computed(() => {
  const terms = getAutocompleteTerms(value.value)
  return terms.map((term) => ({
    value: term,
    label: term.value.split('#').at(-1)?.split('/').at(-1),
  }))
})
const selectedValue = ref({
  value: props.term,
  label: props.term.value.split('#').at(-1)?.split('/').at(-1),
})

watch(selectedValue, (newValue) => {
  if (newValue.value.value !== '') {
    emit('update', newValue.value)
    emit('blur')
  }
})
</script>

<template>
  <Combobox v-model="selectedValue" by="label">
    <ComboboxAnchor as-child>
      <ComboboxTrigger as-child>
        <Button variant="outline" class="justify-between">
          <div v-if="selectedValue.value.value !== ''">
            {{ selectedValue.label }}
          </div>
          <div v-else>--Select a value--</div>

          <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxList>
      <div class="relative w-full max-w-sm items-center">
        <ComboboxInput
          class="pl-9 focus-visible:ring-0 border-0 border-b rounded-none h-10"
          placeholder="Search term..."
          v-model="value"
        />
        <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
          <Search class="size-4 text-muted-foreground" />
        </span>
      </div>

      <ComboboxEmpty> No terms found. </ComboboxEmpty>

      <ComboboxGroup>
        <ComboboxItem
          v-for="autoCompleteTerm in autocompleteTerms"
          :key="autoCompleteTerm.value.value"
          :value="autoCompleteTerm"
        >
          {{ autoCompleteTerm.label }}

          <ComboboxItemIndicator>
            <Check :class="cn('ml-auto h-4 w-4')" />
          </ComboboxItemIndicator>
        </ComboboxItem>
      </ComboboxGroup>
    </ComboboxList>
  </Combobox>
</template>
