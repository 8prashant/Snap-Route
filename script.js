let graph = {
  nodes: [],
  links: [],
};

let adjacencyList = {};

const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");

const simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(d => d.id).distance(70).strength(0.5))  // Adjust the strength value
  .force("charge", d3.forceManyBody())
  .force("center", d3.forceCenter(width / 2, height / 2));

function generateGraph() {
  const numNodes = parseInt(document.getElementById("numNodes").value, 10);
  const edgesInput = document.getElementById("edges").value;

  graph.nodes = Array.from({ length: numNodes }, (_, i) => ({
    id: i.toString(),
    x: width / 2,
    y: height / 2,
  }));

  const edges = edgesInput.split(',').map(edge => edge.trim());

  graph.links = [];
  edges.forEach(edge => {
    const [source, target, weight] = edge.split('-').map(node => node.trim());
    const numericWeight = parseFloat(weight) || 1;

    if (graph.nodes.find(node => node.id === source) && graph.nodes.find(node => node.id === target)) {
      graph.links.push({ source, target, weight: numericWeight });
    }
  });

  adjacencyList = {};
  graph.links.forEach(link => {
    if (!adjacencyList[link.source]) {
      adjacencyList[link.source] = [];
    }
    adjacencyList[link.source].push({ target: link.target, weight: link.weight });

    if (!adjacencyList[link.target]) {
      adjacencyList[link.target] = [];
    }
    adjacencyList[link.target].push({ target: link.source, weight: link.weight });
  });

  updateGraph();
  updateNodeDropdowns(); // Add this line to update the source and target node dropdowns
}

function updateNodeDropdowns() {
  const sourceNodeSelect = document.getElementById("sourceNode");
  const targetNodeSelect = document.getElementById("targetNode");

  sourceNodeSelect.innerHTML = "";
  targetNodeSelect.innerHTML = "";

  graph.nodes.forEach(node => {
    const option = document.createElement("option");
    option.value = node.id;
    option.text = node.id;

    sourceNodeSelect.add(option.cloneNode(true));
    targetNodeSelect.add(option);
  });
}

function updateGraph() {
  svg.selectAll(".link").remove();
  svg.selectAll(".node").remove();
  svg.selectAll(".label").remove();

  simulation.stop();

  simulation.nodes(graph.nodes);
  simulation.force("link").links(graph.links);

  const link = svg.selectAll(".link")
    .data(graph.links, d => `${d.source}-${d.target}`)
    .enter().append("line")
    .attr("class", "link");

  const node = svg.selectAll(".node")
    .data(graph.nodes, d => d.id)
    .enter().append("circle")
    .attr("class", "node")
    .attr("r", 20)
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  const label = svg.selectAll(".label")
    .data(graph.nodes, d => d.id)
    .enter().append("text")
    .attr("class", "label")
    .attr("dx", d => d.x)
    .attr("dy", d => d.y)
    .text(d => d.id);

  setTimeout(function () {
    simulation.on("tick", ticked);
    simulation.alphaTarget(0.3).restart();
  }, 10);

  function ticked() {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

    label
      .attr("dx", d => d.x)
      .attr("dy", d => d.y);
  }
}

function dragstarted(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(event, d) {
  d.fx = event.x;
  d.fy = event.y;
}

function dragended(event, d) {
  if (!event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

function dijkstra(graph, start) {
  const distances = {};
  const previous = {};
  const pq = new PriorityQueue();

  graph.nodes.forEach(node => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
    pq.enqueue(node.id, Infinity);
  });

  distances[start.id] = 0;
  pq.decreasePriority(start.id, 0);

  while (!pq.isEmpty()) {
    const current = pq.dequeue();

    if (!adjacencyList[current]) continue;

    adjacencyList[current].forEach(neighbor => {
      const alt = distances[current] + neighbor.weight;

      if (alt < distances[neighbor.target]) {
        distances[neighbor.target] = alt;
        previous[neighbor.target] = current;
        pq.decreasePriority(neighbor.target, alt);
      }
    });
  }

  const shortestPaths = {};
  graph.nodes.forEach(node => {
    shortestPaths[node.id] = getPath(previous, node.id);
  });

  return {
    shortestPaths,
    distances,
  };
}

function getPath(previous, nodeId) {
  const path = [];
  let current = nodeId;

  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  return path;
}

class PriorityQueue {
  constructor() {
    this.nodes = [];
  }

  enqueue(node, priority) {
    this.nodes.push({ node, priority });
    this.sort();
  }

  dequeue() {
    return this.nodes.shift().node;
  }

  decreasePriority(node, newPriority) {
    this.nodes.forEach(item => {
      if (item.node === node) {
        item.priority = newPriority;
      }
    });
    this.sort();
  }

  isEmpty() {
    return this.nodes.length === 0;
  }

  sort() {
    this.nodes.sort((a, b) => a.priority - b.priority);
  }
}

function highlightShortestPath(shortestPaths, startNode, endNode) {
  const shortestPath = shortestPaths[endNode];

  // Select all nodes and update their class and color with a delay
  svg.selectAll(".node")
    .data(graph.nodes)
    .transition()
    .delay((d, i) => shortestPath.includes(d.id) ? shortestPath.indexOf(d.id) * 500 : 0) // Adjust the delay duration
    .duration(500)
    .attr("class", d => shortestPath.includes(d.id) ? "node highlighted" : "node")
    .style("fill", d => shortestPath.includes(d.id) ? "red" : "steelblue");
}


function findShortestPath() {
  const sourceNodeId = document.getElementById("sourceNode").value;
  const targetNodeId = document.getElementById("targetNode").value;

  const startNode = graph.nodes.find(node => node.id === sourceNodeId);
  const endNode = graph.nodes.find(node => node.id === targetNodeId);

  if (startNode && endNode) {
    // Clear previous highlighting
    svg.selectAll(".node").attr("class", "node");

    if (startNode.id === endNode.id) {
      // Highlight the single node if source and target are the same
      svg.selectAll(".node")
        .filter(d => d.id === startNode.id)
        .attr("class", "node highlighted");
    } else {
      const { shortestPaths, distances } = dijkstra(graph, startNode);
      const shortestPath = shortestPaths[endNode.id];
      console.log(shortestPath);

      if (shortestPath && shortestPath.length > 1) {
        // Display the nodes in the shortest path on the web page
        displayShortestPathNodes(shortestPath);

        highlightShortestPath(shortestPaths, startNode.id, endNode.id);
      } else {
        alert(`No valid path from node ${startNode.id} to node ${endNode.id}`);
      }
    }
  } else {
    alert("Invalid source or target node selected");
  }
}

function displayShortestPathNodes(nodes) {
  const shortestPathNodesContainer = document.getElementById("shortestPathNodes");
  shortestPathNodesContainer.innerHTML = ""; // Clear previous content

  nodes.forEach((node, index) => {
    const nodeId = `shortestPathNode_${index}`;
    const nodeElement = document.createElement("div");
    nodeElement.id = nodeId;
    nodeElement.classList.add("shortest-path-node");
    nodeElement.textContent = node;
    
    shortestPathNodesContainer.appendChild(nodeElement);
  });
}

