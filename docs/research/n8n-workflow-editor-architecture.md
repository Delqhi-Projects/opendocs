# n8n Workflow Editor Architecture - Research Report

**Project:** OpenDocs n8n Visual Integration  
**Date:** 2026-02-17  
**Goal:** Understand n8n's workflow editor implementation for OpenDocs integration

---

## 1. n8n Architecture Overview

### Core Principles

n8n ist ein **Fair-Code** Workflow-Automation-Platform mit:

- **Monorepo-Struktur** (TypeScript 91.3%)
- **400+ Integrationen** als Nodes
- **Visual Editor** basierend auf Vue.js (nicht React!)
- **JSON-basierte Workflow-Speicherung**

### n8n Workflow JSON Structure

Das ist das Herzstück - die Workflows werden als JSON gespeichert:

```json
{
  "version": "1.0",
  "name": "My Workflow",
  "id": "workflow_123",
  "nodes": [
    {
      "id": "node_1",
      "name": "HTTP Request",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3.2,
      "position": [250, 300],
      "parameters": {
        "url": "https://api.example.com/data",
        "method": "GET",
        "options": {}
      },
      "credentials": {
        "httpHeaderAuth": "my-credential"
      }
    },
    {
      "id": "node_2",
      "name": "Slack",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 3.1,
      "position": [650, 300],
      "parameters": {
        "channel": "#general",
        "text": "={{ $json.data }}"
      }
    }
  ],
  "connections": {
    "HTTP Request": {
      "main": [
        [
          {
            "node": "Slack",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "settings": {
    "executionOrder": "v1"
  },
  "active": false
}
```

### Connection Structure (Critical!)

```
connections: {
  [SOURCE_NODE_NAME]: {
    [OUTPUT_TYPE]: [  // z.B. "main", "ai"
      [  // Array of output branches (0, 1, 2...)
        [
          {
            "node": "TARGET_NODE_NAME",
            "type": "main",
            "index": 0
          }
        ]
      ]
    ]
  }
}
```

**Key Insight:** Die Connection-Keys sind **Node-Namen** (nicht IDs), und jede Node kann mehrere Output-Typen haben (main, ai, etc.).

---

## 2. n8n Node Type System

### Node Interface (aus n8n's Interfaces.ts)

```typescript
interface INode {
  id: string;
  name: string;
  type: string; // z.B. "n8n-nodes-base.httpRequest"
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
  disabled?: boolean;
}
```

### Node Definition Structure

Jeder n8n-Node hat:

1. **Type** - eindeutige ID (z.B. `n8n-nodes-base.httpRequest`)
2. **TypeVersion** - für Breaking Changes
3. **Parameters** - JSON mit allen UI-Feldern
4. **Credentials** - Referenzen zu gespeicherten Credentials
5. **Position** - [x, y] auf dem Canvas

### Wie n8n Nodes registriert werden

```typescript
// Backend (packages/workflow/src)
interface INodeType {
  properties: INodeProperties[];

  // Methods
  execute(this: IExecuteFunctions): Promise<INodeExecutionData[]>;
  getNodeExecutionData(): Promise<INodeExecutionData[]>;
}

// Registration
nodeTypes.register("n8n-nodes-base.httpRequest", {
  properties: [
    {
      name: "URL",
      type: "string",
      required: true,
      default: "",
      placeholder: "https://...",
      displayName: "URL",
      typeOptions: {
        password: false,
      },
    },
    {
      name: "Method",
      type: "options",
      default: "GET",
      options: [
        { name: "GET", value: "GET" },
        { name: "POST", value: "POST" },
      ],
    },
  ],
  async execute() {
    /* ... */
  },
});
```

---

## 3. React Flow / XYFlow Implementation

### Was n8n nutzt

**n8n nutzt NICHT React Flow!** Sie haben einen eigenen Vue-basierten Editor. Aber für eine React-basierte Lösung (wie OpenDocs) ist **XYFlow** (vormals React Flow) die beste Wahl.

### XYFlow Core Concepts

#### Nodes

```typescript
import { Node, Position } from "@xyflow/react";

interface MyNodeData {
  label: string;
  nodeType: string;
  parameters: Record<string, any>;
  status?: "success" | "error" | "running";
}

const initialNodes: Node<MyNodeData>[] = [
  {
    id: "1",
    type: "customNode",
    position: { x: 250, y: 300 },
    data: {
      label: "HTTP Request",
      nodeType: "n8n-nodes-base.httpRequest",
      parameters: { url: "https://api.example.com", method: "GET" },
    },
  },
];
```

#### Edges (Connections)

```typescript
import { Edge } from "@xyflow/react";

const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "default", // bezier
    animated: true, // läuft gerade
    label: "Data Flow",
    sourceHandle: "main-0", // Output 0 von "main"
    targetHandle: "main-0", // Input 0 von "main"
  },
];
```

