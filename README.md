# admiral-script

A lightweight AWS Lambda function that fetches bootstrap scripts from the [Admiral](https://getadmiral.com) ad delivery CDN. It validates incoming query parameters and proxies the request to the Admiral delivery API, returning the script payload to the caller.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
  - [API Endpoint](#api-endpoint)
  - [Query Parameters](#query-parameters)
  - [Example Request](#example-request)
  - [Example Response](#example-response)
- [Error Handling](#error-handling)
- [Local Development](#local-development)
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)

---

## Overview

`admiral-script` is a serverless Node.js function deployed on AWS Lambda and exposed via API Gateway. When called, it:

1. Validates that both `publication` and `environment` query parameters are present.
2. Resolves the Admiral publication ID from an environment variable keyed by the publication name.
3. Makes a GET request to the Admiral delivery API to fetch the bootstrap script.
4. Returns the script payload or a structured error response.

---

## Architecture

```
Client
  │
  ▼
AWS API Gateway (prod)
  │
  ▼
AWS Lambda (handler)
  │  Validates query params
  │  Resolves publication ID from env vars
  ▼
Admiral Delivery API
https://delivery.api.getadmiral.com/script/{pubId}/bootstrap?environment={env}
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v20.12.2 (see `.nvmrc`)
- [nvm](https://github.com/nvm-sh/nvm) (recommended for Node version management)
- npm

---

## Setup

```bash
# Clone the repository
git clone <repo-url>
cd admiral-script

# Use the correct Node version
nvm use

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
```

---

## Environment Variables

Environment variables map **publication names** (passed as query params) to their corresponding **Admiral publication IDs**.

| Variable   | Description                                      | Example                          |
|------------|--------------------------------------------------|----------------------------------|
| `INFORUM`  | Admiral publication ID for the Inforum property  | `A-XXXXXXXXXXXXXXXXXXXXXXXX-XX`  |

Add a new entry for each publication you need to support:

```env
PUBLICATION_NAME=A-YOUR-ADMIRAL-PUBLICATION-ID
```

The `publication` query parameter must exactly match an environment variable key (case-sensitive).

---

## Usage

### API Endpoint

```
GET https://ggbepmk06k.execute-api.us-west-2.amazonaws.com/prod/
```

### Query Parameters

| Parameter     | Required | Description                                                        |
|---------------|----------|--------------------------------------------------------------------|
| `publication` | Yes      | The publication name. Must match an environment variable key.      |
| `environment` | Yes      | The Admiral environment to target (e.g. `production`, `staging`).  |

### Example Request

```bash
curl "https://ggbepmk06k.execute-api.us-west-2.amazonaws.com/prod/?publication=INFORUM&environment=production"
```

### Example Response

On success, the Admiral delivery API returns the bootstrap script payload directly:

```json
{
  "script": "..."
}
```

---

## Error Handling

| Scenario                               | Response                                      |
|----------------------------------------|-----------------------------------------------|
| `event` is undefined                   | `{ status: 401, message: "malformed event" }` |
| `publication` param missing or empty   | `{ status: 401, message: "Invalid Publication" }` |
| `environment` param missing or empty   | `{ status: 401, message: "Invalid environment" }` |
| Admiral API returns an error response  | `{ error: { status: <code>, data: <body> } }` |
| Network/request error                  | Returns the error message string              |

---

## Local Development

There is no local server included. To test the handler logic locally, you can invoke it directly in a script:

```js
import { handler } from './index.js'

const result = await handler({
  queryParams: {
    publication: 'INFORUM',
    environment: 'production',
  },
})

console.log(result)
```

Run it with:

```bash
node test.js
```

Ensure your `.env` file is populated with valid publication IDs before running.

---

## Project Structure

```
admiral-script/
├── index.js          # Lambda handler and Admiral API fetch logic
├── package.json      # Project metadata and dependencies
├── .env              # Local environment variables (not committed)
├── .nvmrc            # Node.js version pin
├── .prettierrc       # Prettier formatting config
├── .prettierignore   # Files excluded from Prettier
└── README.md
```

---

## Dependencies

| Package  | Version  | Purpose                              |
|----------|----------|--------------------------------------|
| `axios`  | ^1.7.3   | HTTP client for Admiral API requests |
| `dotenv` | ^16.4.5  | Loads environment variables from `.env` |
