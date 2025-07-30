// This file can be refactored once
// https://github.com/zazuko/rdf-validate-shacl/issues/168
// supports custom constraint vocabularies.

import type { DatasetCore, NamedNode, Term, Quad, DataFactory } from '@rdfjs/types'
import { DataFactory as n3DataFactory } from 'n3'
import SHACLValidator, { type Options } from 'rdf-validate-shacl'
import ShapesGraph, { Constraint, Shape } from 'rdf-validate-shacl/src/shapes-graph'
import ValidatorRegistry from 'rdf-validate-shacl/src/validators-registry'
import { getInstancesOf } from 'rdf-validate-shacl/src/dataset-utils'
import type { ValidationFunction, Validator } from 'rdf-validate-shacl/src/validation-engine'
import type { AnyPointer, GraphPointer } from 'clownface'
import { dash, xsd } from '@/core/namespaces'
import shaclVocabularyFactory from '@vocabulary/sh'
import dashVocabularyFactory from '@vocabulary/dash'

const TRUE_LITERAL = n3DataFactory.literal('true', xsd.boolean)

ValidatorRegistry.push([
  dash.SingleLineConstraintComponent,
  {
    validate(context, focusNode, valueNode, constraint) {
      if (constraint.paramValue.equals(TRUE_LITERAL) && valueNode.termType !== 'Literal') {
        return false
      }
      if (
        constraint.paramValue.equals(TRUE_LITERAL) &&
        valueNode.termType === 'Literal' &&
        valueNode.value.includes('\n')
      ) {
        return false
      }

      return true
    },
    validationMessage: 'Value must be a literal and contain no new lines.',
  },
])

// NOTE: copied from rdf-validate-shacl/src/shapes-graph.ts as it does not export the ConstraintComponent class
class ConstraintComponent {
  declare nodePointer: GraphPointer
  declare parameters: Term[]
  declare parameterNodes: unknown[]
  declare requiredParameters: Term[]
  declare optionals: Record<string, unknown>
  declare validator: Validator | undefined
  declare nodeValidationFunction: (
    focusNode: Term,
    valueNode: Term,
    constraint: Constraint,
  ) => ReturnType<ValidationFunction>
  declare nodeValidationFunctionGeneric: boolean
  declare nodeValidationMessage: string | undefined
  declare propertyValidationFunction: (
    focusNode: Term,
    valueNode: Term,
    constraint: Constraint,
  ) => ReturnType<ValidationFunction>
  declare propertyValidationFunctionGeneric: boolean
  declare propertyValidationMessage: string | undefined

  constructor(
    readonly node: NamedNode,
    readonly context: SHACLValidator,
    shaclVocabulary: AnyPointer,
  ) {
    const { factory, ns } = context
    const { sh, xsd } = ns

    this.nodePointer = shaclVocabulary.node(node)

    this.parameters = []
    this.parameterNodes = []
    this.requiredParameters = []
    this.optionals = {}
    const trueTerm = factory.literal('true', xsd.boolean)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.nodePointer.out(sh.parameter).forEach((parameterCf: any) => {
      const parameter = parameterCf.term

      parameterCf.out(sh.path).forEach(({ term: path }: { term: Term }) => {
        this.parameters.push(path)
        this.parameterNodes.push(parameter)
        if (shaclVocabulary.dataset.match(parameter, sh.optional, trueTerm).size > 0) {
          this.optionals[path.value] = true
        } else {
          this.requiredParameters.push(path)
        }
      })
    })

    this.validator = context.validators.get(node)
    if (!this.validator) {
      return
    }

    if ('nodeValidate' in this.validator) {
      this.nodeValidationFunction = this.validator.nodeValidate.bind(undefined, this.context)
      this.nodeValidationMessage = this.validator.nodeValidationMessage
    } else if ('validate' in this.validator) {
      this.nodeValidationFunction = this.validator.validate.bind(undefined, this.context)
      this.nodeValidationMessage = this.validator.validationMessage
      this.nodeValidationFunctionGeneric = true
    }
    if ('propertyValidate' in this.validator) {
      this.propertyValidationFunction = this.validator.propertyValidate.bind(
        undefined,
        this.context,
      )
      this.propertyValidationMessage = this.validator.propertyValidationMessage
    } else if ('validate' in this.validator) {
      this.propertyValidationFunction = this.validator.validate.bind(undefined, this.context)
      this.propertyValidationMessage = this.validator.validationMessage
      this.propertyValidationFunctionGeneric = true
    }
  }

  getMessages(shape: Shape): [string] | [] {
    const message = shape.isPropertyShape
      ? this.propertyValidationMessage
      : this.nodeValidationMessage
    return message ? [message] : []
  }

  isComplete(parameterValues: Map<Term, unknown>) {
    return this.requiredParameters.every((param) => parameterValues.has(param))
  }
}

type VocabularyFactory = ({ factory }: { factory: DataFactory<Quad, Quad> }) => Quad[]

export class UIShapesGraph extends ShapesGraph {
  constructor(
    context: SHACLValidator,
    vocabularyFactories: VocabularyFactory[] = [shaclVocabularyFactory],
  ) {
    super(context)

    const { sh } = context.ns
    // @ts-expect-error - _components is a private property
    this['_components'] = []

    for (const vocabularyFactory of vocabularyFactories) {
      const vocabulary = context.factory.clownface({
        dataset: context.factory.dataset(vocabularyFactory(context)),
      })
      const componentNodes = getInstancesOf(vocabulary.node(sh.ConstraintComponent), context.ns)
      const constraintComponents = [...componentNodes]
        .filter((node) => node.termType === 'NamedNode')
        .map((node) => new ConstraintComponent(node, context, vocabulary))

      // @ts-expect-error - _components is a private property
      this['_components'] = this['_components'].concat(constraintComponents)
    }

    for (const component of this['_components']) {
      for (const parameter of component.parameters) {
        this['_parametersMap'].set(parameter.value, component)
      }
    }
  }
}

export class UISHACLValidator extends SHACLValidator {
  constructor(shapes: DatasetCore, options?: Options) {
    super(shapes, options)
    this.shapesGraph = new UIShapesGraph(this, [shaclVocabularyFactory, dashVocabularyFactory])
  }
}
