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

### Widget `dash:AutoCompleteEditor` implementation

#### What label property to use to perform autocompletion?

By default, use `rdfs:label`. It is the most generic label property. Via config, this property may be overridable.

#### Autocompletion implementation details for:

- `n3.Store`
- HTTP API
- HTTP API implementation - Fuseki

Implementations should always look in the local browser `n3.Store` first and if any HTTP API interfaces are available, merge the results and display as the autocomplete values. Results should indicate whether they are from the local store or remote and they should be prioritised with local first.

#### This widget is available with a score of 1 if the value is an IRI

- By default, all instances will be available for autocompletion. A sensible default to retrieve up to a maximum of, say 100 values, needs to be enforced.
- If the `sh:class` parameter exists, the autocomplete values will be filtered by its class.
- Additionally, if `sh:node` parameter exists, the values for autocompletion will be further filtered.

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
