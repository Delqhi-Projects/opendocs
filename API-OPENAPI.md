openapi: 3.0.3
info:
  title: OpenDocs API
  description: |
    RESTful API for OpenDocs - Open Source Documentation, Database, and Automation Platform.
    
    ## Authentication
    All API endpoints require Bearer token authentication. Include the token in the Authorization header:
    ```
    Authorization: Bearer <your-token>
    ```
    
    ## Rate Limiting
    - 100 requests per 15 minutes for authenticated users
    - 10 requests per 15 minutes for authentication endpoints
    
    ## Response Format
    All responses use JSON format with consistent error structure.
  version: 1.0.0
  contact:
    name: OpenDocs Support
    url: https://github.com/opendocs/opendocs
    email: support@opendocs.example.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT
servers:
  - url: http://localhost:3000/api
    description: Development server
  - url: https://api.opendocs.example.com/api
    description: Production server
  - url: https://staging-api.opendocs.example.com/api
    description: Staging server

tags:
  - name: Authentication
    description: User authentication and authorization
  - name: Documents
    description: Document CRUD operations
  - name: Blocks
    description: Block management within documents
  - name: Databases
    description: Database block operations
  - name: Automations
    description: Automation workflow management
  - name: AI
    description: AI-powered features
  - name: Users
    description: User management
  - name: Health
    description: System health and monitoring

