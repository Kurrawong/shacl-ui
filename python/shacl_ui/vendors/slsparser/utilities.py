from typing import Dict

from rdflib import Literal

from shacl_ui.vendors.slsparser.shapels import Op, SANode


def expand_shape(definitions: Dict, node: SANode) -> SANode:
    """Removes all hasshape references and replaces them with shapes"""

    if node.op == Op.HASSHAPE:
        if node.children[0] not in definitions:
            return SANode(Op.TOP, [])  # mimics real SHACL semantics
        return expand_shape(definitions, definitions[node.children[0]])

    new_children = []
    for child in node.children:
        new_child = child
        if type(child) == SANode:
            new_child = expand_shape(definitions, child)
        new_children.append(new_child)
    return SANode(node.op, new_children)


def negation_normal_form(node: SANode) -> SANode:
    # The input should be a node without that has no HASSHAPE in its tree (it is expanded)
    if node.op != Op.NOT:
        new_children = []
        for child in node.children:
            if type(child) != SANode:
                new_children.append(child)
            else:
                new_children.append(negation_normal_form(child))
        return SANode(node.op, new_children)

    nnode = node.children[0]
    if nnode.op == Op.AND:
        new_children = []
        for child in nnode.children:
            new_children.append(negation_normal_form(SANode(Op.NOT, [child])))
        return SANode(Op.OR, new_children)

    if nnode.op == Op.OR:
        new_children = []
        for child in nnode.children:
            new_children.append(negation_normal_form(SANode(Op.NOT, [child])))
        return SANode(Op.AND, new_children)

    if nnode.op == Op.NOT:
        return nnode.children[0]

    if nnode.op == Op.COUNTRANGE:
        new_children = []
        if nnode.children[1] is not None:
            new_children.append(
                SANode(
                    Op.COUNTRANGE,
                    [
                        nnode.children[1],
                        None,
                        nnode.children[2],
                        negation_normal_form(SANode(Op.NOT, [nnode.children[3]])),
                    ],
                )
            )
        if nnode.children[0] != 0:
            new_children.append(
                SANode(
                    Op.COUNTRANGE,
                    [
                        0,
                        nnode.children[0],
                        nnode.children[2],
                        negation_normal_form(SANode(Op.NOT, [nnode.children[3]])),
                    ],
                )
            )

        return SANode(Op.OR, new_children)

    if nnode.op == Op.FORALL:
        return SANode(
            Op.COUNTRANGE,
            [
                Literal(1),
                None,
                nnode.children[0],
                negation_normal_form(SANode(Op.NOT, [nnode.children[1]])),
            ],
        )
    # We do not consider HASSHAPE as this function works on expanded shapes
    return node


def clean_parsetree(sanode: SANode, full: bool = True) -> SANode:
    """
    This function goes through the tree in post-order. It performs the
    following transformations:
    - Replace NOT TOP by BOT
    - Replace NOT BOT by TOP
    - Remove TOP from AND. If empty AND, replace by TOP.
    - Replace AND containing BOT by BOT
    - Replace AND with single child by child
    - Remove BOT from OR. If empty OR, replace by BOT.
    - Replace OR containing TOP by TOP
    - Replace OR with single child by child
    - Replace FORALL E TOP by TOP
    - Replace FORALL E BOT by COUNTRANGE 0 0 E TOP
    - Replace COUNTRANGE n m E BOT by:
        - BOT if n is not 0
        - TOP else
    """

    new_children = []
    for child in sanode.children:
        if type(child) == SANode:
            new_child = clean_parsetree(child, full)
            new_children.append(new_child)
        else:
            new_children.append(child)

    if full and sanode.constraintComponent is not None:
        return sanode

    new_node = SANode(sanode.op, new_children)

    if new_node.op == Op.NOT:
        if new_node.children[0].op == Op.TOP:
            return SANode(Op.BOT, [])
        if new_node.children[0].op == Op.BOT:
            return SANode(Op.TOP, [])

    if new_node.op == Op.AND:
        if any(map(lambda c: c.op == Op.BOT, new_node.children)):
            return SANode(Op.BOT, [])

        if any(map(lambda c: c.op == Op.TOP, new_node.children)):
            new_node.children = list(
                filter(lambda c: c.op != Op.TOP, new_node.children)
            )
            if not new_node.children:
                return SANode(Op.TOP, [])
            # return new_node

    if new_node.op == Op.OR:
        if any(map(lambda c: c.op == Op.TOP, new_node.children)):
            return SANode(Op.TOP, [])

        if any(map(lambda c: c.op == Op.BOT, new_node.children)):
            new_node.children = list(
                filter(lambda c: c.op != Op.BOT, new_node.children)
            )
            if not new_node.children:
                return SANode(Op.BOT, [])
            # return new_node

    if new_node.op in [Op.AND, Op.OR] and len(new_node.children) == 1:
        return new_node.children[0]

    if new_node.op == Op.FORALL:
        if new_node.children[1].op == Op.TOP:
            return SANode(Op.TOP, [])
        if new_node.children[1].op == Op.BOT:
            return SANode(
                Op.COUNTRANGE, [0, 0, new_node.children[0], SANode(Op.TOP, [])]
            )

    if new_node.op == Op.COUNTRANGE and new_node.children[3].op == Op.BOT:
        if new_node.children[0] == 0:
            return SANode(Op.TOP, [])
        return SANode(Op.BOT, [])

    return new_node
