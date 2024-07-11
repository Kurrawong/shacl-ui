Sourced from https://github.com/MaximeJakubowski/sls_project 2024-07-04.

# SHACL Logical Syntax parser

This project was originally used as a sub-package for experiments done for our work on [Provenance for SHACL](https://github.com/Shape-Fragments), [paper](https://openproceedings.org/2023/conf/edbt/paper-3.pdf).

However, this logical syntax parser can be used for multiple purposes so this project extends and publishes it as its own package.

## Features

The idea is to have the following functionality:
- Parsing a SHACL shapes graph into a parse tree of the [SHACL Logical Syntax](https://www.mjakubowski.info/files/shacl.pdf)
- Given a parse tree of the logical syntax, output a SHACL shapes graph

This framework allows for more shapes than you currently can write with W3C SHACL. However, every shape that you can write in W3C SHACL can be written in this framework. 

## Data Structure

When you parse a SHACL shapes graph, the output is a tuple of two dictionaries.
- The first dictionary represent all the shape definitions. The keys are rdflib IdentifiedNode objects. The values are SANode objects.
- The second dictionary represent all target statements. The keys are rdflib IdentifiedNode objects. The values are SANode objects.

### SANodes
A SANode is an object that represents a shape. The underlying idea is that this is a syntax tree of the logical syntax representation of a shape. It consists of two components:
- a type, which is an Enum called Op
- a list of children, the elements of this list are dependent on the Op

### Op
There are more/other Op types than there are defined in the logical syntax in the paper. Mostly out of efficiency conciderations.

- Op.HASVALUE has one rdflib IdentifiedNode or Literal object as a child. Only the value itself satisfies this shape.
- Op.TEST has different children, depending on what kind of test it represents.

The first child is an IRI with the corresponding contraint component. The list of children can be:

- [sh:LanguageInConstraintComponent ...]
- [sh:DatatypeConstraintComponent, xsd:string] or other datatypes
- [sh:NodeKindConstraintComponent, sh:iri] or other: any of the six combinations
- [sh:PatternConstraintComponent, patternstring, flags]
- [numeric_range, <range_statement>, \<value>]
    - <range_statement> is one of: sh:MinExclusiveConstraintComponent, sh:MaxExclusiveConstraintComponent, sh:MinInclusiveConstraintComponent, sh:MaxInclusiveConstraintComponent
    - \<value> is an rdflib literal (numeric) value There is at most one of min_... and at most one of max_... followed by a value
    - [length_range, <range_statement>, \<value>]
        - <range_statement> is one of: sh:MinLengthConstraintComponent, sh:MaxLengthConstraintComponent
        - - \<value> is an rdflib literal (numeric) value
    - There is at most one of min_... and at most one of max_... followed by a value

- Op.NOT has one SANode object as a child. The shape is satisfied if the shape represented by the child is not satisfied.
- Op.AND has one or more SANode objects as children. The shape is satisfied if all the shapes represented by the children are satisfied.
- Op.OR has one or more SANode objects as children. The shape is satisfied if at least one of the shapes represented by the children is satisfied. 
- Op.HASSHAPE has one rdflib IdentifiedNode as a child. The IdebtifiedNode represents a shape name. The shape is satisfied if the shape corresponding to the shapename is satisfied.
- Op.FORALL has exactly two children. The first is a PANode representing a path expression. The second is an SANode representing a shape. A node satisfies the forall shape, if all nodes reachable by the path expression satisfy the shape represented by the SANode.
- Op.EQ has exactly two children. Both are PANode objects representing path expressions. A node satisfies this shape if the set of nodes reachable by the first path expression is equal to the set of nodes reachable by the second path expression.
- Op.DISJ has exactly two children. Both are PANode objects representing path expressions. A node satisfies this shape if the set of nodes reachable by the first path expression is disjoint from the set of nodes reachable by the second path expression.
- Op.CLOSED has one or more rdflib uriref objects as children. The shape is satisfied by nodes that are only subjects of triples that have a predicate present in the list of children.
- Op.LESSTHAN has exactly two children. Both are PANodes.
- Op.LESSTHANEQ has exactly two children. Both are PANodes.
- Op.UNIQUELANG has exactly one PANode child.
- Op.TOP has no children. All nodes satisfy this shape.
- Op.BOT has no children. No node satisfies this shape.

### PANodes
A PANode is an object that represent a path expression. It is very similar to the structure of the SANode. The underlying idea is that this is a syntax tree of the path expressions. It consists of two components:
- a type, which is an Enum called POp
- a list of children, the elements of this list are dependent on the POp

### POp
There are several POp types:
- POp.PROP has one child, which is an URIRef representing a property name. It represents a simple property name.
- POp.INV has one child, which is a PANode. It represents the inverse of that PANode.
- POp.ZEROORONE has one child, which is a PANode. It represents the zero-or-one path expression.
- POp.ALT has one or more children, which are PANodes. It represents the alternative path expression.
- POp.KLEENE has one child, which is a PANode. It represents the zero-or-more path expression.
- POp.COMP has one or more children, which are PANodes. It represents the sequence path expression.
- POp.ID has no children. It represents the identity path expression. It is used to represent the path from which every node can only reach itself. It has no W3C SHACL standard counterpart, however it is useful to express some shapes.

## Use

The main function is `slsparser.shapels.parse(graph: rdflib.Graph)`. This function has as its argument an rdflib Graph object that represents the shapesgraph (your SHACL turtle file). It returns a tuple of dictionaries. The first dictionary represents the shape definitions. The keys are all the shape names that were defined in the shapesgraph. These are represented by rdflib Identifiers. The values are SANodes. The second dictionary represents the targeting statements for every shape that has one. The keys are the shapes with targeting statements, and the values are SANodes representing the targeting type.

## Contact
The package is to be used for my research purposes, but it may be useful for other applications. If you are interested, please let me know. Currently, I'm working on an [alternative SHACL syntax](https://github.com/MaximeJakubowski/shacl_esyntax) based on the SHACL Logical Syntax.