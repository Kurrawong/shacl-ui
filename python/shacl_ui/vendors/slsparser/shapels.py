from __future__ import annotations

from enum import Enum, auto
from itertools import repeat
from typing import List, Optional, Set, Tuple

from rdflib import RDF, RDFS, SH, Graph
from rdflib.collection import Collection
from rdflib.term import BNode, Literal, Node, URIRef

from shacl_ui.vendors.slsparser.pathls import PANode, POp
from shacl_ui.vendors.slsparser.pathls import parse as pparse


class Op(Enum):
    HASVALUE = auto()  # Op.HASVALUE val
    NOT = auto()  # Op.NOT SANode
    AND = auto()  # Op.AND SANode SANode ...
    OR = auto()  # Op.OR SANode SANode ...
    TEST = auto()  # Op.TEST "testname" argument
    # possible testnames: [testname, element1, element2, ...]
    # - [sh:LanguageInConstraintComponent ...]
    # - [sh:DatatypeConstraintComponent, xsd:string] or other datatypes
    # - [sh:NodeKindConstraintComponent, sh:iri] or other: any of the six combinations
    # - [sh:PatternConstraintComponent, patternstring, flags]
    # - [numeric_range, <range_statement>, <value>]
    #   - <range_statement> is one of: sh:MinExclusiveConstraintComponent, sh:MaxExclusiveConstraintComponent,
    #       sh:MinInclusiveConstraintComponent, sh:MaxInclusiveConstraintComponent
    #   - <value> is an rdflib literal (numeric) value
    #   There is at most one of min_... and at most one of max_... followed by a value
    # - [length_range, <range_statement>, <value>]
    #   - <range_statement> is one of: sh:MinLengthConstraintComponent, sh:MaxLengthConstraintComponent
    #   - <value> is an rdflib literal (numeric) value
    #   There is at most one of min_... and at most one of max_... followed by a value
    HASSHAPE = auto()  # Op.HASSHAPE iri
    FORALL = auto()  # Op.FORALL PANode SANode
    EQ = auto()  # Op.EQ PANode PANode
    DISJ = auto()  # Op.DISJ PANode PANode
    # for eq(id,p) and disj(id,p) I add id to pathls.POp.ID
    CLOSED = auto()  # Op.CLOSED iri iri ...
    LESSTHAN = auto()  # Op.LESSTHAN PANode PANode
    LESSTHANEQ = auto()  # Op.LESSTHANEQ PANode PANode
    UNIQUELANG = auto()  # Op.UNIQUELANG PANode
    TOP = auto()  # Op.TOP
    BOT = auto()  # Op.BOT

    COUNTRANGE = auto()  # Op.COUNTRANGE num num/None PANode SANode


class SANode:  # Shape Algebra Node
    def __init__(
        self,
        op: Op,
        children: List,
        constraintComponent: URIRef | Tuple[URIRef, ...] | None = None,
    ):
        self.op = op
        self.children = children
        self.constraintComponent = constraintComponent

    def __eq__(self, other):
        """Overwrite the '==' operator"""
        if not isinstance(other, SANode):
            return False

        if len(self.children) != len(other.children):
            return False

        same_children = True
        for child_self, child_other in zip(self.children, other.children):
            if type(child_self) == BNode and type(child_other) == BNode:
                continue
            same_children = same_children and child_self == child_other

        return (
            (self.op == other.op)
            and same_children
            and self.constraintComponent == other.constraintComponent
        )

    def __repr__(self):
        """Pretty representation of the SANode tree"""
        out = "\n("
        out += str(self.op) + "  cc=" + str(self.constraintComponent) + " "
        for c in self.children:
            for line in c.__repr__().split("\n"):
                out += " " + line + "\n"
        out = out[:-1] + ")"
        return out


