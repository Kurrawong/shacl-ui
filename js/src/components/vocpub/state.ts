import { setup, fromPromise, assign } from 'xstate'
import { type ToastServiceMethods } from 'primevue/toastservice'
import { type Router } from 'vue-router'
import { type Ref } from 'vue'
import { Shui } from '@/shui.js'
import { DATA_GRAPH } from '@/components/vocpub/constants.js'

type Context = { content: string; fileHandle: FileSystemFileHandle | null }

export function getMachine(shui: Ref<Shui>, router: Router, toast: ToastServiceMethods) {
  const machine = setup({
    types: {
      context: {} as Context,
      events: {} as
        | { type: 'editor.menu.new.click' }
        | { type: 'editor.menu.open.cancel' }
        | { type: 'editor.menu.open.success' }
        | { type: 'editor.menu.close.click' }
        | { type: 'editor.menu.open.click' }
        | { type: 'editor.menu.save.click' }
        | { type: 'editor.menu.save-as.click' }
        | { type: 'editor.new.dialog.submit' }
    },
    actions: {
      assignFileData: assign({
        content: (context) => context.event.output.data.content,
        fileHandle: (context) => context.event.output.data.fileHandle
      }),
      savingSuccess: (params) => {
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Saved successfully',
          life: 3000
        })
      },
      savingFailed: (params) => {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Saving failed', life: 3000 })
      },
      openedStateEntry: (params) => {
        router.push('/edit')
      },
    },
    actors: {
      openFileDialog: (() => {
        const filePickerOptions: OpenFilePickerOptions = {
          types: [
            {
              description: 'RDF Turtle files',
              accept: {
                'text/turtle': ['.ttl']
              }
            }
          ]
        }

        return fromPromise(async (params) => {
          const [fileHandle] = await window.showOpenFilePicker(filePickerOptions)
          const file = await fileHandle.getFile()
          const content = await file.text()
          return { type: 'editor.menu.open.success', data: { content, fileHandle } }
        })
      })(),
      saveFile: (() => {
        console.log('Saving file')
        return fromPromise(async ({ input }) => {
          const { content, fileHandle, newData } = input
          const writable = await fileHandle.createWritable({ keepExistingData: false })
          await writable.write(newData)
          await writable.close()
          return { data: { content: newData, fileHandle } }
        })
      })(),
      saveFileAs: (() => {
        console.log('Saving file as')
        return fromPromise(async ({ input }) => {
          const { newData } = input
          const fileHandle = await window.showSaveFilePicker()
          const writeable = await fileHandle.createWritable()
          await writeable.write(newData)
          await writeable.close()
          return { data: { content: newData, fileHandle } }
        })
      })(),
    }
  }).createMachine({
    context: {
      content: '',
      fileHandle: null
    },
    id: 'editor',
    initial: 'empty',
    states: {
      empty: {
        on: {
          'editor.menu.open.click': {
            target: 'opening'
          },
          'editor.menu.new.click': {
            target: 'openedAsNew'
          }
        },
        entry: [
          assign({
            content: '',
            fileHandle: null
          }),
          () => router.push('/')
        ]
      },
      opening: {
        on: {
          'editor.menu.open.cancel': {
            target: 'empty'
          },
          'editor.menu.open.success': {
            target: 'opened'
          }
        },
        invoke: {
          src: 'openFileDialog',
          onDone: {
            target: 'opened',
            actions: 'assignFileData'
          },
          onError: {
            target: 'empty'
          }
        }
      },
      openingAsNew: {
        on: {
          'editor.new.dialog.submit': {
            target: 'openedAsNew'
          }
        }
      },
      opened: {
        entry: {
          type: 'openedStateEntry'
        },
        on: {
          'editor.menu.new.click': {
            target: 'openedAsNew'
          },
          'editor.menu.close.click': {
            target: 'empty'
          },
          'editor.menu.save.click': {
            target: 'saving',
            actions: (params) => {
              console.log('Save button clicked')
            }
          },
          'editor.menu.save-as.click': {
            target: 'savingAs',
            actions: (params) => {
              console.log('Save as button clicked')
            }
          },
        },
      },
      openedAsNew: {
        entry: [
          assign({
            content: '',
            fileHandle: null
          }),
          () => router.push('/edit')
        ],
        on: {
          'editor.menu.close.click': {
            target: 'empty'
          },
          'editor.menu.save-as.click': {
            target: 'savingAs',
            actions: (params) => {
              console.log('Save as button clicked')
            }
          }
        },
      },
      saving: {
        entry: () => {
          console.log('Entering saving state')
        },
        exit: 'assignFileData',
        invoke: {
          // input: ({context, event}) => ({ ...context }),
          input: ({ context }) => {
            return { ...context, newData: shui.value.quadsToTriplesString(DATA_GRAPH) }
          },
          src: 'saveFile',
          onDone: {
            target: 'opened',
            actions: 'savingSuccess'
          },
          onError: {
            target: 'opened',
            actions: 'savingFailed'
          }
        }
      },
      savingAs: {
        entry: () => {
          console.log('Entering savingAs state')
        },
        exit: 'assignFileData',
        invoke: {
          // input: ({context, event}) => ({ ...context }),
          input: ({ context }) => {
            return { ...context, newData: shui.value.quadsToTriplesString(DATA_GRAPH) }
          },
          src: 'saveFileAs',
          onDone: {
            target: 'opened',
            actions: 'savingSuccess'
          },
          onError: {
            target: 'opened',
            actions: 'savingFailed'
          }
        }
      }
    }
  })

  return machine
}
