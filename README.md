# 🚀 Perplexity AI - Full-Stack RAG Chat Application

## 📖 Project Description

Perplexity AI is a high-performance **Full-Stack AI Chat Application** engineered with the **MERN** stack and augmented with cutting-edge **Retrieval-Augmented Generation (RAG)** capabilities. It functions as a secure, private, and highly intelligent AI assistant that doesn't just chat, but actually "remembers" the documents you provide.

By bridging the gap between large language models and your private data, this application allows users to upload PDFs, text files, and images, and query them in real-time. Instead of hitting a knowledge cutoff, the AI searches through your uploaded documents using high-dimensional vector embeddings, extracting relevant facts to generate precise, context-aware answers. 

Built with performance and scalability in mind, the platform boasts real-time Socket.io communication, optimized vector search with Pinecone, and seamless integration with GenAI models like Mistral and Google Gemini.

---

## ✨ Features

- **Real-Time Interactive Chat:** Lightning-fast, websocket-powered conversations with a persistent chat history.
- **Intelligent RAG System:** Talk directly to your documents. The AI retrieves facts from your exact data before answering.
- **Multi-Format File Support:** Upload PDFs, images, and text files. The system automatically extracts, chunks, and indexes the content.
- **Same-Request Searchability:** Upload a file and ask a question in a single request. The file is indexed and queried instantaneously.
- **Secure Authentication:** Robust JWT-based authentication with secure cookie sessions and password hashing.
- **Semantic Vector Search:** Powered by Pinecone vector databases to perform similarity matching based on meaning, not just keywords.
- **Multi-User Isolation:** Advanced database architectures ensure your vectors and chats are completely isolated and private.
- **Smart Duplicate Detection:** Hashes file uploads (SHA-256) to prevent redundant data embedding and save API costs.
- **Automated Title Generation:** Dynamically generates concise, descriptive chat titles based on your initial prompt.

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4, Framer Motion (for buttery smooth animations)
- **State Management:** Redux Toolkit
- **Communication:** Axios, Socket.io-client
- **Markdown:** React Markdown (for rendering AI responses properly)

### Backend
- **Core:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **Vector Database:** Pinecone
- **AI & RAG:** LangChain, Mistral AI, Google GenAI
- **Real-Time:** Socket.io
- **File Handling:** Multer (memory buffering), ImageKit, pdf-parse
- **Authentication:** JSON Web Tokens (JWT), bcrypt
- **Validation:** Express Validator, Zod

---

## 📂 Folder Structure

```text
Perplexity/
├── Backend/                 # Express backend, REST APIs, and RAG services
│   ├── public/              # Static assets and potential build output
│   ├── src/
│   │   ├── config/          # Configurations (DB, GenAI, Pinecone)
│   │   ├── controller/      # Thin HTTP route controllers
│   │   ├── middleware/      # Auth, error handling, and upload middlewares
│   │   ├── models/          # MongoDB Mongoose schemas (User, Chat, Message, File)
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Core business logic (RAG pipeline, Chat logic)
│   │   ├── socket/          # WebSocket event handlers
│   │   └── utils/           # Helper functions (Chunker, text extraction, etc.)
│   ├── .env                 # Backend environment variables
│   ├── server.js            # Entry point for backend server
│   └── package.json         # Node dependencies
│
├── Frontend/                # React UI powered by Vite
│   ├── src/
│   │   ├── app/             # Redux store configurations
│   │   ├── assets/          # Images and static assets
│   │   ├── config/          # Frontend configurations
│   │   ├── features/        # Feature-based module organization (Auth, Chat, Landing, Profile)
│   │   ├── index.css        # Global Tailwind styling
│   │   └── main.jsx         # React application entry point
│   ├── .env.example         # Template for environment variables
│   ├── vite.config.js       # Vite configuration
│   └── package.json         # React dependencies
│
└── PROJECT_DOCUMENTATION.md # In-depth technical architecture document
```

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/perplexity-clone.git
cd perplexity-clone
```

### 2. Setup the Backend
```bash
cd Backend
npm install
```
Configure your `.env` file (see Environment Variables section), then start the development server:
```bash
npm run dev
```

### 3. Setup the Frontend
```bash
cd ../Frontend
npm install
```
Set up the environment variables, then start the Vite dev server:
```bash
npm run dev
```

The frontend will be running on `http://localhost:5173` and the backend strictly on `http://localhost:5000`.

---

## 🔐 Environment Variables

You need to establish the following environment variables.