def _extract_shapes(graph: Graph) -> Set[Node]:
    # A shape is:
    # - instance of NodeShape or PropertyShape
    # - subject of targetClass, target...
    # - subject of any constraint component parameter
    # - object of a constraint component parameter that expects a shape

    shapes: Set[Node] = set(
        list(graph.objects(predicate=SH.property))
        + list(graph.objects(predicate=SH.node))
        + list(graph.objects(predicate=SH.qualifiedValueShape))
        + list(graph.objects(predicate=SH["not"]))
        + list(graph.subjects(predicate=SH.node))
        + list(graph.subjects(predicate=SH.qualifiedValueShape))
        + list(graph.subjects(predicate=SH.qualifiedMinCount))
        + list(graph.subjects(predicate=SH.qualifiedMaxCount))
        + list(graph.subjects(predicate=SH["not"]))
        + list(graph.subjects(predicate=SH["class"]))
        + list(graph.subjects(predicate=SH.datatype))
        + list(graph.subjects(predicate=SH.nodeKind))
        + list(graph.subjects(predicate=SH.minCount))
        + list(graph.subjects(predicate=SH.maxCount))
        + list(graph.subjects(predicate=SH.minExclusive))
        + list(graph.subjects(predicate=SH.minInclusive))
        + list(graph.subjects(predicate=SH.maxExclusive))
        + list(graph.subjects(predicate=SH.maxInclusive))
        + list(graph.subjects(predicate=SH.minLength))
        + list(graph.subjects(predicate=SH.maxLength))
        + list(graph.subjects(predicate=SH.pattern))
        + list(graph.subjects(predicate=SH.languageIn))
        + list(graph.subjects(predicate=SH.uniqueLang))
        + list(graph.subjects(predicate=SH.equals))
        + list(graph.subjects(predicate=SH.disjoint))
        + list(graph.subjects(predicate=SH.lessThan))
        + list(graph.subjects(predicate=SH.lessThanOrEquals))
        + list(graph.subjects(predicate=SH.closed))
        + list(graph.subjects(predicate=SH.hasValue))
        + list(graph.subjects(predicate=SH.targetClass))
        + list(graph.subjects(predicate=SH.targetNode))
        + list(graph.subjects(predicate=SH.targetObjectsOf))
        + list(graph.subjects(predicate=SH.targetSubjectsOf))
        + list(graph.subjects(predicate=SH.property))
        + list(graph.subjects(RDF.type, SH.NodeShape))
        + list(graph.subjects(RDF.type, SH.PropertyShape))
    )

    # also members of a shacl list which are objects of sh:and, sh:or, sh:xone
    logical_lists = (
        list(graph.objects(predicate=SH["or"]))
        + list(graph.objects(predicate=SH["and"]))
        + list(graph.objects(predicate=SH.xone))
    )

    for llist in logical_lists:
        for shapename in Collection(graph, llist):
            if SH.path not in graph.predicates(shapename):
                shapes.add(shapename)

    return shapes


def _extract_propertyshapes(graph: Graph) -> Set[Node]:
    # this defines what propertyshapes are parsed, should follow the spec on
    # what a propertyshape is.
    return _extract_shapes(graph).intersection(set(graph.subjects(predicate=SH.path)))


def _extract_nodeshapes(graph: Graph) -> Set[Node]:
    # this defines what nodeshapes are parsed, should follow the spec on what a
    # node shape is: a shape that is not the subject of sh:path
    return _extract_shapes(graph).difference(set(graph.subjects(predicate=SH.path)))


def parse(graph: Graph, full: bool = True):
    from python.shacl_ui.vendors.slsparser.utilities import clean_parsetree

    definitions = {}  # a mapping: shapename, SANode
    target = {}  # a mapping: shapename, target shape

    nodeshapes = _extract_nodeshapes(graph)

    for nodeshape in nodeshapes:
        definitions[nodeshape] = clean_parsetree(
            _nodeshape_parse(graph, nodeshape), full
        )
        target[nodeshape] = _target_parse(graph, nodeshape)

    propertyshapes = _extract_propertyshapes(graph)

    for propertyshape in propertyshapes:
        path = _extract_parameter_values(graph, propertyshape, SH.path)[0]
        parsed_path = pparse(graph, path)
        definitions[propertyshape] = clean_parsetree(
            _propertyshape_parse(graph, parsed_path, propertyshape), full
        )
        target[propertyshape] = _target_parse(graph, propertyshape)

    return definitions, target