---

## 4. Custom Node Implementation Patterns

### Basic Custom Node mit Handles

```tsx
// components/N8nNode.tsx
import { Handle, Position, NodeProps } from "@xyflow/react";

interface N8nNodeData {
  label: string;
  nodeType: string;
  icon?: string;
  color?: string;
  parameters: Record<string, any>;
  status?: "idle" | "running" | "success" | "error";
}

export function N8nNode({ data, selected }: NodeProps<N8nNodeData>) {
  return (
    <div className={`n8n-node ${selected ? "selected" : ""}`}>
      {/* Header mit Icon und Name */}
      <div
        className="node-header"
        style={{ background: data.color || "#0078d4" }}
      >
        <span className="node-icon">{data.icon || "⬡"}</span>
        <span className="node-label">{data.label}</span>
      </div>

      {/* Input Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        id="main-input"
        className="n8n-handle"
      />

      {/* Body mit Parameter-Vorschau */}
      <div className="node-body">
        <pre>{JSON.stringify(data.parameters, null, 2)}</pre>
      </div>

      {/* Output Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        id="main-output"
        className="n8n-handle"
      />
    </div>
  );
}
```

### Multiple Handles (n8n Style)

```tsx
// components/N8nNodeMultiHandle.tsx
export function N8nNodeMultiHandle({ data }: NodeProps<N8nNodeData>) {
  const outputHandles = [
    { id: "main-0", label: "Output 1" },
    { id: "main-1", label: "Output 2 (Error)" },
    { id: "ai-0", label: "AI Output" },
  ];

  return (
    <div className="n8n-node">
      {/* Input Handle */}
      <Handle type="target" position={Position.Left} id="main-0" />

      {/* Multiple Output Handles */}
      {outputHandles.map((handle, index) => (
        <Handle
          key={handle.id}
          type="source"
          position={Position.Right}
          id={handle.id}
          style={{ top: `${30 + index * 25}%` }}
        />
      ))}

      {/* Node Content */}
      <div className="node-content">{data.label}</div>
    </div>
  );
}
```

---

## 5. Bezier Connections (n8n Style)

### Custom Bezier Edge

```tsx
// components/N8nEdge.tsx
import {
  BaseEdge,
  getBezierPath,
  EdgeProps,
  useReactFlow,
} from "@xyflow/react";

export function N8nEdge({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  });

  return (
    <>
      {/* Shadow for selection */}
      {selected && (
        <path
          d={edgePath}
          fill="none"
          stroke="#0078d4"
          strokeWidth={8}
          strokeOpacity={0.3}
        />
      )}

      {/* Main Edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: data?.status === "error" ? "#ff4444" : "#0078d4",
          strokeWidth: 2,
          strokeDasharray: data?.running ? "5,5" : "none",
        }}
        className={`edge ${selected ? "selected" : ""}`}
      />

      {/* Animated dot for running */}
      {data?.running && (
        <circle r="4" fill="#0078d4">
          <animateMotion dur="1s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
    </>
  );
}
```

### Connection Line (Drag to Connect)

```tsx
// components/N8nConnectionLine.tsx
import { ConnectionLineComponent } from "@xyflow/react";
import { getBezierPath, Position } from "@xyflow/react";

export const N8nConnectionLine: ConnectionLineComponent = ({
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  sourceNode,
}) => {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke="#0078d4"
        strokeWidth={2}
        className="connection-line"
      />
      <circle
        cx={targetX}
        cy={targetY}
        r="4"
        fill="#fff"
        stroke="#0078d4"
        strokeWidth={2}
      />
    </g>
  );
};
```

---

## 6. Node Parameter Sync Strategy

### Das Problem

n8n hat eine komplexe Parameter-Sync zwischen:

1. **Node Definition** (JSON Schema)
2. **UI Form** (Vue Components)
3. **Runtime Parameters** (Actual values)

### Lösung für OpenDocs

```typescript
// types/n8n.ts
export interface N8nNodeDefinition {
  name: string; // Display Name
  type: string; // z.B. "n8n-nodes-base.httpRequest"
  icon: string; // Icon URL or emoji
  description: string;
  version: number;

  // Input/Output Handles
  inputs: string[]; // ["main", "ai"]
  outputs: string[]; // ["main", "main-error", "ai"]

  // Parameter Schema
  properties: N8nProperty[];
}

export interface N8nProperty {
  name: string;
  type: "string" | "number" | "boolean" | "options" | "collection";
  displayName: string;
  required?: boolean;
  default?: any;
  placeholder?: string;
  description?: string;
  options?: { name: string; value: string }[];
  typeOptions?: {
    password?: boolean;
    rows?: number;
    codeEditor?: string;
  };
}

// Runtime Node Instance
export interface N8nNodeInstance {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
}
```