**Backend (`Backend/.env`)**
```env
# Application Settings
NODE_ENV=development
PORT=5000
APP_BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173

# Authentication
JWT_SECRET_KEY=your_super_secret_jwt_key

# Databases
MONGODB_URI=mongodb+srv://<user>:<password>@cluster...
VECTOR_INDEX_NAME=your_pinecone_index_name
VECTOR_API_KEY=your_pinecone_api_key

# External AI APIs
GOOGLE_API_KEY=your_google_ai_key
MISTRAL_API_KEY=your_mistral_api_key
TAVILY_API_KEY=your_tavily_api_key

# File Processing
IMAGEKIT_PUBLIC_KEY=your_imagekit_public
IMAGEKIT_PRIVATE_KEY=your_imagekit_private
IMAGEKIT_END_URL=your_imagekit_endpoint

# Mailer Configurations (Optional)
GOOGLE_EMAIL_USER=your_email@gmail.com
GOOGLE_EMAIL_PASS=your_app_password
```

**Frontend (`Frontend/.env`)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 📡 API Endpoints

### 🟢 **Authentication**
- `POST /api/auth/register` - Create a new user account.
- `POST /api/auth/login` - Authenticate a user and set strict secure cookies.
- `POST /api/auth/logout` - Clear user session.

### 🟡 **Chat & RAG System**
- `GET /api/chats/` - Retrieve all user conversations.
- `GET /api/chats/:chatId` - Load a specific conversation along with history.
- `POST /api/chats/message` - Send a message and optional files. **(Triggers RAG)**
- `DELETE /api/chats/delete` - Permanently remove a chat and references to vectors.

### 🟣 **Files & Users**
- `POST /api/files/upload` - Securely upload a file to memory/cloud.
- `PATCH /api/users/profile` - Update user aesthetic or personal metadata.

---

## 🧠 Architecture Explanation

The RAG (Retrieval-Augmented Generation) system acts as the "brain" of the application. 

Here is how data flows when you upload a document and ask a question:
1. **Extraction & Chunking:** When a file (PDF, Image, Text) hits the server, `multer` puts it in memory. Text is extracted dynamically and split into overlapping chunks (e.g., 500 characters each).
2. **Embedding:** The chunks are passed to the `mistral-embed` model to generate 1024-dimensional float vectors representing the semantic meaning of the text.
3. **Storage (Pinecone):** Vectors are securely stored in Pinecone using your unique `userId` as a namespace. This ensures 100% data privacy.
4. **Retrieval Search:** The system converts your prompt into a vector query, searching Pinecone for the Top-5 most relevant chunks to reconstruct the context.
5. **Generation:** The highly relevant context chunks and your previous 10 messages of chat history are injected into a dynamic LLM prompt. Mistral/Google models then generate a conversational and perfectly factual response.

*All indexing and searching happen within a single request, meaning zero delay between file upload and intelligence.*

---

## 🎯 Use Cases

- **Students:** Upload lengthy textbooks and research papers. Ask direct questions to prepare for exams instead of scrolling for hours.
- **Legal Professionals:** Interrogate massive PDFs of case law to extract specific clauses or conditions.
- **Developers:** Paste in foreign documentation and ask the AI "how do I configure X based on this text?".
- **Enterprises:** Keep private data internal. Instead of training custom models, RAG lets you use powerful standard models against highly confidential internal policies.

---

## 📸 Screenshots / Demo

*(Add images of your beautiful UI here!)*

* `![Dashboard UI](./Frontend/src/assets/dashboard_placeholder.png)`
* `![Chat View](./Frontend/src/assets/chat_placeholder.png)`

---

## 🌐 Live Demo & GitHub Link

- **Live Demo:** [Insert Deployment URL here]
- **GitHub Repository:** [Insert GitHub Repo URL here]

---

## 🛠️ Future Improvements

We have a massive roadmap planned to make this AI even better:
- **Server-Sent Events (SSE):** Stream LLM tokens word-by-word for faster perceived performance.
- **Hybrid Search (BM25):** Combine traditional keyword search with semantic matching for near-perfect precision.
- **Cross-Encoder Re-ranking:** Optimize the top 5 Pinecone results for even better LLM prompt injection.
- **Redis Caching:** Drastically reduce duplicate query costs by catching frequently asked queries in a Redis layer.

---

## 🤝 Contributing

Contributions are always welcome. To contribute:
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License. See the `package.json` for more details. 

---
Written with ❤️ by a passionate developer.