def _target_parse(graph: Graph, shapename: Node) -> SANode:
    out = SANode(Op.OR, [])
    for tnode in _extract_parameter_values(graph, shapename, SH.targetNode):
        out.children.append(SANode(Op.HASVALUE, [tnode]))

    for tclass in _extract_parameter_values(graph, shapename, SH.targetClass):
        out.children.append(
            SANode(
                Op.COUNTRANGE,
                [
                    Literal(1),
                    None,
                    PANode(
                        POp.COMP,
                        [
                            PANode(POp.PROP, [RDF.type]),
                            PANode(POp.KLEENE, [PANode(POp.PROP, [RDFS.subClassOf])]),
                        ],
                    ),
                    SANode(Op.HASVALUE, [tclass]),
                ],
            )
        )

    if (shapename, RDF.type, RDFS.Class) in graph:
        out.children.append(
            SANode(
                Op.COUNTRANGE,
                [
                    Literal(1),
                    None,
                    PANode(
                        POp.COMP,
                        [
                            PANode(POp.PROP, [RDF.type]),
                            PANode(POp.KLEENE, [PANode(POp.PROP, [RDFS.subClassOf])]),
                        ],
                    ),
                    SANode(Op.HASVALUE, [shapename]),
                ],
            )
        )

    for tsub in _extract_parameter_values(graph, shapename, SH.targetSubjectsOf):
        out.children.append(
            SANode(
                Op.COUNTRANGE,
                [Literal(1), None, PANode(POp.PROP, [tsub]), SANode(Op.TOP, [])],
            )
        )

    for tobj in _extract_parameter_values(graph, shapename, SH.targetObjectsOf):
        out.children.append(
            SANode(
                Op.COUNTRANGE,
                [
                    Literal(1),
                    None,
                    PANode(POp.INV, [PANode(POp.PROP, [tobj])]),
                    SANode(Op.TOP, []),
                ],
            )
        )

    if not out.children:
        out = SANode(Op.BOT, [])

    return out


def _nodeshape_parse(graph: Graph, shapename: Node) -> SANode:
    # Note: all *_parse(...) functions (e.g. _shape_parse(...)) follow the
    # same pattern: they return list[SANode] representing a conjunction of
    # SANodes. This list can be empty.
    conj = (
        _shape_parse(graph, shapename)
        + _logic_parse(graph, shapename)
        + _tests_parse(graph, shapename)
        + _value_parse(graph, shapename)
        + _in_parse(graph, shapename)
        + _closed_parse(graph, shapename)
        + _pair_parse(graph, PANode(POp.ID, []), shapename)
    )  # EQ/DISJ id

    if conj:
        return SANode(Op.AND, conj)
    # otherwise, if the shape has no defining components:
    return SANode(Op.TOP, [])  # modeled after behaviour of validators


def _propertyshape_parse(graph: Graph, path: PANode, shapename: Node) -> SANode:
    conj = (
        _card_parse(graph, path, shapename)
        + _pair_parse(graph, path, shapename)
        + _qual_parse(graph, path, shapename)
        + _all_parse(graph, path, shapename)
        + _lang_parse(graph, path, shapename)
    )

    if conj:
        return SANode(Op.AND, conj)
    # otherwise, if the shape has no defining components:
    return SANode(Op.TOP, [])  # modeled after behaviour of validators


def _shape_parse(graph: Graph, shapename: Node) -> list[SANode]:
    shapes = list(
        zip(graph.objects(shapename, SH.node), repeat(SH.NodeConstraintComponent))
    )
    shapes += list(
        zip(
            graph.objects(shapename, SH.property),
            repeat(SH.PropertyConstraintComponent),
        )
    )
    return [SANode(Op.HASSHAPE, [shape], cc) for shape, cc in shapes]


def _logic_parse(graph: Graph, shapename: Node) -> list[SANode]:
    # Note: RDFlib does not like empty lists. It cannot parse an empty
    # rdf list
    conj_out = []

    for nshape in _extract_parameter_values(graph, shapename, SH["not"]):
        conj_out.append(
            SANode(Op.NOT, [SANode(Op.HASSHAPE, [nshape])], SH.NotConstraintComponent)
        )

    for ashape in _extract_parameter_values(graph, shapename, SH["and"]):
        shacl_list = Collection(graph, ashape)
        conj_list = [SANode(Op.HASSHAPE, [s]) for s in shacl_list]
        conj_out.append(SANode(Op.AND, conj_list, SH.AndConstraintComponent))

    for oshape in _extract_parameter_values(graph, shapename, SH["or"]):
        shacl_list = Collection(graph, oshape)
        disj_list = [SANode(Op.HASSHAPE, [s]) for s in shacl_list]
        conj_out.append(SANode(Op.OR, disj_list, SH.OrConstraintComponent))

    for xshape in _extract_parameter_values(graph, shapename, SH.xone):
        shacl_list = Collection(graph, xshape)
        _disj_out = []
        for s in shacl_list:
            single_xone = SANode(Op.AND, [SANode(Op.HASSHAPE, [s])])
            for not_s in shacl_list:
                if s != not_s:
                    single_xone.children.append(
                        SANode(Op.NOT, [SANode(Op.HASSHAPE, [not_s])])
                    )
            _disj_out.append(single_xone)
        if _disj_out:
            conj_out.append(SANode(Op.OR, _disj_out, SH.XoneConstraintComponent))

    return conj_out


