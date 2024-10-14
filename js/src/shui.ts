import rdf from 'rdf-ext'
import type {
  BlankNode,
  Literal,
  NamedNode,
  Quad,
  Quad_Graph,
  Quad_Predicate,
  Quad_Subject,
  Term
} from 'n3'
import n3, { DataFactory, Store } from 'n3'
// @ts-ignore
import { PathList } from 'grapoi'
import rdfDataset from '@rdfjs/dataset'
// @ts-ignore
import { Validator } from 'shacl-engine'
import fs from 'fs'
import { QueryEngine } from '@comunica/query-sparql'
import type { STerm, UISchema, Validator as IValidator } from '@/types'
import type {
  DatasetCore,
  NamedNode as RDFSNamedNode,
  BlankNode as RDFJSBlankNode
} from '@rdfjs/types'
import { visitShape } from '@/core/constraint-components/shape-visitor'
import { getWidgets, type ObjectParam } from '@/core/widgets/score-widget'
import {
  ConstraintComponent,
  DEFAULT_SH_ORDER_VALUE
} from './core/constraint-components/constraint-component'
import { ClassConstraintComponent } from '@/core/constraint-components/value-type/class'
import { NodeConstraintComponent } from '@/core/constraint-components/shape-based/node'
import { shapeToSparql, sparqlAutoCompleteRewrite } from '@/core/sparql'
import quad = DataFactory.quad

const { namedNode, literal } = n3.DataFactory

const parser = new n3.Parser()
const writer = new n3.Writer()

const RDF_type = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
const RDFS_label = namedNode('http://www.w3.org/2000/01/rdf-schema#label')
const SH_NodeShape = namedNode('http://www.w3.org/ns/shacl#NodeShape')
const SH_PropertyShape = namedNode('http://www.w3.org/ns/shacl#PropertyShape')
const SH_path = namedNode('http://www.w3.org/ns/shacl#path')

export class SNamedNode extends n3.NamedNode {
  _label
  constructor(id: string, label: n3.Literal) {
    super(id)
    this._label = label
  }

  get labelTerm() {
    return this._label
  }

  get label() {
    return this.labelTerm.value
  }
}

export class SBlankNode extends n3.BlankNode {
  _label
  constructor(id: string, label: n3.Literal) {
    super(id)
    this._label = label
  }

  get labelTerm() {
    return this._label
  }

  get label() {
    if (this.labelTerm.termType === 'Literal') {
      return this.labelTerm.value
    } else {
      return `_:${this.labelTerm.value.split('#').slice(-1).join('').split('/').slice(-1)[0]}`
    }
  }
}

export class SLiteral extends n3.Literal {
  _datatype: SNamedNode

  constructor(id: string, datatype: SNamedNode) {
    super(id)
    this._datatype = datatype
  }

  // @ts-ignore
  get datatype() {
    return this._datatype
  }
}

export class SQuad extends n3.Quad {
  _subject
  _predicate
  _object
  _graph
  constructor(
    subject: SNamedNode | SBlankNode,
    predicate: SNamedNode,
    object: STerm,
    graph: SNamedNode | SBlankNode
  ) {
    super(subject, predicate, object, graph)
    this._subject = subject
    this._predicate = predicate
    this._object = object
    this._graph = graph
  }

  // @ts-ignore
  get subject() {
    return this._subject
  }

  // @ts-ignore
  get predicate() {
    return this._predicate
  }

  // @ts-ignore
  get object() {
    return this._object
  }

  // @ts-ignore
  get graph() {
    return this._graph
  }
}

export class Shui {
  _store: n3.Store
  _shaclGraphName: NamedNode | BlankNode
  _queryEngine: QueryEngine

  constructor(shaclGraphName: string = 'urn:system:graph:shacl') {
    this._store = new n3.Store()
    this._shaclGraphName = namedNode(shaclGraphName)
    this._queryEngine = new QueryEngine()
  }

  get store() {
    return this._store
  }

  get shaclGraphName() {
    return this._shaclGraphName
  }

