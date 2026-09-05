<div align="center">

# Divar Clone

### A full-stack classifieds marketplace built with Laravel and Next.js

<p>
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-real-time-chat">Real-time Chat</a> •
  <a href="README.fa.md">راهنمای فارسی</a>
</p>

![Laravel](https://img.shields.io/badge/Laravel-13-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

</div>

## About

Divar Clone is a modern classifieds marketplace inspired by Divar. It provides a complete flow for discovering advertisements, publishing and managing listings, communicating with other users, and administering marketplace content.

The project is organized as a monorepo:

- **Frontend:** Next.js App Router, React, TypeScript, Tailwind CSS
- **Backend:** Laravel REST API, Sanctum authentication, Eloquent ORM
- **Realtime:** Laravel Reverb, Laravel Echo, and private channels

## ✨ Features

- Browse advertisements by category, location, and state
- Advertisement details, image galleries, favorites, notes, and browsing history
- User registration and authentication with OTP verification
- User dashboard for creating, editing, and managing advertisements
- Admin dashboard for users, advertisements, categories, attributes, pages, menus, states, and settings
- Secure private conversations between advertisement participants
- Realtime message delivery and read receipts over WebSockets
- Payment flow with a success callback page
- Soft deletes, trash management, bulk actions, and image processing

## 🧰 Tech Stack

| Layer    | Technologies                                   |
| -------- | ---------------------------------------------- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend  | PHP 8.3+, Laravel 13, Sanctum                  |
| Realtime | Laravel Reverb, Laravel Echo, Pusher JS        |
| Database | Any Laravel-supported database                 |
| Tooling  | Composer, npm, Pest, Laravel Pint, ESLint      |

## 🚀 Getting Started

### Prerequisites

Install the following before continuing:

- PHP 8.3 or newer
- Composer
- Node.js 20 or newer and npm
- A database supported by Laravel

### 1. Clone the repository

```bash
git clone https://github.com/bitwizarder/divar-clone.git
cd divar-clone
```

### 2. Configure the backend

```bash
cd backend
composer install
php artisan key:generate
```

Create `backend/.env` with your local Laravel settings. Configure the database, application URL, Sanctum stateful domains, and CORS settings, then run:

```bash
php artisan migrate
php artisan storage:link
```

> Keep `backend/.env` local. It is ignored by Git and must never contain production credentials in a committed change.

### 3. Configure the frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_REVERB_APP_KEY=my-app-key
NEXT_PUBLIC_REVERB_HOST=127.0.0.1
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_SCHEME=http
```

Then install the frontend dependencies:

```bash
cd ../frontend
npm install
```

### 4. Start the application

Open separate terminals and run:

**Backend API**

```bash
cd backend
php artisan serve
```

**Frontend**

```bash
cd frontend
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 💬 Real-time Chat

The chat uses Laravel Reverb and private channels authenticated through Laravel Sanctum.

In `backend/.env`, configure the broadcaster and Reverb values:

```env
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=local-app
REVERB_APP_KEY=my-app-key
REVERB_APP_SECRET=my-app-secret
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=http
```

Start the Reverb server in a separate terminal:

```bash
cd backend
php artisan reverb:start
```

### Broadcasting and queues

The chat events currently implement `ShouldBroadcastNow`, so they are broadcast immediately and do **not** require a queue worker.

If an event is changed from `ShouldBroadcastNow` to `ShouldBroadcast`, it becomes queued. In that case, start a queue worker as well:

```bash
cd backend
php artisan queue:work
```

For a local setup, keep the API server, frontend, Reverb server, and queue worker (when using `ShouldBroadcast`) running in separate terminals.

## 🗂️ Project Structure

```text
.
├── backend/             # Laravel API, authentication, broadcasts, and admin logic
├── frontend/            # Next.js application and user/admin interfaces
├── backend/routes/      # API, authentication, and broadcasting routes
└── frontend/app/        # App Router pages, layouts, and UI components
```

## 🧪 Quality Checks

Run backend tests:

```bash
cd backend
php artisan test
```

Format PHP code:

```bash
./vendor/bin/pint
```

Run frontend linting:

```bash
cd frontend
npm run lint
```

## 🔐 Environment and Ignored Files

Environment files, dependencies, generated builds, logs, storage keys, and IDE files are intentionally excluded from version control. The repository-level `.gitignore` includes the Laravel backend and Next.js frontend paths, while `backend/.gitignore` contains Laravel-specific defaults.

Never commit real credentials, API keys, Reverb secrets, or production `.env` files.

## 🤝 Contributing

Contributions are welcome. Please create a focused branch, keep changes scoped, run the relevant checks, and open a pull request with a clear description.

## 📄 License

This project is licensed under the MIT License.
