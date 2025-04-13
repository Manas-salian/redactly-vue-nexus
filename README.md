# Redactly Vue Nexus - AI Document Redaction

This project is a web application built with React (using Vite), TypeScript, and Tailwind CSS (via Shadcn UI) designed for uploading, viewing, and redacting sensitive information from PDF and DOCX documents.

## Features

*   **Document Upload:** Supports uploading PDF and DOCX files via drag-and-drop or file selection.
*   **Document Preview:** Renders PDF documents using `pdf.js` directly in the browser.
*   **Text Extraction:** Extracts text content from both PDF (`pdf.js`) and DOCX (`mammoth.js`) files.
*   **Basic Entity Recognition:** Uses regular expressions to identify potential emails, phone numbers, and URLs (`DocumentService`).
*   **(Planned) AI-Powered Redaction:** Intended to integrate with an AI service (`AIService`) to detect various categories of sensitive data (PII, Financial, Dates).
*   **Redaction Controls:** Allows users to configure redaction mode (blackout, de-identify), AI sensitivity, and specific data categories.
*   **Redaction Review:** Provides a panel to review individual redactions suggested by the AI, approve/reject them, and add annotations.
*   **Theming:** Includes basic light/dark theme toggling.

## Project Structure

```
/src
├── components/         # Reusable UI components (Upload, Preview, Controls, Panel, Shadcn UI components)
│   ├── ui/             # Shadcn UI components
│   └── ...
├── context/            # React context providers (e.g., ThemeContext)
├── hooks/              # Custom React hooks (e.g., useDocumentProcessor)
├── services/           # Business logic and external interactions (DocumentService, AIService)
├── App.tsx             # Main application component, state management
├── main.tsx            # Application entry point
└── index.css           # Global styles (Tailwind)
public/                 # Static assets (e.g., pdf.js worker)
README.md               # This file
package.json            # Project dependencies and scripts
tailwind.config.js      # Tailwind CSS configuration
tsconfig.json           # TypeScript configuration
vite.config.ts          # Vite configuration
```

## Key Dependencies

*   **React:** Frontend library
*   **Vite:** Build tool and development server
*   **TypeScript:** Strongly typed JavaScript
*   **Tailwind CSS:** Utility-first CSS framework
*   **Shadcn UI:** Reusable UI components built with Radix UI and Tailwind CSS
*   **pdfjs-dist:** Library for parsing and rendering PDF files (`pdf.js`)
*   **mammoth:** Library for converting DOCX files to HTML/text
*   **tesseract.js:** OCR library (used in `DocumentService`, potentially for images/scanned PDFs)
*   **react-dropzone:** Hook for creating drag-and-drop file upload zones
*   **sonner:** Toast notification library

## Setup and Running

1.  **Clone the repository using Git:**
    Open your terminal or command prompt and run:
    ```bash
    git clone <repository-url> # Replace <repository-url> with the actual URL
    cd redactly-vue-nexus
    ```

2.  **Install Node.js Dependencies:**
    This project uses Node.js and npm (or yarn) to manage frontend dependencies.
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **(Optional/Planned) Setup Python Environment for AI Backend:**
    *This project is designed to eventually integrate with backend AI services, potentially written in Python and using libraries like spaCy for advanced NLP tasks. While the frontend can run without this backend for basic document viewing and structure, setting up the Python environment is necessary for full AI redaction capabilities (if/when implemented).*

    *   **Install Python:** Ensure you have Python 3.8+ installed on your system. You can download it from [python.org](https://www.python.org/).
    *   **Create a Virtual Environment (Recommended):**
        ```bash
        python -m venv venv
        source venv/bin/activate # On Windows use `venv\Scripts\activate`
        ```
    *   **Install Python Modules:** If implementing or running the AI backend, you would typically install necessary modules using pip. Common requirements for NLP tasks might include:
        ```bash
        pip install spacy flask requests # Add other relevant Python modules as needed
        
        # Download necessary spaCy models (example)
        python -m spacy download en_core_web_sm 
        ```
    *   *Note: The specific Python dependencies and setup steps will depend on the final implementation of the AI service backend.* 

4.  **Copy `pdf.js` worker:**
    The application requires the `pdf.js` worker file to be available in the `public` directory for PDF rendering.
    ```bash
    # Ensure you are in the project root directory
    cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/
    ```
    *(Note: The exact source path within `node_modules` might vary slightly based on your Node/npm/yarn setup. Verify the path if the command fails.)*

5.  **Run the Development Server:**
    Start the Vite development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application should now be running on a local port (Vite will typically output the URL, often `http://localhost:5173` or similar).

## Development Notes

*   **Services (`DocumentService`, `AIService`):** These are implemented as Singletons to manage potentially heavy resources (like the Tesseract worker) and ensure consistent state.
*   **ArrayBuffer Handling:** Care must be taken when passing `ArrayBuffer` objects, especially to web workers (`pdf.js`). Buffers can become "detached" if transferred. The current implementation attempts to mitigate this by creating copies (`.slice(0)`) before passing buffers between different processing stages (e.g., `FileReader` -> `App` state -> `DocumentPreview`, and `File` -> `DocumentService` -> `pdf.js`).
*   **AI Integration (`AIService`):** The `AIService` is currently a placeholder. Actual implementation would involve making API calls to a backend or directly using a client-side AI model.
*   **Error Handling:** Basic error handling is implemented, but could be enhanced with more specific error messages and user feedback.
*   **State Management:** Primarily uses React's `useState` and custom hooks. For larger applications, consider libraries like Zustand or Redux.

## TODO / Future Enhancements

*   Implement the actual AI redaction logic in `AIService`.
*   Connect the "Approve"/"Reject" buttons in `RedactionDetailsPanel` to actual state updates.
*   Implement saving/exporting of the redacted document.
*   Improve display and interaction with redactions directly on the `DocumentPreview` component.
*   Add more robust error handling and reporting.
*   Implement proper cleanup for the `DocumentService` Tesseract worker (e.g., in a top-level component unmount).
*   Add unit and integration tests.
