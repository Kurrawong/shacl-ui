# SHACL UI

A Python implementation of SHACL UI generation.

## Existing Python SHACL processors/parsers

- pySHACL
- slsparser

## SHACL UI Parser

- Get the Concise Bounded Description (CBD) of the focus node
- Get the node shapes that target this focus node
- User selects a node shape to generate UI
- Walk the CBD to extract a SHACL UI (SHUI) tree, applying default widgets for each value nodes
- Implement the same logic from pySHACL to:
  - Extract the SHACL shapes from the SHACL graph
  - For each shape, implement a variation of `Shape.validate` method to extract the Constraint Components for each parameter on the shape while tracking the path
    - For each Constraint Component, apply the SHUI component to that node in the above SHUI tree
