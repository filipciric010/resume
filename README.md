# Resume Boost - AI-Powered Resume Builder

A modern, AI-enhanced resume builder built with React, TypeScript, and OpenAI integration. Create professional resumes with AI-powered suggestions, bullet point optimization, and personalized cover letter generation.

## ✨ Features

### Core Resume Builder
- **Multiple Templates**: Choose from Classic, Modern, and Compact templates
- **Real-time Preview**: See changes instantly as you edit
- **Section Management**: Personal info, experience, education, skills, projects, and certifications
- **Export Options**: PDF export and JSON import/export
- **Shareable Links**: Generate links to share your resume

### 🤖 AI-Powered Features
- **Bullet Point Suggestions**: Generate 3 tailored, quantified bullet points based on role, impact, and tools
- **Bullet Point Rewriting**: Improve existing bullets with AI quantification and optimization  
- **Cover Letter Generation**: Create personalized cover letters (≤250 words) from resume data and job descriptions
- **ATS Optimization**: AI suggestions follow ATS-friendly best practices

### Additional Features
- **ATS Analysis**: Score your resume against job descriptions
- **Template Switching**: Change templates while preserving content
- **Mobile Responsive**: Works seamlessly on all devices
- **Dark Mode Support**: Built-in theme switching

## 🚀 Getting Started

### Prerequisites

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure AI Features (Optional)**
   ```bash
   # Copy the example environment file
   cp .env.local.example .env.local
   
   # Edit .env.local and add your OpenAI API key
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`


## 🤖 AI Features Setup

### Getting an OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Add it to your `.env.local` file as `VITE_OPENAI_API_KEY`

### AI Features Usage

**Without API Key**: The application works fully without an API key. AI features will show a helpful banner and fall back to demo content.

**With API Key**: Unlock full AI capabilities:
- Smart bullet point generation
- Intelligent content rewriting
- Personalized cover letter creation

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Build Tool**: Vite
- **State Management**: Zustand
- **AI Integration**: OpenAI GPT-3.5/4
- **PDF Generation**: @react-pdf/renderer
- **Icons**: Lucide React

## 📝 Usage

### Creating a Resume
1. Navigate to the **Editor** page
2. Fill in your personal information, experience, education, and skills
3. Choose a template from the picker
4. Use AI features to enhance your content (if API key is configured)
5. Export as PDF when ready

### AI-Enhanced Editing
- **Bullet Suggestions**: Click "Improve with AI" on experience sections
- **Quantify Bullets**: Hover over bullet points and click the refresh icon
- **Generate Cover Letters**: Use the Cover Letter page with job descriptions

### ATS Optimization
- Visit the **ATS** page to analyze your resume against job descriptions
- Get scored feedback on keyword matches and optimization suggestions

## 🚀 Running Locally

Two processes run in dev: Vite (client) and Node (server).

```bash
npm install
npm run dev  # starts client on 8080 and server on 3001 (proxied /api)
```

Environment variables:

Copy `.env.example` and set required values. In dev, AI calls are proxied to the server, do not set OpenAI key on the client.

```bash
cp .env.example .env
# fill in SUPABASE vars and optionally server OPENAI_API_KEY
```

## 🧰 Production Build & Deploy

```bash
npm run build             # builds client to dist/
npm start                 # runs server (serves dist/ and /api)
```

### Docker

```bash
docker build -t ai-resume .
docker run -p 3001:3001 \
   -e CLIENT_ORIGIN=http://localhost:3001 \
   -e OPENAI_API_KEY=sk-... \
   ai-resume
```

The server serves the built client from `/` and APIs under `/api/*`.

## 🧩 Environment Variables

See `.env.example`. Do not expose `OPENAI_API_KEY` in the client.

## 📄 License

This project is built with love using modern web technologies. Feel free to use it for your resume building needs!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Need help?** Check out the [Lovable documentation](https://docs.lovable.dev) or open an issue in this repository.
