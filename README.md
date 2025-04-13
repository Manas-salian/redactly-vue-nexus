# Redactly - AI-Powered Document Redaction

Redactly is a secure, full-stack web application that uses AI to detect and redact sensitive data (PII/PHI) from documents such as DOCX and PDF. The tool supports multiple redaction levels, provides review and verification with confidence scores and annotations, and ensures full compliance with on-premises security standards.

## Features

### Intelligent Redaction Engine
- **Detection & Redaction**
  - Named Entity Recognition using spaCy
  - Context-aware AI detection using Ollama
  - Regex-based pattern matching
  - Custom AI models for different industries

- **Redaction Levels**
  - Blackout: Completely remove sensitive data
  - De-identification: Anonymize PII for research use

### Review & Verification
- Automatic confidence scoring for each redaction
- Manual review workflow for low-confidence redactions
- Highlighting and annotations for redacted sections
- Approval/rejection system for redactions

### Compliance & Security
- On-premises deployment
- Detailed audit logs
- Version control
- Compliance tracking

### Document Handling
- Support for DOCX and PDF documents
- OCR capabilities using Tesseract.js
- Text extraction and processing
- Responsive preview interface

## Technical Stack

### Frontend
- React.js with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui components
- React Query for state management

### Backend Services
- Document Processing Service
  - PDF.js for PDF handling
  - Mammoth.js for DOCX processing
  - Tesseract.js for OCR
  - spaCy for NLP

- AI Service
  - Ollama for AI-powered detection
  - Custom redaction models
  - Confidence scoring

## Getting Started

### Prerequisites
- Node.js 18+
- Ollama (for AI capabilities)
- Python 3.8+ (for spaCy)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/redactly-vue-nexus.git
cd redactly-vue-nexus
```

2. Install dependencies:
```bash
npm install
```

3. Set up Ollama:
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull the required model
ollama pull llama2
```

4. Set up spaCy:
```bash
pip install spacy
python -m spacy download en_core_web_sm
```

5. Start the development server:
```bash
npm run dev
```

## Usage

1. Upload a document (PDF or DOCX)
2. Configure redaction settings:
   - Select redaction mode (blackout or de-identification)
   - Adjust sensitivity level
   - Choose which types of data to redact
3. Review and verify redactions:
   - Check confidence scores
   - Add annotations
   - Approve or reject redactions
4. Download the redacted document

## Security Considerations

- All processing happens on-premises
- No data is sent to external servers
- Documents are processed in memory
- Secure handling of sensitive data
- Audit logging for compliance

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [spaCy](https://spacy.io/) for NLP capabilities
- [Ollama](https://ollama.ai/) for AI model hosting
- [Tesseract.js](https://github.com/naptha/tesseract.js) for OCR
- [PDF.js](https://mozilla.github.io/pdf.js/) for PDF processing
- [Mammoth.js](https://github.com/mwilliamson/mammoth.js) for DOCX processing
