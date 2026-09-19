# ScanWise

**Scan it. Understand it. Decide smarter.**

ScanWise helps people understand packaged food products using a barcode lookup, an explainable nutrition insight, and side-by-side product comparison.

## Features

- Manual barcode lookup through the Open Food Facts API
- Camera barcode-scanner interface with a manual-entry fallback
- Nutrition and ingredient display
- Explainable ScanWise Insight score that shows the nutrition factors behind the result
- Two-product comparison for calories, sugar, saturated fat, fibre, protein, and insight score

## Built with

- React and Vite
- Node.js and Express
- Open Food Facts API
- AWS App Runner for the deployed full-stack web service

## Local development

Run the API:

```bash
cd server
node server.js
```

Run the frontend in another terminal:

```bash
cd client
npm run dev
```

Open `http://localhost:5173` and try barcode `3017624010701`.

## AWS deployment

The repository includes `apprunner.yaml`. AWS App Runner builds the React client, serves it through Express, and exposes the API and frontend from one HTTPS URL.

## Note

The ScanWise Insight is an informational nutrition summary, not medical advice.
