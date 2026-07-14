# System Architecture Diagram

```mermaid
flowchart TD
    %% Define styles
    classDef client fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef frontend fill:#61dafb,stroke:#333,stroke-width:2px,color:#000;
    classDef backend fill:#009688,stroke:#333,stroke-width:2px,color:#fff;
    classDef queue fill:#dc382d,stroke:#333,stroke-width:2px,color:#fff;
    classDef worker fill:#8bc34a,stroke:#333,stroke-width:2px,color:#000;
    classDef database fill:#3e8ed0,stroke:#333,stroke-width:2px,color:#fff;
    classDef ai fill:#9c27b0,stroke:#333,stroke-width:2px,color:#fff;
    classDef vectordb fill:#000000,stroke:#333,stroke-width:2px,color:#fff;

    %% Components
    Client([Web Client / Browser]):::client
    
    subgraph Presentation Layer
        React[React / Vite SPA]:::frontend
    end
    
    subgraph API Layer
        FastAPI[FastAPI Server]:::backend
    end
    
    subgraph Data & Identity Layer
        Supabase[(Supabase Auth & PostgreSQL)]:::database
        Storage[(Supabase Storage / S3)]:::database
    end
    
    subgraph Async Processing
        Redis[(Redis Message Broker)]:::queue
        Celery[Celery Workers]:::worker
    end
    
    subgraph AI & Retrieval
        Pinecone[(Pinecone Vector DB)]:::vectordb
        Embeddings[Embedding Model (Local/HF)]:::ai
        LLM[Large Language Model (Groq/Gemini)]:::ai
    end

    %% Flow: Auth & UI
    Client <-->|HTTPS| React
    React <-->|JWT Auth| Supabase
    React <-->|REST API| FastAPI

    %% Flow: Document Upload & Indexing
    FastAPI -->|1. Store file metadata| Supabase
    FastAPI -->|2. Upload raw PDF| Storage
    FastAPI -->|3. Enqueue indexing task| Redis
    Redis -->|4. Consume task| Celery
    
    %% Flow: Worker Processing
    Celery -->|5. Download PDF| Storage
    Celery -->|6. Chunk & Extract Text| Celery
    Celery -->|7. Generate Embeddings| Embeddings
    Celery -->|8. Upsert Vectors| Pinecone
    Celery -->|9. Update Status| Supabase

    %% Flow: Chat / RAG
    FastAPI -->|A. User Query| FastAPI
    FastAPI -->|B. Embed Query| Embeddings
    FastAPI -->|C. Search Similar Chunks| Pinecone
    FastAPI -->|D. Build Prompt context| FastAPI
    FastAPI -->|E. Generate Answer| LLM
    LLM -->|F. Stream Response| FastAPI
```
