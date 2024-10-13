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
import { provideVocPubMachine } from '@/components/vocpub/composables/vocpub-machine'
import CreateConceptDialog from '@/components/vocpub/CreateConceptDialog.vue'

const toast = useToast()
const router = useRouter()
const { shui, reset, addQuads, removeQuads } = useShui()

const machine = getMachine(shui, reset, addQuads, removeQuads, router, toast)
const { snapshot, send } = useMachine(machine)
provideVocPubMachine(snapshot, send)

const data = computed(() => snapshot.value.context)
const filename = ref<string | null>(null)

watch(
  () => data.value.fileHandle,
  async (newFileHandle) => {
    if (newFileHandle) {
      const file = await newFileHandle.getFile()
      filename.value = file.name
    } else {
      filename.value = null
    }
  }
)

const menubarItems = computed(() => {
  let projectItems: MenuItem[] = [
    {
      label: 'New',
      icon: 'pi pi-folder-plus',
      command: (e: MenuItemCommandEvent) => send({ type: 'editor.menu.new.click' })
    }
  ]

  if (snapshot.value.matches('opened') || snapshot.value.matches('openedAsNew')) {
    if (snapshot.value.matches('opened')) {
      projectItems = projectItems.concat([
        {
          label: 'Save',
          icon: 'pi pi-save',
          command: (e: MenuItemCommandEvent) => send({ type: 'editor.menu.save.click' })
        }
      ])
    }
    projectItems = projectItems.concat([
      {
        label: 'Save as',
        icon: 'pi pi-save',
        command: (e: MenuItemCommandEvent) => send({ type: 'editor.menu.save-as.click' })
      },
      {
        label: 'Close',
        icon: 'pi pi-folder',
        command: (e: MenuItemCommandEvent) => send({ type: 'editor.menu.close.click' })
      }
    ])
  } else {
    projectItems = projectItems.concat([
      {
        label: 'Open',
        icon: 'pi pi-folder-open',
        command: (e: MenuItemCommandEvent) => send({ type: 'editor.menu.open.click' })
      }
    ])
  }

  let items: MenuItem[] = [
    {
      label: 'Project',
      icon: 'pi pi-file',
      items: projectItems
    }
  ]

  if (
    snapshot.value.matches('opened') ||
    snapshot.value.matches('openedAsNew') ||
    snapshot.value.matches('creatingConcept')
  ) {
    items = items.concat([
      {
        label: 'Create concept',
        icon: 'pi pi-plus',
        command: (e: MenuItemCommandEvent) => send({ type: 'editor.menu.create-concept.click' })
      }
    ])
  }

  return items
})
</script>

<template>
  <div class="space-y-1 max-w-[120rem]">
    <Menubar :model="menubarItems">
      <template v-slot:end>
        <span v-if="filename" class="pr-4">
          {{ filename }}
        </span>
      </template>
    </Menubar>

    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>

    <CreateConceptDialog />
    <Toast />
  </div>
</template>
