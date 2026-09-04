<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Support Ops Copilot

This is a modern React application built to streamline customer support triage and resolution. 
It uses the Gemini AI model to analyze support tickets, classify them, determine priority, generate draft responses, and more.

## Performance Optimizations

To ensure the fastest possible interaction speed, the application utilizes several React performance optimizations:
- **`React.memo`**: All major components (`AnalysisResult`, `TicketHeader`, `TicketChat`, `SuggestedResponseBlock`, `JiraDraftBlock`, etc.) are memoized to prevent unnecessary re-renders when analyzing new tickets or interacting with localized state (such as the KB Editor).
- **`useCallback`**: Core state updater functions are memoized to maintain stable references, avoiding child re-renders.
- **Code Splitting**: Heavy components like the Rich Text Editor (`react-quill-new` in `JiraDraftBlock`) are lazy-loaded using `React.lazy` and `Suspense` to reduce the initial JavaScript bundle size.
- **`react-markdown` Optimization**: Markdown rendering in the Chat module is wrapped in `Suspense` for asynchronous rendering without blocking the main UI thread.

## Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: [https://ai.studio/apps/f5fba4f9-2d1a-42f7-ba6e-fd0a425492aa](https://ai.studio/apps/f5fba4f9-2d1a-42f7-ba6e-fd0a425492aa)

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in `.env.example` or `.env.local` to your Gemini API key
3. Run the app:
   `npm run dev`
