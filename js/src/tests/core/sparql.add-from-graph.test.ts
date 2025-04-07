import { expect, test } from '@jest/globals'
import { rewriteSparqlAutoComplete } from '@/core/sparql'
import { DataFactory } from 'n3'
import namedNode = DataFactory.namedNode

test('', () => {
  const query = rewriteSparqlAutoComplete(
    `
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    CONSTRUCT { ?resource1 skos:inScheme ?resource2. }
    FROM <https://example.com/graph>
    WHERE {
      ?resource1 a skos:Concept .
      ?resource1 skos:inScheme ?resource2.
      VALUES ?resource2 {
        <https://example.com/concept-scheme>
      }
    }
  `,
    [],
    namedNode('https://example.com/graph')
  )

  expect(query).toContain('FROM <https://example.com/graph>')
})
