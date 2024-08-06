# SHACL UI

This repository implements the following as a SHACL _User-Interface_ processor:

- SHACL shape extraction
- SHACL Constraint Component extraction
- SHACL NodeShape visitor
- Map of SHACL parameters to Constraint Components
- DASH widget score calculator and widget extraction
- Vue component implementation of base RDF widgets, DASH widgets, and custom widgets

This is still a work-in-progress. A storybook demo of the SHACL UI processor will be available on GitHub Pages soon.

## User Guide

## SHACL UI Specification

### Parameter `sh:closed`

The existence of a `sh:ClosedConstraintComponent` with the value `true` disables the ability to add new properties to a focus node in the user-interface.

## Developer Guide

### Adding new UI widgets

1. Create the new widget component in `src/components/dash/editors`.
1. Register the widget in [src/core/widgets/score-widget.ts](src/core/widgets/score-widget.ts).
   1. Register the IRI of the widget.
   1. Register an anonymous function which calculates the scoring for the widget based on the value and the constraint components.
   1. Check that all of the constraint components required to score the widget is implemented in `src/core/constraint-components`.

## Library Architecture

TBA

## License

TBA

## Contact

TBA
