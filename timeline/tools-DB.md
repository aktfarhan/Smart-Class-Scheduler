# UMB Course Scheduler Project Overview

## Tools & Technologies

| Tool / Technology | Purpose                                                  |
| ----------------- | -------------------------------------------------------- |
| **Playwright**    | Web scraping dynamic course catalog pages                |
| **Node.js**       | Backend runtime environment                              |
| **Express**       | Backend web framework to build REST API                  |
| **TypeScript**    | Strongly typed JavaScript for backend & frontend         |
| **Prisma ORM**    | Database ORM for defining schema and querying PostgreSQL |
| **PostgreSQL**    | Relational database for storing course & schedule data   |
| **React**         | Frontend UI library for building interactive web pages   |
| **Tailwind CSS**  | Utility-first CSS framework for styling                  |
| **Git/GitHub**    | Version control and project collaboration                |

---

## Database Tables

### 1. `departments`

| Column  | Type       | Description                |
| ------- | ---------- | -------------------------- |
| `id`    | Integer PK | Unique identifier          |
| `code`  | Text       | Department code (e.g., CS) |
| `title` | Text       | Department title           |

---

### 2. `courses`

| Column          | Type       | Description                   |
| --------------- | ---------- | ----------------------------- |
| `id`            | Integer PK | Unique identifier             |
| `code`          | Text       | Course code (e.g., CS220)     |
| `title`         | Text       | Course title                  |
| `department_id` | Integer FK | Reference to `departments.id` |

---

### 3. `sections`

| Column           | Type       | Description                        |
| ---------------- | ---------- | ---------------------------------- |
| `id`             | Integer PK | Unique identifier                  |
| `section_number` | Text       | Section identifier (e.g., 01, A)   |
| `class_number`   | Text       | Class identifier                   |
| `term`           | Text       | Semester or term (e.g., Fall 2025) |
| `is_async`       | boolean    | If no scheduled meetings (TBA)     |
| `course_id`      | Integer FK | Reference to `courses.id`          |
| `instructor_id`  | Integer FK | Reference to `instructors.id`      |

---

### 4. `meetings`

| Column       | Type       | Description                        |
| ------------ | ---------- | ---------------------------------- |
| `id`         | Integer PK | Unique identifier                  |
| `day`        | Text       | Day of the week (M, T, W, R, F)    |
| `start_time` | Time       | Start time of the meeting          |
| `end_time`   | Time       | End time of the meeting            |
| `location`   | Text       | Location or room number (optional) |
| `section_id` | Integer FK | Reference to `sections.id`         |

---

### 5. `instructors`

| Column       | Type       | Description           |
| ------------ | ---------- | --------------------- |
| `id`         | Integer PK | Unique identifier     |
| `first_name` | Text       | Instructor first name |
| `last_name`  | Text       | Instructor last name  |

---

### 6. `professor_ratings`

| Column          | Type       | Description                     |
| --------------- | ---------- | ------------------------------- |
| `instructor_id` | Integer FK | Reference to `instructors.id`   |
| `rating`        | Float      | Average rating (e.g., 4.3)      |
| `difficulty`    | Float      | Difficulty rating (e.g., 2.5)   |
| `num_reviews`   | Integer    | Number of reviews               |
| `last_updated`  | Timestamp  | Timestamp of last rating update |

---

## Summary

This project combines:

-   **Web scraping** using Playwright to gather course catalog data
-   **Backend API** with Express + TypeScript + Prisma ORM
-   **PostgreSQL** for structured data storage
-   **React + Tailwind** for frontend UI
-   Proper data design with relational tables for courses, sections, instructors, meeting times, and ratings

---
