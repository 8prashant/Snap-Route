# Shortest Path Visualizer

Welcome to the Shortest Path Visualizer! This web application allows you to explore the shortest path in a graph using Dijkstra's algorithm. Visualize how the algorithm finds the shortest path between two nodes.

## Screenshot

![Homepage](https://github.com/8prashant/shortest-path-visualizer/blob/main/Screenshot.png)

## Features

- **Interactive Visualization:** Input the graph, select start and end nodes, and visualize the shortest path.
- **Node Highlighting:** Clearly see the nodes involved in the shortest path.
- **Clear and Reset:** Clear the graph and reset input values with a single click.

## Usage

1. Visit the [live demo site](https://dulcet-donut-3d861c.netlify.app/).
2. Input the graph details or use the default example.
   - **Number of Nodes:** Enter the total number of nodes in the graph.
   - **Edges (node1-node2-weight, ...):** Define the edges of the graph along with their weights.
   - Click the "Generate Graph" button to visualize the graph.
3. Select the source and target nodes.
4. Click the "Find Shortest Path" button to see the shortest path highlighted.
5. Use the "Clear" button to reset the graph and input values.

## Technologies Used

- [D3.js](https://d3js.org/): Data visualization library for creating interactive graphs.
- [Netlify](https://www.netlify.com/): Hosting platform for deploying the web application.

## Local Development

If you want to run the project locally:

1. Clone this repository.
2. Open `index.html` in your web browser.
3. Experiment with the visualization by inputting different node and edge values.

## Algorithm: Dijkstra's Algorithm

Dijkstra's algorithm is used to find the shortest path between two nodes in a graph. Here's a brief explanation of the algorithm:

### Initialization:

- Set the distance to the start node as 0 and to all other nodes as infinity.
- Create a priority queue to keep track of the nodes with the smallest distance.

### Priority Queue:

- Nodes are added to the priority queue based on their current distance.
- The node with the smallest distance is dequeued and processed first.

### Relaxation:

- For each neighboring node, check if the path to it through the current node is shorter than its current known distance.
- If yes, update the distance and enqueue the node.

### Algorithm Steps:

1. Initialize distances and priority queue.
2. Dequeue the node with the smallest distance.
3. Relax the edges by updating distances.
4. Repeat steps 2-3 until the destination node is dequeued.

### Pseudocode:

```plaintext
function dijkstraAlgorithm(graph, start, end):
    Initialize distances and priority queue
    Set distance[start] = 0

    while priority queue is not empty:
        current = dequeue smallest distance node

        if current == end:
            // Shortest path found
            break

        for neighbor in neighbors of current:
            calculate potential distance to neighbor
            if potential distance < distance[neighbor]:
                update distance[neighbor]
                enqueue neighbor with updated distance
