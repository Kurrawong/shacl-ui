import n3 from 'n3'
import type { Term, NamedNode, BlankNode, Quad_Graph, Quad_Predicate, Quad_Subject, Quad, Literal } from 'n3'
import fs from 'fs'
import type { STerm } from '@/types'

const { namedNode, blankNode, literal, quad } = n3.DataFactory

const parser = new n3.Parser()
const writer = new n3.Writer()

const RDF_type = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
const RDFS_label = namedNode('http://www.w3.org/2000/01/rdf-schema#label')
const SH_NodeShape = namedNode('http://www.w3.org/ns/shacl#NodeShape')
const SH_PropertyShape = namedNode('http://www.w3.org/ns/shacl#PropertyShape')
const SH_path = namedNode('http://www.w3.org/ns/shacl#path')
const XSD_string = namedNode('http://www.w3.org/2001/XMLSchema#string')

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
    if (this.labelTerm.termType === 'Literal') {
      return this.labelTerm.value
    } else {
      return this.labelTerm.value.split('#').slice(-1).join('').split('/').slice(-1)[0]
    }
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
    super(id);
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
  constructor(subject: SNamedNode | SBlankNode, predicate: SNamedNode, object: STerm, graph: SNamedNode | SBlankNode) {
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
  _store
  _shaclGraphName
  _labelsGraphName

  constructor(shaclGraphName: string = 'urn:system:graph:shacl', labelsGraphName: string = 'urn:system:graph:labels') {
    this._store = new n3.Store()
    this._shaclGraphName = namedNode(shaclGraphName)
    this._labelsGraphName = namedNode(labelsGraphName)
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

  nodeLabel(subject: NamedNode | BlankNode) {
    // TODO: Implement the other methods of retrieving labels.
    // 1. Look in the labels system graph, then look in the entire dataset in case there's a label defined in one of the data graphs.
    // 2. With the current NodeShape, see whether there's a PropertyShape with the dash:propertyRole set to dash:LabelRole. If so, search with the sh:path value of the PropertyShape to retrieve a label.
    // 3. Return a curie based on the prefixes set in the store.
    // 4. Return the fully qualified IRI, or should we generate a curie?.
    const labels = this.store.getObjects(subject, RDFS_label, null)
    if (labels.length > 0) {
      return literal(labels[0].value)
    }

    return literal(subject.value)
  }

  toSTerm(term: Term): STerm {
    if (term.termType === 'NamedNode') {
      return new SNamedNode(term.value, this.nodeLabel(term))
    }
    else if (term.termType === 'BlankNode') {
      return new SBlankNode(term.value, this.nodeLabel(term))
    }
    else if (term.termType === 'Literal') {
      return new SLiteral(term.id, new SNamedNode(term.datatype.id, this.nodeLabel(term.datatype)))
    }

    throw Error(`Term type ${term.termType} not supported.`)
  }

  toSTermSubject(term: Quad_Subject | Quad_Graph) {
    if (term.termType === 'NamedNode') {
      return new SNamedNode(term.value, this.nodeLabel(term))
    }
    else if (term.termType === 'BlankNode') {
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

  toSLiteral(term: Literal) {
    return new SLiteral(term.id, new SNamedNode(term.datatype.id, this.nodeLabel(term.datatype)))
  }

  toSQuad(q: Quad) {
    return new SQuad(
      this.toSTermSubject(q.subject),
      this.toSTermPredicate(q.predicate),
      this.toSTerm(q.object),
      this.toSTermSubject(q.graph)
    )
  }

  getQuads(
    subject: NamedNode | BlankNode | null,
    predicate: NamedNode | null,
    object: Term | null,
    graph: NamedNode | BlankNode | null
  ) {
    return this.store.getQuads(subject, predicate, object, graph).map((q) => {
      return this.toSQuad(q)
    })
  }

  getPredicates(
    subject: NamedNode | BlankNode | null,
    object: Term | null,
    graph: NamedNode | BlankNode | null
  ) {
    return this.store.getPredicates(subject, object, graph).map((term) => {
      return this.toSTermPredicate(term)
    })
  }

  getObjects(
    subject: NamedNode | BlankNode | null,
    predicate: NamedNode | null,
    graph: NamedNode | BlankNode | null
  ) {
    return this.store.getObjects(subject, predicate, graph).map((term) => {
      return this.toSTerm(term)
    })
  }
}