def _tests_parse(graph: Graph, shapename: Node) -> list[SANode]:
    conj_out = []

    # sh:class
    for sh_class in _extract_parameter_values(graph, shapename, SH["class"]):
        conj_out.append(
            SANode(
                Op.COUNTRANGE,
                [
                    Literal(1),
                    None,
                    PANode(
                        POp.COMP,
                        [
                            PANode(POp.PROP, [RDF.type]),
                            PANode(POp.KLEENE, [PANode(POp.PROP, [RDFS.subClassOf])]),
                        ],
                    ),
                    SANode(Op.HASVALUE, [sh_class]),
                ],
                SH.ClassConstraintComponent,
            )
        )

    # sh:datatype
    for sh_datatype in _extract_parameter_values(graph, shapename, SH.datatype):
        conj_out.append(
            SANode(
                Op.TEST,
                [SH.DatatypeConstraintComponent, sh_datatype],
                SH.DatatypeConstraintComponent,
            )
        )

    # sh:nodeKind
    for sh_nodekind in _extract_parameter_values(graph, shapename, SH.nodeKind):
        conj_out.append(
            SANode(
                Op.TEST,
                [SH.NodeKindConstraintComponent, sh_nodekind],
                SH.NodeKindConstraintComponent,
            )
        )

    # numeric_range
    numeric_range_shape = _numeric_range_parse(graph, shapename)
    if numeric_range_shape:
        conj_out.append(numeric_range_shape)

    # length_range
    length_range_shape = _length_range_parse(graph, shapename)
    if length_range_shape:
        conj_out.append(length_range_shape)

    # sh:pattern
    flags = [
        sh_flags for sh_flags in _extract_parameter_values(graph, shapename, SH.flags)
    ]
    for sh_pattern in _extract_parameter_values(graph, shapename, SH.pattern):
        escaped_pattern = _escape_backslash(str(sh_pattern))
        # something strange is going on with character escapes
        # if a pattern contains a double backslash 'hello\\w' for example
        # it will be read by the rdflib parser as 'hello\w'
        conj_out.append(
            SANode(
                Op.TEST,
                [SH.PatternConstraintComponent, escaped_pattern, flags],
                SH.PatternConstraintComponent,
            )
        )

    return conj_out


def _length_range_parse(graph: Graph, shapename: Node) -> Optional[SANode]:
    # sh:minLength
    max_minlen = _max_literal(_extract_parameter_values(graph, shapename, SH.minLength))

    # sh:maxLength
    min_maxlen = _min_literal(_extract_parameter_values(graph, shapename, SH.maxLength))

    length_range = ["length_range"]
    if max_minlen is not None:
        length_range += [SH.MinLengthConstraintComponent, max_minlen]

    if min_maxlen is not None:
        length_range += [SH.MaxLengthConstraintComponent, min_maxlen]

    if len(length_range) > 1:
        return SANode(
            Op.TEST,
            length_range,
            tuple(filter(lambda x: isinstance(x, URIRef), length_range)),
        )


