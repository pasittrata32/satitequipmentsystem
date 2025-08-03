# School Equipment Booking System (ระบบการจอง ยืม-คืนครุภัณฑ์โรงเรียน)

A web application for managing the booking, borrowing, and returning of teaching equipment for Satit Udomseuksa School.

แอปพลิเคชันสำหรับจัดการการจอง, ยืม, และคืนอุปกรณ์การสอนสำหรับโรงเรียนสาธิตอุดมศึกษา

---

## ✨ Features (คุณสมบัติ)

-   **Authentication:** Login system for teachers and administrators. (ระบบล็อกอินสำหรับครูและผู้ดูแลระบบ)
-   **Dashboard:** Real-time overview of equipment booking statuses. (ภาพรวมสถานะการยืม-คืนอุปกรณ์แบบเรียลไทม์)
-   **Booking/Borrowing:** A form for teachers to book or borrow equipment. (ฟอร์มสำหรับครูเพื่อจองหรือยืมอุปกรณ์)
-   **Booking Schedule:** A grid view showing availability across classrooms and periods. (ตารางการจองอุปกรณ์ในแต่ละห้องเรียน)
-   **Admin Management:** Admins can manage users, view reports, and create bookings for teachers. (ผู้ดูแลระบบสามารถจัดการผู้ใช้, ดูรายงาน, และยืมอุปกรณ์ในนามของครู)
-   **Reporting:** Generate and export usage reports to Excel. (สร้างและส่งออกรายงานการใช้งานเป็นไฟล์ Excel)
-   **Bilingual:** Supports both Thai and English languages. (รองรับภาษาไทยและภาษาอังกฤษ)

---

## Architecture

This project is a single-page application (SPA) built with React. It operates as a static frontend that communicates with a Google Apps Script backend.

-   **Frontend:** The code in this repository. It's a "no-build" setup, meaning it uses ES modules, an in-browser transpiler (Babel Standalone), and imports dependencies directly from a CDN in the browser.
-   **Backend:** A **separate** Google Apps Script project that acts as a REST API and interacts with a Google Sheet as its database. **The backend code is not included in this repository.** You must create and deploy it separately.

---

## 🚀 Tech Stack (เทคโนโลยีที่ใช้)

-   **Frontend:**
    -   React 19
    -   TypeScript
    -   React Router
    -   Tailwind CSS
    -   Babel Standalone (for in-browser transpilation)
-   **Backend:**
    -   Google Apps Script
    -   Google Sheets (as database)
-   **Development:**
    -   `live-server` for local development

---

## 🛠️ Getting Started (การติดตั้งและใช้งาน)

Follow these steps to set up and run the project locally.

### Prerequisites (ข้อกำหนดเบื้องต้น)

1.  **Google Apps Script Backend:** You must have a Google Apps Script project deployed as a Web App. This script will handle data storage and retrieval from a Google Sheet. Ensure its permissions are set to "Anyone" for access if you want it to be public, or configure it for your Google Workspace domain.
2.  **Node.js & npm:** Required to run the local development server. You can download it from [nodejs.org](https://nodejs.org/).

### Setup Steps (ขั้นตอนการตั้งค่า)

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
    cd YOUR_REPOSITORY
    ```

2.  **Install Development Dependencies:**
    This command installs `live-server`, which is used to run the project.
    ```bash
    npm install
    ```

3.  **Configure the Backend API URL:**
    -   Open the file: `services/api.ts`.
    -   Find the `SCRIPT_URL` constant.
    -   Replace the placeholder URL with the **deployment URL of your Google Apps Script Web App**.
    ```typescript
    // services/api.ts
    const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
    ```
    > **Important:** Your Apps Script deployment URL should end in `/exec`.

4.  **Run the Application Locally:**
    This command starts a local server and opens the application in your default web browser.
    ```bash
    npm start
    ```
    The app will be available at `http://localhost:3000`.

---

## 📦 Deployment (การนำไปใช้งานจริง)

Since this is a static web application with no build step, deployment is straightforward. You can host the files on any static hosting provider.

1.  Ensure your `services/api.ts` file points to your **production** Google Apps Script deployment URL.
2.  Upload all the project files (e.g., `.html`, `.tsx`, `.ts`, `components/`, `pages/`, etc.) to your hosting provider.

### Vercel Deployment

If you are deploying to Vercel, this project includes a `vercel.json` file. This file configures Vercel to correctly handle a Single-Page Application (SPA) by redirecting all page requests to `index.html`, allowing the client-side router (`react-router-dom`) to manage the pages. No extra configuration is needed on the Vercel dashboard.

**Popular Static Hosting Options:**
-   Firebase Hosting
-   GitHub Pages
-   Netlify
-   Vercel
-   AWS S3

---

## 📂 Project Structure (โครงสร้างโปรเจกต์)

```
.
├── components/      # Reusable React components
├── context/         # React Context providers
├── pages/           # Page components for each route
├── services/        # API service for backend communication
├── utils/           # Helper functions
├── App.tsx          # Main application component with routing
├── constants.ts     # Application-wide constants
├── index.html       # Main HTML entry point (loads scripts from CDN)
├── index.tsx        # React root renderer
├── metadata.json    # Project metadata for some hosting platforms
├── package.json     # Project configuration and scripts
├── tsconfig.json    # TypeScript configuration for IDE support
├── vercel.json      # Vercel deployment configuration
└── README.md        # This file
```