<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import Menubar from 'primevue/menubar'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import type { MenuItem, MenuItemCommandEvent } from 'primevue/menuitem'
import { useMachine } from '@xstate/vue'
import { getMachine } from '@/components/vocpub/state.js'
import { useRouter } from 'vue-router'
import { useShui } from '@/composables/shui.js'

const toast = useToast()
const router = useRouter()
const { shui } = useShui()
const machine = getMachine(shui, router, toast)
const { snapshot, send } = useMachine(machine)
const data = computed(() => snapshot.value.context)
const filename = ref<string | null>(null)
watch(
  () => data.value.fileHandle, // Watch for changes in fileHandle
  async (newFileHandle) => {
    if (newFileHandle) {
      const file = await newFileHandle.getFile()
      filename.value = file.name // Set the filename once fileHandle resolves
    } else {
      filename.value = null // Reset filename when no fileHandle is present
    }
  }
)

const menubarItems = computed(() => {
  const items: MenuItem[] = [
    {
      label: 'File',
      icon: 'pi pi-file',
      items: [
        snapshot.value.matches('opened')
          ? {
              label: 'Close',
              icon: 'pi pi-folder-close',
              command: (e: MenuItemCommandEvent) => send({ type: 'editor.close' })
            }
          : {
              label: 'Open',
              icon: 'pi pi-folder-open',
              command: (e: MenuItemCommandEvent) => send({ type: 'editor.menu.open.click' })
            }
      ]
    }
  ]
  if (snapshot.value.matches('opened')) {
    items.push({
      label: 'Save',
      icon: 'pi pi-save',
      command: (e: MenuItemCommandEvent) => send({ type: 'editor.menu.save.click' })
    })
  }
  return items
})
</script>

<template>
  <div class="space-y-1">
    <Menubar :model="menubarItems">
      <template v-slot:end>
        <span v-if="filename" class="pr-4">
          {{ filename }}
        </span>
      </template>
    </Menubar>

    <RouterView v-slot="{ Component }">
      <component :is="Component" :data="data.content" />
    </RouterView>
  </div>

  <Toast />
</template>
