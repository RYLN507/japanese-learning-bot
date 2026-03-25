# Japanese Immersion Chatbot — 니혼고공부할랭

AI-powered Japanese language learning chatbot that simulates natural conversation with a Japanese friend. Available as both a **React web app** and a **LINE bot**.

## Features

- **Natural conversation** — AI mirrors the user's tone (casual ↔ formal) using slang, fillers, and expressions like だよね, マジ?, なんか
- **Grammar & vocabulary breakdown** — Every AI response includes 문법 (grammar) and 어휘 (vocabulary) explanations
- **Korean translation toggle** — Immersion mode hides translations; reveal on demand
- **Text-to-speech** — Listen to Japanese pronunciation via Web Speech API
- **Daily missions & XP system** — Gamified learning with streak tracking
- **LINE bot integration** — Practice Japanese directly in LINE chat

---

## Tech Stack

| Layer           | Technology                             |
| --------------- | -------------------------------------- |
| Frontend        | React.js, CSS-in-JS, Web Speech API    |
| Backend         | Node.js, Express.js                    |
| AI              | Anthropic Claude API (claude-sonnet-4) |
| Messaging       | LINE Messaging API (Webhook)           |
| Deployment      | Heroku (Procfile, Config Vars)         |
| Version Control | Git, GitHub                            |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/RYLN507/japanese-learning-bot.git
cd japanese-learning-bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```
ANTHROPIC_API_KEY=your_anthropic_api_key
CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
CHANNEL_SECRET=your_line_channel_secret
```

### 4. Run locally

```bash
# Terminal 1 — Backend server
node server.js

# Terminal 2 — React frontend
npm start
```

Frontend: `http://localhost:3000`
Backend: `http://localhost:3001`

---

## ☁️ Deployment (Heroku)

```bash
# Login and link repo
heroku login
heroku git:remote -a japanese-learning-bot

# Set environment variables
heroku config:set ANTHROPIC_API_KEY=your_key
heroku config:set CHANNEL_ACCESS_TOKEN=your_token
heroku config:set CHANNEL_SECRET=your_secret

# Deploy
git push heroku main
```

LINE Webhook URL:

```
https://your-app-name.herokuapp.com/webhook
```

---

## 📁 Project Structure

```
├── public/
├── src/
│   ├── App.js                          # React entry point
│   └── japanese-korean-immersion-v2.jsx  # Main chat component
├── server.js                           # Express backend + LINE webhook
├── Procfile                            # Heroku process config
├── package.json
└── .env                                # (not committed)
```

---

## Security Notes

- Never commit `.env` to Git — add it to `.gitignore`
- Store all API keys in Heroku Config Vars for production
- Rotate keys immediately if accidentally exposed

---

## License

MIT

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
