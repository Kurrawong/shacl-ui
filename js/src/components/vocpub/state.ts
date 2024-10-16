import { setup, fromPromise, assign } from 'xstate'
import { type ToastServiceMethods } from 'primevue/toastservice'
import { type Router } from 'vue-router'
import { type Ref } from 'vue'
import { Shui } from '@/shui.js'
import { DATA_GRAPH, SHACL_GRAPH } from '@/components/vocpub/constants.js'
import { skos, rdf } from '@/core/namespaces'
import { DataFactory, Quad, Parser } from 'n3'
import namedNode = DataFactory.namedNode
import literal = DataFactory.literal
import quad = DataFactory.quad
import vocpub from '@/assets/vocpub.ttl?raw'

type Context = {
  content: string
  fileHandle: FileSystemFileHandle | null
  conceptSchemeIRI: string
  openedStateType: 'opened' | 'openedAsNew' | null
}

export function getMachine(
  shui: Ref<Shui>,
  reset: () => void,
  addQuads: (newQuads: Quad[]) => void,
  removeQuads: (newQuads: Quad[]) => void,
  router: Router,
  toast: ToastServiceMethods
) {
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
        | { type: 'editor.project.new.submit'; conceptSchemeIRI: string }
        | { type: 'editor.project.new.cancel' }
        | { type: 'editor.menu.create-concept.click' }
        | { type: 'new.concept.dialog.cancel' }
        | { type: 'new.concept.dialog.create'; conceptIRI: string }
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
      loadDataToStore: (params) => {
        reset()
        const parser = new Parser()
        const quads = parser
          .parse(params.context.content)
          .map((q) => quad(q.subject, q.predicate, q.object, DATA_GRAPH))
        addQuads(quads)

        const shaclQuads = parser
          .parse(vocpub)
          .map((q) => quad(q.subject, q.predicate, q.object, SHACL_GRAPH))
        addQuads(shaclQuads)

        router.push('/edit')
      },
      loadShaclDataToStore: () => {
        const parser = new Parser()
        const shaclQuads = parser
          .parse(vocpub)
          .map((q) => quad(q.subject, q.predicate, q.object, SHACL_GRAPH))
        addQuads(shaclQuads)
      },
      validateFile: (params) => {
        const conceptSchemes = shui.value.store.getQuads(
          null,
          rdf.type,
          skos.ConceptScheme,
          DATA_GRAPH
        )

        if (conceptSchemes.length === 0) {
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No concept scheme found in the file',
            life: 5000
          })
          params.self.send({ type: 'editor.menu.close.click' })
        } else if (conceptSchemes.length > 1) {
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Multiple concept schemes found in the file',
            life: 5000
          })
          params.self.send({ type: 'editor.menu.close.click' })
        }
      },
      assignNewProjectDetails: assign({
        conceptSchemeIRI: (context) => context.event.conceptSchemeIRI,
        content: () => '', // Reset content for new project
        fileHandle: () => null, // Reset file handle for new project
        openedStateType: () => 'openedAsNew' as const
      }),
      addConceptSchemeTriple: (params) => {
        const { conceptSchemeIRI } = params.context
        reset()
        addQuads([quad(namedNode(conceptSchemeIRI), rdf.type, skos.ConceptScheme, DATA_GRAPH)])
        addQuads([
          quad(namedNode(conceptSchemeIRI), skos.prefLabel, literal('Untitled', 'en'), DATA_GRAPH)
        ])
      }
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
          return { data: { content, fileHandle } }
        })
      })(),
      saveFile: (() => {
        console.log('Saving file')
        return fromPromise(async ({ input }) => {
          const { fileHandle, newData } = input
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
          const options = {
            suggestedName: 'untitled.ttl',
            types: [
              {
                description: 'RDF Turtle files',
                accept: { 'text/turtle': ['.ttl'] as Array<`.${string}`> }
              }
            ]
          }
          const fileHandle = await window.showSaveFilePicker(options)
          const writeable = await fileHandle.createWritable()
          await writeable.write(newData)
          await writeable.close()
          return { data: { content: newData, fileHandle } }
        })
      })()
    }
  }).createMachine({
    context: {
      content: '',
      fileHandle: null,
      conceptSchemeIRI: '',
      openedStateType: null
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
            target: 'openingAsNew'
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
          }
        },
        invoke: {
          src: 'openFileDialog',
          onDone: {
            target: 'opened',
            actions: [
              'assignFileData',
              {
                type: 'loadDataToStore'
              },
              {
                type: 'validateFile'
              },
              assign({
                conceptSchemeIRI: () => {
                  const conceptSchemes = shui.value.store.getQuads(
                    null,
                    rdf.type,
                    skos.ConceptScheme,
                    DATA_GRAPH
                  )
                  return conceptSchemes[0].subject.value
                }
              })
            ]
          },
          onError: {
            target: 'empty'
          }
        }
      },
      openingAsNew: {
        entry: () => router.push('/new-project'),
        on: {
          'editor.project.new.submit': {
            target: 'openedAsNew',
            actions: 'assignNewProjectDetails'
          },
          'editor.project.new.cancel': {
            target: 'empty'
          },
          'editor.menu.open.click': {
            target: 'opening'
          }
        }
      },
      opened: {
        on: {
          'editor.menu.new.click': {
            target: 'openingAsNew'
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
          'editor.menu.create-concept.click': {
            target: 'creatingConcept',
            actions: assign({
              openedStateType: () => 'opened'
            })
          }
        }
      },
      openedAsNew: {
        entry: [
          'addConceptSchemeTriple',
          'loadShaclDataToStore',
          ({ context }) => router.push(`/edit/resource?iri=${context.conceptSchemeIRI}`)
        ],
        on: {
          'editor.menu.new.click': {
            target: 'openingAsNew'
          },
          'editor.menu.close.click': {
            target: 'empty'
          },
          'editor.menu.save-as.click': {
            target: 'savingAsNew',
            actions: (params) => {
              console.log('Save as button clicked')
            }
          },
          'editor.menu.create-concept.click': {
            target: 'creatingConcept',
            actions: assign({
              openedStateType: () => 'openedAsNew'
            })
          }
        }
      },
      creatingConcept: {
        on: {
          'new.concept.dialog.cancel': [
            {
              target: 'opened',
              guard: ({ context }) =>
                context.openedStateType === 'opened' || !context.openedStateType
            },
            {
              target: 'openedAsNew',
              guard: ({ context }) => context.openedStateType === 'openedAsNew'
            }
          ],
          'new.concept.dialog.create': [
            {
              target: 'opened',
              guard: ({ context }) =>
                context.openedStateType === 'opened' || !context.openedStateType,
              actions: [
                ({ event }) => {
                  console.log('new concept dialog create targeting opened')
                  const newQuad = quad(
                    namedNode(event.conceptIRI),
                    rdf.type,
                    skos.Concept,
                    DATA_GRAPH
                  )
                  addQuads([newQuad])
                  toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `Created new concept: ${event.conceptIRI}`,
                    life: 3000
                  })
                  router.push(`/edit/resource?iri=${event.conceptIRI}`)
                }
              ]
            },
            {
              target: 'openedAsNew',
              guard: ({ context }) => context.openedStateType === 'openedAsNew',
              actions: [
                ({ event }) => {
                  console.log('new concept dialog create targeting openedAsNew')
                  const newQuad = quad(
                    namedNode(event.conceptIRI),
                    rdf.type,
                    skos.Concept,
                    DATA_GRAPH
                  )
                  addQuads([newQuad])
                  toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `Created new concept: ${event.conceptIRI}`,
                    life: 3000
                  })
                }
              ]
            }
          ]
        }
      },
      saving: {
        entry: () => {
          console.log('Entering saving state')
        },
        invoke: {
          input: ({ context }) => {
            return { ...context, newData: shui.value.quadsToTriplesString(DATA_GRAPH) }
          },
          src: 'saveFile',
          onDone: {
            target: 'opened',
            actions: ['savingSuccess', 'assignFileData']
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
        invoke: {
          input: ({ context }) => {
            return { ...context, newData: shui.value.quadsToTriplesString(DATA_GRAPH) }
          },
          src: 'saveFileAs',
          onDone: {
            target: 'opened',
            actions: ['savingSuccess', 'assignFileData']
          },
          onError: {
            target: 'opened',
            actions: 'savingFailed'
          }
        }
      },
      savingAsNew: {
        entry: () => {
          console.log('Entering savingAsNew state')
        },
        invoke: {
          input: ({ context }) => {
            return { ...context, newData: shui.value.quadsToTriplesString(DATA_GRAPH) }
          },
          src: 'saveFileAs',
          onDone: {
            target: 'opened',
            actions: ['savingSuccess', 'assignFileData']
          },
          onError: {
            target: 'openedAsNew',
            actions: 'savingFailed'
          }
        }
      }
    }
  })

  return machine
}
