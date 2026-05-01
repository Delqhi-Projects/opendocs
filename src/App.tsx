import { BlockEditor } from './components/editor/BlockEditor'

function App() {
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only">
        Skip to main content
      </a>
      <header role="banner" className="border-b border-neutral-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-neutral-900">OpenDocs v2.0</h1>
          <p className="text-sm text-neutral-500 mt-1">Block Editor with Slash Commands</p>
        </div>
      </header>
      <main id="main-content" role="main" className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md border border-neutral-200">
            <BlockEditor 
              placeholder='Type "/" to see available commands...'
              onChange={(content) => console.log('Content changed:', content)}
            />
          </div>
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              ✨ Try These Commands:
            </h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Type <code className="bg-white px-2 py-0.5 rounded">/</code> to open the command menu</li>
              <li>• Use arrow keys to navigate, Enter to select</li>
              <li>• Try: H1, H2, Bullet List, Task List, Quote, Code, Image, Table</li>
            </ul>
          </div>
        </div>
      </main>
      <footer role="contentinfo" className="border-t border-neutral-200 bg-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-neutral-500 text-sm">
            &copy; 2026 OpenDocs - Design System V2
          </p>
        </div>
      </footer>
    </>
  )
}

export default App