def _numeric_range_parse(graph: Graph, shapename: Node) -> Optional[SANode]:
    # sh:minInclusive / sh:minExclusive
    max_minincl = _max_literal(
        _extract_parameter_values(graph, shapename, SH.minInclusive)
    )
    max_minexcl = _max_literal(
        _extract_parameter_values(graph, shapename, SH.minExclusive)
    )

    # do we use min_exlusive? (instead of inclusive)
    min_exclusive = False
    if max_minincl is not None and max_minexcl is not None:
        min_exclusive = max_minexcl >= max_minincl
    elif max_minexcl is not None:
        min_exclusive = True

    # sh:maxInclusive / sh:maxExclusive
    min_maxincl = _min_literal(
        _extract_parameter_values(graph, shapename, SH.maxInclusive)
    )
    min_maxexcl = _min_literal(
        _extract_parameter_values(graph, shapename, SH.maxExclusive)
    )

    # do we use max_exlusive?
    max_exclusive = False
    if min_maxincl is not None and min_maxexcl is not None:
        max_exclusive = min_maxexcl < min_maxincl
    elif min_maxexcl is not None:
        max_exclusive = True

    # do we use numeric_min? was it present?
    numeric_min = max_minexcl is not None or max_minincl is not None

    # do we use numeric_max? was it present?
    numeric_max = min_maxexcl is not None or min_maxincl is not None

    # construct numeric min/max TEST children
    numeric_range = ["numeric_range"]
    if numeric_min and min_exclusive:
        numeric_range += [SH.MinExclusiveConstraintComponent, max_minexcl]
    if numeric_min and not min_exclusive:
        numeric_range += [SH.MinInclusiveConstraintComponent, max_minincl]
    if numeric_max and max_exclusive:
        numeric_range += [SH.MaxExclusiveConstraintComponent, min_maxexcl]
    if numeric_max and not max_exclusive:
        numeric_range += [SH.MaxInclusiveConstraintComponent, min_maxincl]

    if len(numeric_range) > 1:
        return SANode(
            Op.TEST,
            numeric_range,
            tuple(filter(lambda x: isinstance(x, URIRef), numeric_range)),
        )


def _max_literal(list: List[Literal], invert=False) -> Optional[Literal]:
    if len(list) == 0:
        return None

    m_lit = list[0]
    for lit in list:
        if not invert:
            m_lit = max(m_lit, lit)
        else:
            m_lit = min(m_lit, lit)

    return m_lit


def _min_literal(list: List[Literal]) -> Optional[Literal]:
    return _max_literal(list, invert=True)


def _value_parse(graph: Graph, shapename: Node) -> list[SANode]:
    conj_out = []
    for sh_value in _extract_parameter_values(graph, shapename, SH.hasValue):
        conj_out.append(SANode(Op.HASVALUE, [sh_value], SH.HasValueConstraintComponent))
    return conj_out


def _in_parse(graph: Graph, shapename: Node) -> list[SANode]:
    conj_out = []
    for sh_in in _extract_parameter_values(graph, shapename, SH["in"]):
        shacl_list = Collection(graph, sh_in)
        disj = SANode(Op.OR, [], SH.InConstraintComponent)
        for val in shacl_list:
            disj.children.append(SANode(Op.HASVALUE, [val]))
        conj_out.append(disj)
    return conj_out


def _closed_parse(graph: Graph, shapename: Node) -> list[SANode]:
    if (shapename, SH.closed, Literal(True)) not in graph:
        return []

    ignored = _extract_parameter_values(graph, shapename, SH.ignoredProperties)
    sh_ignored = []
    for ig in ignored:
        shacl_list = Collection(graph, ig)
        sh_ignored += list(shacl_list)

    direct_props = []
    for pshape in _extract_parameter_values(graph, shapename, SH.property):
        path = _extract_parameter_values(graph, pshape, SH.path)[0]
        if type(path) == URIRef:
            direct_props.append(path)

    closed_props = sh_ignored + direct_props
    children = [PANode(POp.PROP, [prop]) for prop in closed_props]
    return [SANode(Op.CLOSED, children, SH.ClosedConstraintComponent)]


def _card_parse(graph: Graph, path: PANode, shapename: Node) -> list[SANode]:
    smallest_min = _min_literal(
        _extract_parameter_values(graph, shapename, SH.minCount)
    )
    largest_max = _max_literal(_extract_parameter_values(graph, shapename, SH.maxCount))

    if smallest_min is None and largest_max is None:
        return []
    elif smallest_min is None:
        cc = SH.MaxCountConstraintComponent
    elif largest_max is None:
        cc = SH.MinCountConstraintComponent
    else:
        cc = (SH.MinCountConstraintComponent, SH.MaxCountConstraintComponent)

    return [
        SANode(
            Op.COUNTRANGE,
            [
                smallest_min if smallest_min is not None else Literal(0),
                largest_max,  # can be none
                path,
                SANode(Op.TOP, []),
            ],
            cc,
        )
    ]