  get shapes() {
    const store = this.store

    const definedNodeShapes = store.getSubjects(RDF_type, SH_NodeShape, this.shaclGraphName)
    for (const s of definedNodeShapes) {
      store.forObjects(
        () => {
          throw Error(
            `A shape ${s.value} defined as a NodeShape cannot be the subject of a sh:path predicate. https://www.w3.org/TR/shacl/#node-shapes`
          )
        },
        s,
        SH_path,
        null
      )
    }

    const definedPropertyShapes = store.getSubjects(RDF_type, SH_PropertyShape, this.shaclGraphName)
    const foundPropertyShapesPath = new Map<string, NamedNode>()
    for (const s of definedPropertyShapes) {
      for (const nodeShape of definedNodeShapes) {
        if (nodeShape.equals(s)) {
          throw Error(
            `A shape ${s.value} defined as a NodeShape cannot also be defined as a PropertyShape. https://www.w3.org/TR/shacl/#node-shapes`
          )
        }
      }

      const pathVals = store.getObjects(s, SH_path, this.shaclGraphName)
      if (pathVals.length < 1) {
        throw Error(
          `A shape ${s.value} defined as a PropertyShape must include one sh:path property. https://www.w3.org/TR/shacl/#property-shapes`
        )
      } else if (pathVals.length > 1) {
        throw Error(
          `A shape ${s.value} defined as a PropertyShape cannot have more than one sh:path property. https://www.w3.org/TR/shacl/#property-shapes`
        )
      }

      if (pathVals[0].termType != 'NamedNode') {
        throw Error(
          `A shape ${s.value} defined as a PropertyShape must have an IRI value for the sh:path property.`
        )
      }

      foundPropertyShapesPath.set(s.value, pathVals[0])
    }

    return []
  }

  parseFile(filePath: string) {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const quads = parser.parse(fileContent)
    this.store.addQuads(quads)
  }

  parse(content: string) {
    const quads = parser.parse(content)
    this.store.addQuads(quads)
  }

  quadsToString(graph: NamedNode | BlankNode | null) {
    return writer.quadsToString(this.store.getQuads(null, null, null, graph))
  }

  quadsToTriplesString(graph: NamedNode | BlankNode | null) {
    return writer.quadsToString(
      this.store
        .getQuads(null, null, null, graph)
        .map((q) => quad(q.subject, q.predicate, q.object))
    )
  }

  nodeLabel(subject: RDFSNamedNode | RDFJSBlankNode) {
    // TODO: Implement the other methods of retrieving labels.
    // 1. Look in the labels system graph, then look in the entire dataset in case there's a label defined in one of the data graphs.
    // 2. With the current NodeShape, see whether there's a PropertyShape with the dash:propertyRole set to dash:LabelRole. If so, search with the sh:path value of the PropertyShape to retrieve a label.
    // 3. Return a curie based on the prefixes set in the store.
    // 4. Return the fully qualified IRI, or should we generate a curie?.
    const labels = this.store.getObjects(subject, RDFS_label, null)
    if (labels.length > 0) {
      return literal(labels[0].value)
    }

    if (subject.termType === 'NamedNode') {
      return literal(subject.value.split('#').slice(-1).join('').split('/').slice(-1)[0])
    }

    return literal(subject.value)
  }

  toSTerm(term: Term): STerm {
    if (term.termType === 'NamedNode') {
      return new SNamedNode(term.value, this.nodeLabel(term))
    } else if (term.termType === 'BlankNode') {
      return new SBlankNode(term.value, this.nodeLabel(term))
    } else if (term.termType === 'Literal') {
      return new SLiteral(term.id, new SNamedNode(term.datatype.id, this.nodeLabel(term.datatype)))
    } else {
      throw Error(`Term type ${term.termType} not supported.`)
    }
  }

  toSTermSubject(term: Quad_Subject | Quad_Graph) {
    if (term.termType === 'NamedNode') {
      return new SNamedNode(term.value, this.nodeLabel(term))
    } else if (term.termType === 'BlankNode') {
      return new SBlankNode(term.value, this.nodeLabel(term))
    }

    throw Error(`Term type ${term.termType} not supported.`)
  }

  toSTermPredicate(term: Quad_Predicate) {
    if (term.termType === 'NamedNode') {
      return new SNamedNode(term.value, this.nodeLabel(term))
    }

    throw Error(`Term type ${term.termType} not supported.`)
  }

  toSNamedNode(term: NamedNode) {
    return new SNamedNode(term.value, this.nodeLabel(term))
  }

  toSBlankNode(term: BlankNode) {
    return new SBlankNode(term.value, this.nodeLabel(term))
  }

  toSLiteral(term: Literal) {
    return new SLiteral(term.id, new SNamedNode(term.datatype.id, this.nodeLabel(term.datatype)))
  }

  toSQuad(q: Quad) {
    return new SQuad(
      this.toSTermSubject(q.subject),
      this.toSTermPredicate(q.predicate),
      this.toSTerm(q.object as NamedNode | BlankNode | Literal),
      this.toSTermSubject(q.graph)
    )
  }

  /**
   * Get a shacl-engine validator instance.
   * @param dataGraphName
   */
  createValidator(dataGraphName: NamedNode | BlankNode): {
    validator: IValidator
    dataset: DatasetCore
  } {
    const quads = this.store
      .getQuads(null, null, null, this.shaclGraphName)
      .concat(this.store.getQuads(null, null, null, dataGraphName))
    const dataset = rdfDataset.dataset(quads)
    return {
      validator: new Validator(dataset, { factory: rdf }),
      dataset
    }
  }

