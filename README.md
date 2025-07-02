# InfographicsAI - AI-Powered Infographic Generator

A modern web application for generating beautiful infographics using AI-powered template selection and data integration. Built with Vue.js frontend and Node.js backend with local JSON storage.

## 🚀 Features

- **AI-Powered Template Selection**: AI analyzes user content and selects the most appropriate template from available designs
- **Intelligent Data Integration**: Uses custom prompts to ensure seamless data integration while preserving template design
- **Multiple Professional Templates**: Four different professional infographic templates with various layouts and styles
- **Real-time Preview**: View infographics instantly as they're generated
- **Infographic Library**: Browse and search through previously generated infographics
- **Download Support**: Download infographics as HTML files
- **User Authentication**: Secure login/signup system
- **Unlimited Generation**: No rate limits on infographic creation
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Local Storage**: All data stored locally in JSON files

## 🎨 Template System

The application includes four professional HTML templates:
- **Template One**: Modern card-based layout ideal for statistics and data comparison
- **Template Two**: Chart-focused design perfect for data visualization
- **Template Three**: Clean professional layout suitable for business metrics
- **Template Four**: Versatile design adaptable to various content types

The AI system:
1. **Analyzes** user input to understand the topic and data type
2. **Selects** the most appropriate template based on content relevance and visual style
3. **Integrates** user data while maintaining the exact HTML structure and CSS styling
4. **Preserves** all design elements, animations, and functionality

## 🛠 Tech Stack

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Vue Router** - Official router for Vue.js
- **CSS3** - Modern styling with flexbox and grid
- **Responsive Design** - Mobile-first approach

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **OpenAI API** - AI-powered content generation with template selection
- **JSON Storage** - Local file-based data persistence
- **Bcrypt** - Password hashing
- **JWT** - Authentication tokens

### AI Integration
- **OpenAI API Required** - Full dependency on OpenAI for infographic generation
- **Custom Prompt System** - Uses `public/files/prompt.txt` for AI instructions
- **Template Analysis** - AI evaluates all templates for optimal selection
- **Content Adaptation** - Intelligent data integration preserving design integrity
- **No Fallback Mode** - Requires valid API configuration to function

## 📁 Project Structure

```
infographicsai/
├── src/                     # Vue.js frontend source
│   ├── components/         # Reusable Vue components
│   ├── views/             # Page components
│   └── router/            # Vue Router configuration
├── backend/               # Node.js backend
│   ├── templates/         # HTML infographic templates
│   │   ├── one.html      # Modern card layout
│   │   ├── two.html      # Chart-focused design
│   │   ├── three.html    # Professional layout
│   │   └── four.html     # Versatile template
│   ├── data/             # JSON data storage
│   ├── openAiClient.js   # AI integration with template selection
│   └── server.js         # Express server configuration
├── public/               # Static assets
│   └── files/
│       └── prompt.txt    # AI prompt instructions
└── dist/                # Built frontend files
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- **OpenAI API key** (required for infographic generation)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/infographicsai.git
cd infographicsai
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

3. **Environment Setup** (Required)
```bash
# Create .env file in backend directory
cd backend
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
echo "JWT_SECRET=your_jwt_secret_here" >> .env
cd ..
```

**Important**: The application requires a valid OpenAI API key to function. Without it, infographic generation will fail with an error message.

4. **Start the application**
```bash
# Start frontend (development server)
npm run serve

# Start backend (in new terminal)
cd backend
node server.js
```

5. **Access the application**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000

## 📖 API Endpoints

### Infographics
- `POST /api/infographics` - Generate new infographic with AI template selection
- `GET /api/infographics` - Get all infographics
- `GET /api/infographics/:id` - Get specific infographic
- `DELETE /api/infographics/:id` - Delete infographic

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (requires auth)

### Payments
- `POST /api/create-payment-intent` - Create Stripe payment intent
- `POST /api/webhook` - Handle Stripe webhooks

## 🎯 AI Prompt System

The application uses an advanced two-step AI system to optimize token usage and ensure reliable template selection:

### Step 1: Template Selection
- AI analyzes user content against template descriptions (not full templates)
- Uses `gpt-4-turbo-preview` model with 128k token context limit
- Evaluates content type, visual style needs, and information density
- Returns the most appropriate template filename

### Step 2: Data Integration  
- Loads only the selected template (reducing token usage by 75%)
- AI populates template with user-specific content
- Maintains exact HTML structure and CSS styling
- Preserves all functionality and external dependencies

### Key Benefits
- **Token Efficiency**: Two-step process drastically reduces token usage
- **High Token Limit**: GPT-4 Turbo supports up to 128k tokens
- **Reliable Selection**: Validation ensures valid template selection
- **Fallback Protection**: Graceful handling of invalid responses

## 💾 Data Storage

- **Users**: `backend/data/users.json`
- **Infographics**: `backend/data/infographics.json`
- **Local Storage**: No database required - uses JSON files for data persistence

## 🔧 Development

### Available Scripts
- `npm run serve` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

### Adding New Templates
1. Create new HTML file in `backend/templates/`
2. Update template array and descriptions in `backend/openAiClient.js`
3. Test with various content types

## 🌟 Features in Detail

### AI Template Selection
- Two-step process for optimal template matching
- Analyzes user input for topic identification
- Considers visual aesthetics and layout suitability
- Maintains design integrity during data integration

### Token Optimization
- GPT-4 Turbo model with 128k token context limit
- Two-step approach reduces token usage by 75%
- Efficient template selection without loading full templates
- Robust error handling for API and template issues

### Unlimited Generation
- No rate limiting on infographic creation
- Supports high-volume usage
- Perfect for business and educational use

### Professional Templates
- Modern, responsive HTML/CSS designs
- Chart.js integration for data visualization
- Clean, professional aesthetics
- Cross-browser compatibility

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For questions or issues, please:
1. Check the documentation above
2. Search existing issues on GitHub
3. Create a new issue with detailed description

---

**InfographicsAI** - Transform your data into beautiful, professional infographics with the power of AI.