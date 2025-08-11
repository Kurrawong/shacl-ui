<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Literal } from '@rdfjs/types'
import { DateFormatter, type DateValue, getLocalTimeZone, parseDate } from '@internationalized/date'
import { CalendarIcon } from 'lucide-vue-next'
import n3 from 'n3'
import { cn } from '@/core/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { xsd } from '@/core/namespaces'

const { literal } = n3.DataFactory

const emit = defineEmits(['update', 'blur'])

const props = defineProps<{
  term: Literal
}>()

const df = new DateFormatter('en-US', {
  dateStyle: 'long',
})

const value = ref<DateValue>(parseDate(props.term.value))

function emitUpdate() {
  if (value.value) {
    emit('update', literal(value.value.toString(), xsd.date))
    emit('blur')
  }
}

watch([value], () => emitUpdate())
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :class="
          cn('w-[280px] justify-start text-left font-normal', !value && 'text-muted-foreground')
        "
      >
        <CalendarIcon class="mr-2 h-4 w-4" />
        {{ value ? df.format(value.toDate(getLocalTimeZone())) : 'Pick a date' }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0">
      <Calendar v-model="value" initial-focus />
    </PopoverContent>
  </Popover>
</template>
