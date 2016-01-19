/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';


/**
 * Topologically sort a directed graph.
 *
 * @param edges - The array of edges to add to the graph. Each
 *   edge is represented as a 2-tuple of `[fromNode, toNode]`.
 *
 * @returns The sorted array of nodes. If a cycle is present in
 *   the graph, the return value will be approximately sorted.
 *
 * #### Notes
 * The order of the edges in the input array is irrelevant. Their
 * order will be normalized before sorting to ensure a repeatable
 * solution.
 */
export
function topSort(edges: Array<[string, string]>): string[] {
  let sorted: string[] = [];
  let graph: { [node: string]: string[] } = Object.create(null);
  let visited: { [node: string]: boolean } = Object.create(null);
  edges.slice().sort(edgeCmp).forEach(addEdge);
  Object.keys(graph).sort().forEach(visit);
  return sorted;

  function edgeCmp([a]: [string, string], [b]: [string, string]): number {
    return a < b ? -1 : a > b ? 1 : 0;
  }

  function addEdge([fromNode, toNode]: [string, string]): void {
    if (!(fromNode in graph)) {
      graph[fromNode] = [];
    }
    if (!(toNode in graph)) {
      graph[toNode] = [];
    }
    graph[toNode].push(fromNode);
  }

  function visit(node: string): void {
    if (node in visited) return;
    visited[node] = true;
    graph[node].forEach(visit);
    sorted.push(node);
  }
}