paths:
  /health:
    get:
      tags:
        - Health
      summary: Health check
      description: Returns the health status of the API and its dependencies
      operationId: getHealth
      responses:
        '200':
          description: System is healthy
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HealthStatus'
        '503':
          description: System is unhealthy
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HealthStatus'

  /health/detailed:
    get:
      tags:
        - Health
      summary: Detailed health check
      description: Returns detailed health status including all service dependencies
      operationId: getDetailedHealth
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Detailed health status
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DetailedHealthStatus'
        '503':
          description: One or more services unhealthy
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DetailedHealthStatus'

  /auth/register:
    post:
      tags:
        - Authentication
      summary: Register new user
      description: Creates a new user account with email and password
      operationId: registerUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegisterRequest'
      responses:
        '201':
          description: User registered successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '400':
          description: Invalid input
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '409':
          description: Email already registered
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/login:
    post:
      tags:
        - Authentication
      summary: User login
      description: Authenticates user and returns access token
      operationId: loginUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '401':
          description: Invalid credentials
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/refresh:
    post:
      tags:
        - Authentication
      summary: Refresh access token
      description: Refreshes access token using refresh token
      operationId: refreshToken
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RefreshTokenRequest'
      responses:
        '200':
          description: Token refreshed successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '401':
          description: Invalid or expired refresh token
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/logout:
    post:
      tags:
        - Authentication
      summary: User logout
      description: Invalidates refresh token and logs user out
      operationId: logoutUser
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Logout successful
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /documents:
    get:
      tags:
        - Documents
      summary: List documents
      description: Returns a paginated list of documents for the authenticated user
      operationId: listDocuments
      security:
        - BearerAuth: []
      parameters:
        - in: query
          name: page
          schema:
            type: integer
            default: 1
          description: Page number
        - in: query
          name: limit
          schema:
            type: integer
            default: 20
            maximum: 100
          description: Number of items per page
        - in: query
          name: parentId
          schema:
            type: string
            format: uuid
          description: Filter by parent document ID
        - in: query
          name: search
          schema:
            type: string
          description: Search in title and content
      responses:
        '200':
          description: List of documents
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DocumentListResponse'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    post:
      tags:
        - Documents
      summary: Create document
      description: Creates a new document for the authenticated user
      operationId: createDocument
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateDocumentRequest'
      responses:
        '201':
          description: Document created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Document'
        '400':
          description: Invalid input
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /documents/{id}:
    get:
      tags:
        - Documents
      summary: Get document
      description: Returns a single document by ID
      operationId: getDocument
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
          description: Document ID
      responses:
        '200':
          description: Document found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Document'
        '404':
          description: Document not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    put:
      tags:
        - Documents
      summary: Update document
      description: Updates an existing document
      operationId: updateDocument
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
          description: Document ID
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateDocumentRequest'
      responses:
        '200':
          description: Document updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Document'
        '400':
          description: Invalid input
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '404':
          description: Document not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    delete:
      tags:
        - Documents
      summary: Delete document
      description: Deletes a document (moves to trash)
      operationId: deleteDocument
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
          description: Document ID
      responses:
        '204':
          description: Document deleted successfully
        '404':
          description: Document not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /documents/{id}/blocks:
    get:
      tags:
        - Documents
        - Blocks
      summary: Get document blocks
      description: Returns all blocks in a document
      operationId: getDocumentBlocks
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
          description: Document ID
      responses:
        '200':
          description: List of blocks
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Block'

  /blocks/{id}:
    get:
      tags:
        - Blocks
      summary: Get block
      description: Returns a single block by ID
      operationId: getBlock
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
          description: Block ID
      responses:
        '200':
          description: Block found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Block'
        '404':
          description: Block not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    put:
      tags:
        - Blocks
      summary: Update block
      description: Updates an existing block
      operationId: updateBlock
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
          description: Block ID
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateBlockRequest'
      responses:
        '200':
          description: Block updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Block'

    delete:
      tags:
        - Blocks
      summary: Delete block
      description: Deletes a block from its document
      operationId: deleteBlock
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
          description: Block ID
      responses:
        '204':
          description: Block deleted successfully
        '404':
          description: Block not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /databases:
    get:
      tags:
        - Databases
      summary: List databases
      description: Returns all database blocks for the user
      operationId: listDatabases
      security:
        - BearerAuth: []
      responses:
        '200':
          description: List of databases
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Database'

  /databases/{id}:
    get:
      tags:
        - Databases
      summary: Get database
      description: Returns database schema and metadata
      operationId: getDatabase
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
          description: Database ID
      responses:
        '200':
          description: Database found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Database'
        '404':
          description: Database not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    put:
      tags:
        - Databases
      summary: Update database
      description: Updates database schema (columns, relations)
      operationId: updateDatabase
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
          description: Database ID
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateDatabaseRequest'
      responses:
        '200':
          description: Database updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Database'

  /databases/{id}/rows:
    get:
      tags:
        - Databases
      summary: List database rows
      description: Returns paginated rows from database
      operationId: listDatabaseRows
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
          description: Database ID
        - in: query
          name: page
          schema:
            type: integer
            default: 1
        - in: query
          name: limit
          schema:
            type: integer
            default: 50
            maximum: 500
        - in: query
          name: view
          schema:
            type: string
            enum: [table, kanban, calendar, gallery, timeline]
            default: table
        - in: query
          name: filters
          schema:
            type: string
          description: JSON-encoded filter conditions
        - in: query
          name: sortBy
          schema:
            type: string
        - in: query
          name: sortOrder
          schema:
            type: string
            enum: [asc, desc]
            default: asc
      responses:
        '200':
          description: List of rows
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DatabaseRowListResponse'

    post:
      tags:
        - Databases
      summary: Create database row
      description: Creates a new row in the database
      operationId: createDatabaseRow
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
          description: Database ID
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateRowRequest'
      responses:
        '201':
          description: Row created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DatabaseRow'

  /databases/{id}/rows/{rowId}:
    put:
      tags:
        - Databases
      summary: Update database row
      description: Updates an existing row
      operationId: updateDatabaseRow
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
          description: Database ID
        - in: path
          name: rowId
          required: true
          schema:
            type: string
            format: uuid
          description: Row ID
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateRowRequest'
      responses:
        '200':
          description: Row updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DatabaseRow'

    delete:
      tags:
        - Databases
      summary: Delete database row
      description: Deletes a row from the database
      operationId: deleteDatabaseRow
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
          description: Database ID
        - in: path
          name: rowId
          required: true
          schema:
            type: string
            format: uuid
          description: Row ID
      responses:
        '204':
          description: Row deleted successfully
        '404':
          description: Row not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /automations:
    get:
      tags:
        - Automations
      summary: List automations
      description: Returns all automations for the user
      operationId: listAutomations
      security:
        - BearerAuth: []
      responses:
        '200':
          description: List of automations
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Automation'

    post:
      tags:
        - Automations
      summary: Create automation
      description: Creates a new automation workflow
      operationId: createAutomation
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateAutomationRequest'
      responses:
        '201':
          description: Automation created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Automation'
        '400':
          description: Invalid automation structure
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /automations/{id}:
    get:
      tags:
        - Automations
      summary: Get automation
      description: Returns automation with full node and edge definitions
      operationId: getAutomation
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
 ID
      responses          description: Automation:
        '200':
          description: Automation found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Automation'
        '404':
          description: Automation not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    put:
      tags:
        - Automations
      summary: Update automation
      description: Updates an existing automation
      operationId: updateAutomation
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
          description: Automation ID
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateAutomationRequest'
      responses:
        '200':
          description: Automation updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Automation'

    delete:
      tags:
        - Automations
      summary: Delete automation
      description: Deletes an automation and its executions
      operationId: deleteAutomation
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
          description: Automation ID
      responses:
        '204':
          description: Automation deleted successfully
        '404':
          description: Automation not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /automations/{id}/execute:
    post:
      tags:
        - Automations
      summary: Execute automation
      description: Triggers manual execution of an automation
      operationId: executeAutomation
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
          description: Automation ID
      requestBody:
        required: false
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ExecuteAutomationRequest'
      responses:
        '200':
          description: Automation executed successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AutomationExecution'
        '400':
          description: Automation cannot be executed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '404':
          description: Automation not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /automations/{id}/executions:
    get:
      tags:
        - Automations
      summary: List automation executions
      description: Returns execution history for an automation
      operationId: listAutomationExecutions
      security:
        - BearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
          description: Automation ID
        - in: query
          name: page
          schema:
            type: integer
            default: 1
        - in: query
          name: limit
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        '200':
          description: List of executions
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AutomationExecutionListResponse'

  /ai/prompt:
    post:
      tags:
        - AI
      summary: Generate AI content
      description: Generates content using AI based on prompt
      operationId: generateAIContent
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AIPromptRequest'
      responses:
        '200':
          description: AI content generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AIPromptResponse'
        '400':
          description: Invalid prompt or model configuration
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /ai/transform:
    post:
      tags:
        - AI
      summary: Transform block content
      description: Applies AI transformation to block content
      operationId: transformBlockContent
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AITransformRequest'
      responses:
        '200':
          description: Content transformed successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AITransformResponse'

  /users/me:
    get:
      tags:
        - Users
      summary: Get current user
      description: Returns the authenticated user's profile
      operationId: getCurrentUser
      security:
        - BearerAuth: []
      responses:
        '200':
          description: User profile
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

    put:
      tags:
        - Users
      summary: Update current user
      description: Updates the authenticated user's profile
      operationId: updateCurrentUser
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateUserRequest'
      responses:
        '200':
          description: User updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

  /users/{id}:
    get:
      tags:
        - Users
      summary: Get user by ID
      description: Returns public user information
      operationId: getUserById
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
          description: User ID
      responses:
        '200':
          description: User found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserPublic'
        '404':
          description: User not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    HealthStatus:
      type: object
      properties:
        status:
          type: string
          enum: [healthy, unhealthy]
        timestamp:
          type: string
          format: date-time
        services:
          type: object
          properties:
            database:
              type: boolean
            redis:
              type: boolean
      example:
        status: healthy
        timestamp: 2026-02-12T14:30:00Z
        services:
          database: true
          redis: true

    DetailedHealthStatus:
      type: object
      properties:
        status:
          type: string
          enum: [healthy, degraded, unhealthy]
        timestamp:
          type: string
          format: date-time
        checks:
          type: array
          items:
            type: object
            properties:
              name:
                type: string
              healthy:
                type: boolean
              latency:
                type: number
              message:
                type: string
        version:
          type: string
        uptime:
          type: number

    RegisterRequest:
      type: object
      required:
        - email
        - password
        - name
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 8
        name:
          type: string
          minLength: 1
          maxLength: 100
      example:
        email: user@example.com
        password: securePassword123
        name: John Doe

    LoginRequest:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
        password:
          type: string
      example:
        email: user@example.com
        password: securePassword123

    RefreshTokenRequest:
      type: object
      required:
        - refreshToken
      properties:
        refreshToken:
          type: string
      example:
        refreshToken: xyz123.refresh.token

    AuthResponse:
      type: object
      properties:
        accessToken:
          type: string
        refreshToken:
          type: string
        tokenType:
          type: string
          default: Bearer
        expiresIn:
          type: integer
          description: Seconds until expiration
        user:
          $ref: '#/components/schemas/User'
      example:
        accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        refreshToken: xyz123.refresh.token
        tokenType: Bearer
        expiresIn: 86400
        user:
          id: 123e4567-e89b-12d3-a456-426614174000
          email: user@example.com
          name: John Doe

    Document:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        content:
          type: string
        parentId:
          type: string
          format: uuid
          nullable: true
        isLocked:
          type: boolean
        metadata:
          type: object
        userId:
          type: string
          format: uuid
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      example:
        id: 123e4567-e89b-12d3-a456-426614174000
        title: My Document
        content: Document content here
        parentId: null
        isLocked: false
        metadata: {}
        userId: 223e4567-e89b-12d3-a456-426614174001
        createdAt: 2026-02-12T10:00:00Z
        updatedAt: 2026-02-12T14:30:00Z

    DocumentListResponse:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/Document'
        meta:
          type: object
          properties:
            page:
              type: integer
            limit:
              type: integer
            total:
              type: integer
            totalPages:
              type: integer

    CreateDocumentRequest:
      type: object
      properties:
        title:
          type: string
          minLength: 1
          maxLength: 200
        parentId:
          type: string
          format: uuid
        content:
          type: string
        metadata:
          type: object
      example:
        title: New Document
        parentId: null
        content: ""
        metadata: {}

    UpdateDocumentRequest:
      type: object
      properties:
        title:
          type: string
          minLength: 1
          maxLength: 200
        content:
          type: string
        isLocked:
          type: boolean
        metadata:
          type: object
      example:
        title: Updated Title
        content: Updated content
        isLocked: true

    Block:
      type: object
      properties:
        id:
          type: string
          format: uuid
        type:
          type: string
          enum: [paragraph, heading, list, code, image, database, automation, ai, divider, quote, callout]
        subtype:
          type: string
        content:
          type: object
        position:
          type: integer
        documentId:
          type: string
          format: uuid
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      example:
        id: 323e4567-e89b-12d3-a456-426614174002
        type: paragraph
        subtype: null
        content:
          text: "Hello, World!"
        position: 0
        documentId: 123e4567-e89b-12d3-a456-426614174000
        createdAt: 2026-02-12T10:00:00Z
        updatedAt: 2026-02-12T10:00:00Z

    UpdateBlockRequest:
      type: object
      properties:
        content:
          type: object
        position:
          type: integer
      example:
        content:
          text: "Updated content"
        position: 1

    Database:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        description:
          type: string
        columns:
          type: array
          items:
            $ref: '#/components/schemas/DatabaseColumn'
        views:
          type: array
          items:
            $ref: '#/components/schemas/DatabaseView'
        relations:
          type: array
          items:
            $ref: '#/components/schemas/DatabaseRelation'
        blockId:
          type: string
          format: uuid
        documentId:
          type: string
          format: uuid
      example:
        id: 423e4567-e89b-12d3-a456-426614174003
        name: Tasks
        description: Project tasks
        columns:
          - id: 1
            name: Status
            type: select
            options: ["Todo", "In Progress", "Done"]
        views:
          - type: table
            isDefault: true
        relations: []

    DatabaseColumn:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        type:
          type: string
          enum: [text, longText, number, date, select, multiselect, user, file, relation, formula]
        options:
          type: object
        isRequired:
          type: boolean
        isUnique:
          type: boolean
        defaultValue:
          type: unknown
      example:
        id: 1
        name: Status
        type: select
        options:
          choices: ["Todo", "In Progress", "Done"]
        isRequired: false
        isUnique: false

    DatabaseView:
      type: object
      properties:
        type:
          type: string
          enum: [table, kanban, calendar, gallery, timeline]
        name:
          type: string
        isDefault:
          type: boolean
        config:
          type: object
      example:
        type: kanban
        name: Board View
        isDefault: false
        config:
          groupBy: Status

    DatabaseRelation:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        targetDatabaseId:
          type: string
          format: uuid
        type:
          type: string
          enum: [one-to-one, one-to-many, many-to-many]
      example:
        id: 1
        name: Tasks to Project
        targetDatabaseId: 523e4567-e89b-12d3-a456-426614174004
        type: many-to-many

    DatabaseRow:
      type: object
      properties:
        id:
          type: string
          format: uuid
        values:
          type: object
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      example:
        id: 623e4567-e89b-12d3-a456-426614174005
        values:
          Status: "Todo"
          Priority: "High"
          Assignee: "John Doe"
        createdAt: 2026-02-12T10:00:00Z
        updatedAt: 2026-02-12T14:30:00Z

    DatabaseRowListResponse:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/DatabaseRow'
        meta:
          type: object
          properties:
            page:
              type: integer
            limit:
              type: integer
            total:
              type: integer

    CreateRowRequest:
      type: object
      required:
        - values
      properties:
        values:
          type: object
      example:
        values:
          Status: "Todo"
          Priority: "High"

    UpdateRowRequest:
      type: object
      properties:
        values:
          type: object
      example:
        values:
          Status: "In Progress"

    UpdateDatabaseRequest:
      type: object
      properties:
        name:
          type: string
        description:
          type: string
        columns:
          type: array
          items:
            $ref: '#/components/schemas/DatabaseColumn'
      example:
        name: Updated Tasks
        columns: []

    Automation:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        description:
          type: string
        nodes:
          type: array
          items:
            $ref: '#/components/schemas/AutomationNode'
        edges:
          type: array
          items:
            $ref: '#/components/schemas/AutomationEdge'
        enabled:
          type: boolean
        trigger:
          type: string
          enum: [manual, schedule, webhook, db-change]
        schedule:
          type: string
          nullable: true
        webhookPath:
          type: string
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      example:
        id: 723e4567-e89b-12d3-a456-426614174006
        name: Send Welcome Email
        description: Sends email when new user signs up
        nodes: []
        edges: []
        enabled: true
        trigger: manual
        schedule: null
        webhookPath: null

    AutomationNode:
      type: object
      properties:
        id:
          type: string
        type:
          type: string
          enum: [trigger, action, condition]
        subtype:
          type: string
        position:
          type: object
          properties:
            x:
              type: number
            y:
              type: number
        data:
          type: object
      example:
        id: "1"
        type: trigger
        subtype: manual
        position:
          x: 100
          y: 100
        data:
          config: {}

    AutomationEdge:
      type: object
      properties:
        id:
          type: string
        source:
          type: string
        target:
          type: string
        sourceHandle:
          type: string
        targetHandle:
          type: string
      example:
        id: "e1"
        source: "1"
        target: "2"

    CreateAutomationRequest:
      type: object
      required:
        - name
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
        description:
          type: string
        nodes:
          type: array
          items:
            $ref: '#/components/schemas/AutomationNode'
        edges:
          type: array
          items:
            $ref: '#/components/schemas/AutomationEdge'
        enabled:
          type: boolean
          default: true
      example:
        name: New Automation
        description: ""
        nodes: []
        edges: []

    UpdateAutomationRequest:
      type: object
      properties:
        name:
          type: string
        description:
          type: string
        nodes:
          type: array
          items:
            $ref: '#/components/schemas/AutomationNode'
        edges:
          type: array
          items:
            $ref: '#/components/schemas/AutomationEdge'
        enabled:
          type: boolean

    ExecuteAutomationRequest:
      type: object
      properties:
        context:
          type: object
      example:
        context:
          userId: "user-123"

    AutomationExecution:
      type: object
      properties:
        id:
          type: string
          format: uuid
        automationId:
          type: string
          format: uuid
        status:
          type: string
          enum: [running, success, error]
        startedAt:
          type: string
          format: date-time
        finishedAt:
          type: string
          format: date-time
        nodeResults:
          type: array
          items:
            type: object
        error:
          type: string
          nullable: true
      example:
        id: 823e4567-e89b-12d3-a456-426614174007
        automationId: 723e4567-e89b-12d3-a456-426614174006
        status: success
        startedAt: 2026-02-12T14:00:00Z
        finishedAt: 2026-02-12T14:00:05Z
        nodeResults: []
        error: null

    AutomationExecutionListResponse:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/AutomationExecution'
        meta:
          type: object
          properties:
            page:
              type: integer
            limit:
              type: integer
            total:
              type: integer

    AIPromptRequest:
      type: object
      required:
        - prompt
      properties:
        prompt:
          type: string
        model:
          type: string
          enum: [nvidia, openai, anthropic]
          default: nvidia
        temperature:
          type: number
          minimum: 0
          maximum: 1
          default: 0.7
        maxTokens:
          type: integer
          minimum: 1
          maximum: 4096
          default: 1024
        context:
          type: object
          description: Additional context for the AI
      example:
        prompt: "Create a project timeline with milestones"
        model: nvidia
        temperature: 0.7
        maxTokens: 2048
        context:
          documentId: "123"

    AIPromptResponse:
      type: object
      properties:
        content:
          type: string
        usage:
          type: object
          properties:
            promptTokens:
              type: integer
            completionTokens:
              type: integer
            totalTokens:
              type: integer
      example:
        content: "# Project Timeline\n\n## Milestone 1\n..."
        usage:
          promptTokens: 50
          completionTokens: 150
          totalTokens: 200

    AITransformRequest:
      type: object
      required:
        - content
        - instruction
      properties:
        content:
          type: string
        instruction:
          type: string
          description: Transformation instruction (e.g., "Make more formal", "Translate to Spanish")
        model:
          type: string
          enum: [nvidia, openai, anthropic]
          default: nvidia
      example:
        content: "Hello world"
        instruction: "Make this more formal"
        model: nvidia

    AITransformResponse:
      type: object
      properties:
        content:
          type: string
        usage:
          type: object
          properties:
            promptTokens:
              type: integer
            completionTokens:
              type: integer
      example:
        content: "Greetings, World!"
        usage:
          promptTokens: 20
          completionTokens: 15

    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string
        avatar:
          type: string
          format: uri
        preferences:
          type: object
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      example:
        id: 923e4567-e89b-12d3-a456-426614174008
        email: user@example.com
        name: John Doe
        avatar: https://example.com/avatar.jpg
        preferences:
          theme: dark
        createdAt: 2026-01-01T00:00:00Z
        updatedAt: 2026-02-12T14:30:00Z

    UserPublic:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        avatar:
          type: string
          format: uri
      example:
        id: 923e4567-e89b-12d3-a456-426614174008
        name: John Doe
        avatar: https://example.com/avatar.jpg

    UpdateUserRequest:
      type: object
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
        avatar:
          type: string
          format: uri
        preferences:
          type: object
      example:
        name: John Doe
        avatar: https://example.com/new-avatar.jpg
        preferences:
          theme: light

    Error:
      type: object
      properties:
        error:
          type: string
        message:
          type: string
        details:
          type: array
          items:
            type: object
        code:
          type: string
      example:
        error: Bad Request
        message: "Invalid input provided"
        details: []
        code: INVALID_INPUT

externalDocs:
  description: OpenDocs Documentation
  url: https://docs.opendocs.example.com