def _pair_parse(graph: Graph, path: PANode, shapename: Node) -> list[SANode]:
    conj_out = []

    # sh:equals
    for eq in _extract_parameter_values(graph, shapename, SH.equals):
        conj_out.append(
            SANode(Op.EQ, [path, pparse(graph, eq)], SH.EqualsConstraintComponent)
        )

    # sh:disjoint
    for disj in _extract_parameter_values(graph, shapename, SH.disjoint):
        conj_out.append(
            SANode(Op.DISJ, [path, pparse(graph, disj)], SH.DisjointConstraintComponent)
        )

    # sh:lessThan
    for lt in _extract_parameter_values(graph, shapename, SH.lessThan):
        conj_out.append(
            SANode(
                Op.LESSTHAN, [path, pparse(graph, lt)], SH.LessThanConstraintComponent
            )
        )

    # sh:lessThanEq
    for lte in _extract_parameter_values(graph, shapename, SH.lessThanOrEquals):
        conj_out.append(
            SANode(
                Op.LESSTHANEQ,
                [path, pparse(graph, lte)],
                SH.LessThanOrEqualsConstraintComponent,
            )
        )

    return conj_out


def _qual_parse(graph: Graph, path: PANode, shapename: Node) -> list[SANode]:
    qual = _extract_parameter_values(graph, shapename, SH.qualifiedValueShape)
    qual_min = _extract_parameter_values(graph, shapename, SH.qualifiedMinCount)
    qual_max = _extract_parameter_values(graph, shapename, SH.qualifiedMaxCount)

    sibl = []
    if (shapename, SH.qualifiedValueShapesDisjoint, Literal(True)) in graph:
        parents = graph.subjects(SH.property, shapename)
        for parent in parents:
            for propshape in graph.objects(parent, SH.property):
                sibl += list(graph.objects(propshape, SH.qualifiedValueShape))

    conj_out = []
    for qvs in qual:
        result_qvs = SANode(Op.HASSHAPE, [qvs])  # normal qualifiedvalueshape

        if len(sibl) > 0:  # if there is a sibling, wrap it in an Op.AND
            result_qvs = SANode(Op.AND, [result_qvs])

        # for every sibling, add its negation, unless it is itself
        for s in sibl:
            if s == qvs:
                continue
            result_qvs.children.append(SANode(Op.NOT, [SANode(Op.HASSHAPE, [s])]))

        smallest_min = _min_literal(qual_min)
        largest_max = _max_literal(qual_max)
        if smallest_min is None and largest_max is None:
            continue
        elif smallest_min is None:
            cc = SH.QualifiedMaxCountConstraintComponent
        elif largest_max is None:
            cc = SH.QualifiedMinCountConstraintComponent
        else:
            cc = (
                SH.QualifiedMinCountConstraintComponent,
                SH.QualifiedMaxCountConstraintComponent,
            )

        conj_out.append(
            SANode(
                Op.COUNTRANGE,
                [
                    smallest_min if smallest_min is not None else Literal(0),
                    largest_max,  # can be None
                    path,
                    result_qvs,
                ],
                cc,
            )
        )

    return conj_out


def _all_parse(graph: Graph, path: PANode, shapename: Node) -> list[SANode]:
    conj_out = []
    forall_conj = (
        _shape_parse(graph, shapename)
        + _logic_parse(graph, shapename)
        + _tests_parse(graph, shapename)
        + _in_parse(graph, shapename)
        + _closed_parse(graph, shapename)
    )
    if forall_conj:
        conj_out.append(SANode(Op.FORALL, [path, SANode(Op.AND, forall_conj)]))

    for component in _value_parse(graph, shapename):
        conj_out.append(SANode(Op.COUNTRANGE, [Literal(1), None, path, component]))

    return conj_out


def _lang_parse(graph: Graph, path: PANode, shapename: Node) -> list[SANode]:
    conj_out = []

    # sh:languageIn
    literal_list = []
    for langin in _extract_parameter_values(graph, shapename, SH.languageIn):
        shacl_list = Collection(graph, langin)
        literal_list += [tag for tag in shacl_list]

    if literal_list:
        _out = SANode(
            Op.TEST,
            [SH.LanguageInConstraintComponent, literal_list],
            SH.LanguageInConstraintComponent,
        )
        conj_out.append(SANode(Op.FORALL, [path, _out]))

    # sh:uniqueLang
    if (shapename, SH.uniqueLang, Literal(True)) in graph:
        conj_out.append(SANode(Op.UNIQUELANG, [path], SH.UniqueLangConstraintComponent))

    return conj_out


def _extract_parameter_values(
    graph: Graph, shapename: Node, parameter: URIRef
) -> List[Node]:
    return list(graph.objects(shapename, parameter))


def _escape_backslash(string: str) -> str:
    new_string = ""
    for char in string:
        if char == "\\":
            new_string += "\\\\"
        else:
            new_string += char
    return new_string
