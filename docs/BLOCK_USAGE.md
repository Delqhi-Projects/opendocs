# OpenDocs Block Components - Usage Guide

## TableBlock

```typescript
import { TableBlock } from './components/blocks/TableBlock';

const columns = [
  { key: 'id', header: 'ID', sortable: true },
  { key: 'name', header: 'Name', sortable: true, filterable: true },
  { key: 'email', header: 'Email' }
];

const data = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' }
];

function App() {
  return (
    <TableBlock
      columns={columns}
      data={data}
      options={{
        title: 'Benutzer',
        searchable: true,
        editable: true,
        pageSize: 10
      }}
      onRowClick={(row) => console.log(row)}
      onDataChange={(newData) => console.log(newData)}
    />
  );
}
```

## DatabaseBlock

```typescript
import { DatabaseBlock } from './components/blocks/DatabaseBlock';

function App() {
  const handleConnect = async (config) => {
    await connectToDatabase(config);
  };

  return (
    <DatabaseBlock
      onConnect={handleConnect}
      onTestConnection={async (config) => {
        return await testConnection(config);
      }}
      savedConnections={savedConns}
      onSaveConnection={(config) => saveConn(config)}
    />
  );
}
```

## N8NBlock

```typescript
import { N8NBlock } from './components/blocks/N8NBlock';

function App() {
  return (
    <N8NBlock
      n8nUrl="http://localhost:5678"
      apiKey="n8n-api-key"
      onWorkflowExecute={(id) => console.log('Executed:', id)}
    />
  );
}
```

## CodeBlock

```typescript
import { CodeBlock } from './components/blocks/CodeBlock';

function App() {
  return (
    <CodeBlock
      language="typescript"
      theme="dark"
      code={`const x = 5;`}
      onChange={(code) => console.log(code)}
    />
  );
}
```

## DrawBlock

```typescript
import { DrawBlock } from './components/blocks/DrawBlock';

function App() {
  return (
    <DrawBlock
      width={800}
      height={600}
      onExport={(dataUrl) => console.log(dataUrl)}
    />
  );
}
```

## ChatPanel

```typescript
import { ChatPanel } from './components/blocks/ChatPanel';

function App() {
  return (
    <ChatPanel
      apiUrl="http://localhost:3000/api/chat"
      onMessage={(msg) => console.log(msg)}
    />
  );
}
```

## HealthDashboard

```typescript
import { HealthDashboard } from './components/blocks/HealthDashboard';

function App() {
  return (
    <HealthDashboard
      apiUrl="http://localhost:3000/api/health"
      refreshInterval={5000}
    />
  );
}
```

## EarningsTracker

```typescript
import { EarningsTracker } from './components/blocks/EarningsTracker';

function App() {
  return (
    <EarningsTracker
      apiUrl="http://localhost:3000/api/earnings"
    />
  );
}
```