### Parameter Editor Component

```tsx
// components/NodeParameterEditor.tsx
import { useState, useEffect } from "react";
import { N8nProperty } from "../types/n8n";

interface Props {
  nodeDefinition: N8nNodeDefinition;
  parameters: Record<string, any>;
  onChange: (params: Record<string, any>) => void;
}

export function NodeParameterEditor({
  nodeDefinition,
  parameters,
  onChange,
}: Props) {
  return (
    <div className="parameter-editor">
      {nodeDefinition.properties.map((prop) => (
        <div key={prop.name} className="parameter-field">
          <label>
            {prop.displayName}
            {prop.required && <span className="required">*</span>}
          </label>

          {prop.type === "string" && (
            <input
              type={prop.typeOptions?.password ? "password" : "text"}
              value={parameters[prop.name] || prop.default || ""}
              onChange={(e) =>
                onChange({ ...parameters, [prop.name]: e.target.value })
              }
              placeholder={prop.placeholder}
            />
          )}

          {prop.type === "options" && (
            <select
              value={parameters[prop.name] || prop.default}
              onChange={(e) =>
                onChange({ ...parameters, [prop.name]: e.target.value })
              }
            >
              {prop.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.name}
                </option>
              ))}
            </select>
          )}

          {prop.type === "collection" && (
            <CollectionParameter
              prop={prop}
              value={parameters[prop.name] || []}
              onChange={(val) => onChange({ ...parameters, [prop.name]: val })}
            />
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 7. Complete Integration Architecture

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     OpenDocs Application                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                   │
│  │   React Flow    │    │  Node Palette   │                   │
│  │   (Canvas)      │    │  (Left Panel)   │                   │
│  │                 │    │                 │                   │
│  │  [Nodes Render] │◄───│ [Drag & Drop]  │                   │
│  │  [Edges Draw]  │    │                 │                   │
│  └────────┬────────┘    └────────┬────────┘                   │
│           │                     │                             │
│           ▼                     ▼                             │
│  ┌─────────────────────────────────────────────┐              │
│  │           State Management (Zustand)        │              │
│  │  • nodes: N8nNodeInstance[]                │              │
│  │  • edges: Edge[]                           │              │
│  │  • selectedNode: string | null             │              │
│  │  • nodeDefinitions: N8nNodeDefinition[]    │              │
│  └──────────────────────┬──────────────────────┘              │
│                         │                                      │
│                         ▼                                      │
│  ┌─────────────────────────────────────────────┐              │
│  │          JSON Workflow Export                │              │
│  │  { nodes: [...], connections: {...} }      │              │
│  └─────────────────────────────────────────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Zustand Store

```typescript
// store/workflowStore.ts
import { create } from "zustand";
import { Node, Edge } from "@xyflow/react";
import {
  N8nNodeInstance,
  N8nNodeDefinition,
  N8nConnectionMap,
} from "../types/n8n";

interface WorkflowState {
  // React Flow state
  nodes: Node[];
  edges: Edge[];

  // n8n metadata
  nodeDefinitions: Map<string, N8nNodeDefinition>;
  selectedNodeId: string | null;

  // Actions
  addNode: (definition: N8nNodeDefinition, position: [number, number]) => void;
  updateNodeParameters: (nodeId: string, params: Record<string, any>) => void;
  connectNodes: (
    source: string,
    sourceHandle: string,
    target: string,
    targetHandle: string,
  ) => void;

  // Export to n8n JSON
  exportToN8nFormat: () => {
    nodes: N8nNodeInstance[];
    connections: N8nConnectionMap;
  };
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  nodeDefinitions: new Map(),
  selectedNodeId: null,

