import { DataFactory } from 'n3'
import type { Meta, StoryObj } from '@storybook/vue3'
import BooleanSelectEditor from '@/components/dash/editors/BooleanSelectEditor.vue'
import { Shui } from '@/shui'

const { namedNode, literal } = DataFactory
const shui = new Shui()
const XSD_boolean = namedNode('http://www.w3.org/2001/XMLSchema#boolean')

const meta = {
  title: 'SHACL UI/Dash/Editors/BooleanSelectEditor',
  component: BooleanSelectEditor,
  tags: ['autodocs']
} satisfies Meta<typeof BooleanSelectEditor>

export default meta

type Story = StoryObj<typeof meta>

export const LexicalTrue: Story = {
  args: {
    subject: namedNode('urn:example:subject'),
    predicate: shui.toSNamedNode(namedNode('urn:predicate:boolean')),
    object: shui.toSLiteral(literal('true', XSD_boolean)),
    graph: shui.toSNamedNode(namedNode('urn:graph:example'))
  }
}

export const Lexical1: Story = {
  args: {
    subject: namedNode('urn:example:subject'),
    predicate: shui.toSNamedNode(namedNode('urn:predicate:boolean')),
    object: shui.toSLiteral(literal('1', XSD_boolean)),
    graph: shui.toSNamedNode(namedNode('urn:graph:example'))
  }
}

export const LexicalFalse: Story = {
  args: {
    subject: namedNode('urn:example:subject'),
    predicate: shui.toSNamedNode(namedNode('urn:predicate:boolean')),
    object: shui.toSLiteral(literal('false', XSD_boolean)),
    graph: shui.toSNamedNode(namedNode('urn:graph:example'))
  }
}

export const Lexical0: Story = {
  args: {
    subject: namedNode('urn:example:subject'),
    predicate: shui.toSNamedNode(namedNode('urn:predicate:boolean')),
    object: shui.toSLiteral(literal('0', XSD_boolean)),
    graph: shui.toSNamedNode(namedNode('urn:graph:example'))
  }
}

export const InvalidBooleanValueAndDatatypeValue: Story = {
  args: {
    subject: namedNode('urn:example:subject'),
    predicate: shui.toSNamedNode(namedNode('urn:predicate:boolean')),
    object: shui.toSLiteral(literal('123', namedNode('urn:invalid:datatype'))),
    graph: shui.toSNamedNode(namedNode('urn:graph:example'))
  }
}