  getNodeShapes(focusNode: NamedNode | BlankNode, dataGraphName: NamedNode | BlankNode) {
    const { validator, dataset } = this.createValidator(dataGraphName)
    const focusNodePtr = new PathList({ ...{ dataset }, factory: rdf })
    const classTypes = focusNodePtr.node([focusNode]).out([RDF_type]).values
    const nodeShapes = []

    for (const shape of validator.shapes.values()) {
      // sh:targetClass
      for (const targetClass of shape.targetResolver.targetClass.values()) {
        if (classTypes.includes(targetClass.id)) {
          nodeShapes.push(shape.ptr.term)
          break
        }
      }

      // sh:targetNode
      for (const targetNode of shape.targetResolver.targetNode) {
        if (targetNode.equals(focusNode)) {
          nodeShapes.push(shape.ptr.term)
          break
        }
      }

      // TODO: Implement the remaining target methods.
    }

    return nodeShapes
  }

  applySchemaValues(
    subject: NamedNode | BlankNode,
    dataGraphName: NamedNode | BlankNode,
    schema: UISchema
  ) {
    const store = this.store
    for (const [key, uiSchemaValues] of Object.entries(schema)) {
      if (subject.value !== key) {
        continue
      }

      const predicates = store.getPredicates(subject, null, dataGraphName) as NamedNode[]
      for (const predicate of predicates) {
        if (!(subject.value in schema)) {
          schema[subject.value] = {
            predicates: {
              [predicate.value]: {
                order: DEFAULT_SH_ORDER_VALUE,
                term: predicate,
                group: null,
                constraintComponents: [],
                values: [],
                editor: null
              }
            },
            groups: new Map()
          }
        }

        const predicatesObject = schema[subject.value].predicates
        if (!(predicate.value in predicatesObject)) {
          predicatesObject[predicate.value] = {
            order: DEFAULT_SH_ORDER_VALUE,
            term: predicate,
            group: null,
            constraintComponents: [],
            values: [],
            editor: null
          }
        }

        const values = store.getObjects(subject, predicate, dataGraphName) as ObjectParam[]
        for (const value of values) {
          const widgets = getWidgets(value, predicatesObject[predicate.value].constraintComponents)
          predicatesObject[predicate.value].values.push({
            widgets,
            term: this.toSTerm(value as NamedNode | BlankNode | Literal)
          })
        }
      }
    }
  }

  /**
   * Traverses the SHACL node shape and extracts constraint components and
   * other shape metadata such as groups and names. The UI schema properties
   * are constructed from the discovered constraint components.
   *
   * Finally, populate the UI schema properties with the values in the data graph.
   * @param subject The subject (focus node).
   * @param dataGraphName Data graph name.
   * @param nodeShape SHACL node shape.
   * @returns UI schema.
   */
  async getSchema(
    subject: NamedNode | BlankNode,
    dataGraphName: NamedNode | BlankNode,
    nodeShape?: NamedNode | BlankNode
  ) {
    const schema: UISchema = {
      [subject.value]: {
        predicates: {},
        groups: new Map()
      }
    }

    if (nodeShape) {
      const { validator } = this.createValidator(dataGraphName)
      const nodeShapePtr = validator.shapesPtr.node([nodeShape])
      const shape = validator.shape(nodeShapePtr)
      visitShape(subject, shape, this.shaclGraphName, schema)
    }

    this.applySchemaValues(subject, dataGraphName, schema)
    return schema
  }

  /**
   * Get the autocomplete values as quads as a result of the queries generated
   * by the SHACL parameters, sh:node and sh:class.
   * @param constraintComponents
   * @param dataGraphName
   */
  async getAutoCompleteEditorValues(
    constraintComponents: ConstraintComponent[],
    dataGraphName: NamedNode | BlankNode
  ) {
    const store = new Store()

    const nodes = (() => {
      const _nodes = []
      for (const cc of constraintComponents) {
        if (cc instanceof NodeConstraintComponent) {
          _nodes.push(...cc.nodes)
        }
      }
      return _nodes
    })()

    const classes = (() => {
      const _classes = []
      for (const cc of constraintComponents) {
        if (cc instanceof ClassConstraintComponent) {
          _classes.push(...cc.classes)
        }
      }
      return _classes
    })()

    if (nodes.length) {
      for (const node of nodes) {
        const query = shapeToSparql(node, this.store, this.shaclGraphName)
        const modifiedQuery = sparqlAutoCompleteRewrite(query, classes, dataGraphName)
        const quadStream = await this._queryEngine.queryQuads(modifiedQuery, {
          sources: [this.store]
        })
        const quads = await quadStream.toArray()
        store.addQuads(quads)
      }
    } else if (classes.length) {
      for (const cls of classes) {
        const quads = this.store.getQuads(null, RDF_type, cls, dataGraphName)
        store.addQuads(quads)
      }
    }

    return store.getQuads(null, null, null, null)
  }
}
