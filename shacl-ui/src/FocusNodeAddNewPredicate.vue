<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const emit = defineEmits(['add-new-predicate'])

const property = ref('')
const open = ref(false)
const error = ref('')

function reset() {
  property.value = ''
}

function handleAdd() {
  if (!property.value.startsWith('http') && !property.value.startsWith('urn')) {
    error.value = 'Invalid property IRI'
    return
  }

  emit('add-new-predicate', property.value)
  reset()
  open.value = false
  error.value = ''
}

watch(open, (value) => {
  if (!value) {
    reset()
    error.value = ''
  }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button variant="secondary"> Add property </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add property</DialogTitle>
        <DialogDescription> Enter the IRI of the new property </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="property" class="text-right"> Property </Label>
          <Input
            id="property"
            v-model="property"
            class="col-span-3"
            :class="{ 'border-red-500': error }"
          />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <div></div>
          <p v-if="error" class="text-red-500 text-xs col-span-3">{{ error }}</p>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" @click="handleAdd"> Add property </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