  addNode: (definition, position) => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: "n8nNode",
      position: { x: position[0], y: position[1] },
      data: {
        label: definition.name,
        nodeType: definition.type,
        parameters: {},
        icon: definition.icon,
      },
    };
    set((state) => ({ nodes: [...state.nodes, newNode] }));
  },

  updateNodeParameters: (nodeId, params) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, parameters: params } }
          : node,
      ),
    }));
  },

  connectNodes: (source, sourceHandle, target, targetHandle) => {
    const newEdge: Edge = {
      id: `edge_${source}_${target}`,
      source,
      target,
      sourceHandle,
      targetHandle,
      type: "default",
    };
    set((state) => ({ edges: [...state.edges, newEdge] }));
  },

  exportToN8nFormat: () => {
    const { nodes, edges } = get();

    const n8nNodes: N8nNodeInstance[] = nodes.map((node) => ({
      id: node.id,
      name: node.data.label,
      type: node.data.nodeType,
      position: [node.position.x, node.position.y],
      parameters: node.data.parameters,
    }));

    const connections: N8nConnectionMap = {};
    edges.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (!sourceNode) return;

      if (!connections[sourceNode.data.label]) {
        connections[sourceNode.data.label] = {};
      }

      const sourceType = edge.sourceHandle || "main";
      if (!connections[sourceNode.data.label][sourceType]) {
        connections[sourceNode.data.label][sourceType] = [];
      }

      const targetNode = nodes.find((n) => n.id === edge.target);
      connections[sourceNode.data.label][sourceType].push({
        node: targetNode?.data.label || edge.target,
        type: "main",
        index: 0,
      });
    });

    return { nodes: n8nNodes, connections };
  },
}));
```

---

## 8. Recommended Libraries

| Library                | Version | Purpose                                |
| ---------------------- | ------- | -------------------------------------- |
| **@xyflow/react**      | ^12.0.0 | Core flow engine (formerly React Flow) |
| **zustand**            | ^5.0.0  | State management                       |
| **@xyflow/additional** | ^12.0.0 | Extra components (Minimap, Controls)   |
| **elkjs**              | ^0.9.0  | Auto-layout algorithm                  |
| **dagre**              | ^7.0.0  | Alternative auto-layout                |

### Installation

```bash
npm install @xyflow/react zustand elkjs dagre @types/dagre
```

---

## 9. Auto-Layout Implementation

```typescript
// utils/autoLayout.ts
import ELK from "elkjs/lib/elk.bundled.js";
import { Node, Edge } from "@xyflow/react";

const elk = new ELK();

const elkOptions = {
  "elk.algorithm": "layered",
  "elk.direction": "RIGHT",
  "elk.spacing.nodeNode": "80",
  "elk.layered.spacing.nodeNodeBetweenLayers": "100",
};

export async function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
): Promise<Node[]> {
  const graph = {
    id: "root",
    layoutOptions: elkOptions,
    children: nodes.map((node) => ({
      id: node.id,
      width: 220,
      height: 120,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layoutedGraph = await elk.layout(graph);

  return nodes.map((node) => {
    const layoutedNode = layoutedGraph.children?.find((n) => n.id === node.id);
    return {
      ...node,
      position: {
        x: layoutedNode?.x || node.position.x,
        y: layoutedNode?.y || node.position.y,
      },
    };
  });
}
```

---

## 10. Key Implementation Patterns

### Pattern 1: Drag & Drop from Palette

```tsx
// components/NodePalette.tsx
import { useDrag } from "react-dnd";

export function DraggableNode({
  definition,
}: {
  definition: N8nNodeDefinition;
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "NODE",
    item: { definition },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} className={`palette-item ${isDragging ? "dragging" : ""}`}>
      <span className="icon">{definition.icon}</span>
      <span className="name">{definition.name}</span>
    </div>
  );
}
```

### Pattern 2: Connection Validation

```typescript
// hooks/useConnectionValidation.ts
export function useConnectionValidation() {
  const validateConnection = useCallback((connection: Connection) => {
    const { source, target, sourceHandle, targetHandle } = connection;

    // Same node = no connection
    if (source === target)
      return { valid: false, message: "Cannot connect to self" };

    // Check if source has this output
    const sourceNode = getNode(source);
    const sourceDef = nodeDefinitions.get(sourceNode?.data.nodeType);
    if (!sourceDef.outputs.includes(sourceHandle || "main")) {
      return { valid: false, message: "Invalid output handle" };
    }

    // Check if target has this input
    const targetNode = getNode(target);
    const targetDef = nodeDefinitions.get(targetNode?.data.nodeType);
    if (!targetDef.inputs.includes(targetHandle || "main")) {
      return { valid: false, message: "Invalid input handle" };
    }

    return { valid: true };
  }, []);

  return { validateConnection };
}
```

---

## 11. Summary & Recommendations

### For OpenDocs Integration:

1. **Use XYFlow (React Flow v12+)** - n8n nutzt Vue, wir brauchen React
2. **Follow n8n's JSON Schema** - Kompatibilität mit echten n8n Workflows
3. **Implement Node Definitions** - TypeScript Interfaces für alle Node-Typen
4. **Custom Edges** - Bezier curves mit Animation für laufende Workflows
5. **Parameter Editor** - Formular-Komponenten basierend auf Node-Properties
6. **Auto-Layout** - ELK.js für automatische Node-Anordnung

### Next Steps:

1. Create `types/n8n.ts` with all interfaces
2. Build `N8nNode` component with handles
3. Build `N8nEdge` component with bezier curves
4. Create Zustand store for workflow state
5. Implement drag & drop from palette
6. Add connection validation
7. Implement auto-layout with ELK

---

**References:**

- n8n GitHub: https://github.com/n8n-io/n8n
- XYFlow Docs: https://reactflow.dev/
- n8n Node Docs: https://docs.n8n.io/integrations/creating-nodes/
