/**
 * OpenDocs API Documentation
 * @version 1.0.0
 * @baseUrl http://localhost:3000/api
 */

export const swagger = {
  openapi: '3.0.0',
  info: {
    title: 'OpenDocs API',
    version: '1.0.0',
    description: 'REST API for OpenDocs platform'
  },
  servers: [
    { url: 'http://localhost:3000/api', description: 'Development' },
    { url: 'https://api.opendocs.delqhi.com/api', description: 'Production' }
  ],
  tags: [
    { name: 'Documents', description: 'Document operations' },
    { name: 'Blocks', description: 'Block operations' },
    { name: 'Automations', description: 'Automation workflows' },
    { name: 'Database', description: 'Database operations' },
    { name: 'AI', description: 'AI and automation features' }
  ],
  paths: {
    '/documents': {
      get: {
        tags: ['Documents'],
        summary: 'List all documents',
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'offset', in: 'query', schema: { type: 'integer' } }
        ],
        responses: { '200': { description: 'Success' } }
      },
      post: {
        tags: ['Documents'],
        summary: 'Create new document',
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', properties: { title: { type: 'string' } } }
            }
          }
        },
        responses: { '201': { description: 'Created' } }
      }
    },
    '/documents/{id}': {
      get: {
        tags: ['Documents'],
        summary: 'Get document by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Success' } }
      },
      delete: {
        tags: ['Documents'],
        summary: 'Delete document',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Deleted' } }
      }
    },
    '/documents/{id}/blocks': {
      get: {
        tags: ['Blocks'],
        summary: 'List blocks in document',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Success' } }
      },
      post: {
        tags: ['Blocks'],
        summary: 'Add block to document',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['paragraph', 'heading', 'code', 'database', 'automation'] },
                  content: { type: 'object' }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Created' } }
      }
    },
    '/automations': {
      get: {
        tags: ['Automations'],
        summary: 'List all automations',
        responses: { '200': { description: 'Success' } }
      },
      post: {
        tags: ['Automations'],
        summary: 'Create new automation',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  nodes: { type: 'array' },
                  edges: { type: 'array' }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Created' } }
      }
    },
    '/automations/{id}/execute': {
      post: {
        tags: ['Automations'],
        summary: 'Execute automation',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Executed' } }
      }
    },
    '/database/{table}': {
      get: {
        tags: ['Database'],
        summary: 'Query table',
        parameters: [
          { name: 'table', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'filter', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } }
        ],
        responses: { '200': { description: 'Success' } }
      }
    }
  }
}
