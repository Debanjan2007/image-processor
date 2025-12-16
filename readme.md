# Image Processing Service 🖼️

A lightweight Express + TypeScript service for handling image uploads and processing using ImageKit and MongoDB.

---

## ✅ Quick overview

- Language: **TypeScript**
- Web framework: **Express**
- Database: **MongoDB** (via Mongoose)
- File uploads: **multer**
- Image CDN: **ImageKit**

---

## 🔧 Prerequisites

- Node.js (recommended >= 18)
- npm (comes with Node.js) or Yarn
- Docker & Docker Compose (optional, recommended for local MongoDB)

> On Windows, ensure Docker Desktop is installed and running before using Docker compose.

---

## 📥 Installation

1. Clone the repository:

```bash
git clone https://github.com/Debanjan2007/image-processor.git
cd image-processor
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root (see **Environment** below).

---

## 🧩 Environment variables (.env)

Create a `.env` with the variables your app needs. Example:

```env
NODE_ENV=development
MONGO_URI=mongodb://roadmap:roadmapimageprocess123@localhost:27017/?authSource=admin
JWT_SECRET=your_jwt_secret_here
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
```

- When using the included Docker Compose, the `MONGO_URI` can point to `localhost:27017` (see `docker/docker-compose.yml`).

---

## ▶️ Available scripts

- `npm run build` — compile TypeScript to `dist/` (uses `npx tsc`).
- `npm start` — run the compiled app from `dist`.

Tip: Add convenience scripts while developing (example):

```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
  "build": "npx tsc",
  "start": "node ./dist/index.js",
  "lint": "eslint . --ext .ts",
  "format": "prettier --write ."
}
```

---

## 🐳 Run with Docker (local MongoDB)

Start DB & admin UI from the provided compose file:

```bash
cd docker
docker-compose up -d
```

- Mongo will be available on port `27017`.
- Mongo Express UI will be available on `http://localhost:8081`.

After starting the DB, set `MONGO_URI` to the connection string shown in the example `.env`.

---

## 📦 Package guidance

- Add runtime dependencies with:

```bash
npm install <package-name>
# or
npm i <package-name>
```

- Add development-only dependencies with:

```bash
npm install -D <package-name>
# or
npm i -D <package-name>
```

- Recommended dev tools for this repo:
  - `typescript`, `ts-node-dev` or `nodemon` (fast dev restart)
  - `eslint`, `prettier` (code quality & formatting)
  - `@types/*` for packages that need TypeScript types

- Keep dependencies up-to-date:
  - `npm outdated` to see outdated packages
  - `npm audit` to spot security issues
  - `npm update` to update minor/patch versions

---

## 🧪 Testing & Linting

- There are no tests in the repo yet; we recommend using Jest + ts-jest for unit tests.
- Add `eslint` + `prettier` configs and scripts to keep a consistent code style.

---

## 🔍 Troubleshooting

- If TypeScript build fails, run `npx tsc --noEmit` to see errors.
- If Mongo connection fails while using Docker, ensure `docker-compose` is up and ports are not blocked by Windows firewall.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Add tests and keep code style consistent
4. Open a pull request with a clear description of your change

---

## 📄 License

This repository is currently licensed under **ISC** (see `package.json`).

---