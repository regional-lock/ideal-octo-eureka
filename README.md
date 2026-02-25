# 🎬 RegionalSearch — Premium Movie Discovery Platform

![Vercel Deployment](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![TMDB API](https://img.shields.io/badge/TMDB-01b4e4?style=for-the-badge&logo=the-movie-database&logoColor=white)
![JavaScript](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

**RegionalSearch** is a modern movie and TV show discovery platform designed with a high-end **Dark Mode** and **Glassmorphism** aesthetic. It provides users with real-time streaming availability data based on their geographic region.

[🚀 View Live Demo](https://regional-search.vercel.app)

---

## ✨ Key Features

* **⚡ Instant Navigation Search**: Search for your favorite titles from any page with real-time results—no page reloads required.
* **🌍 Regional Streaming Data**: Track exactly where a movie is available (Netflix, Disney+, HBO, etc.) filtered by country.
* **📱 Fully Responsive Design**: Seamless interface from Desktop to Mobile, featuring an interactive **Hamburger Menu** for smaller screens.
* **📂 Structured Explorer**: Dedicated sections for **Movies** and **TV Shows** with smooth pagination.
* **💾 Personal Watchlist**: Save your must-watch collection directly in your browser using LocalStorage.
* **🔗 Clean URL Architecture**: User-friendly navigation using `/movies/:id` and `/tv/:id` formats (powered by Vercel Rewrites).

---

## 🛠️ Technology Stack

* **Frontend**: HTML5, CSS3 (Custom Variables, Flexbox, CSS Grid), Vanilla JavaScript (ES6+).
* **Data Source**: [The Movie Database (TMDB) API](https://www.themoviedb.org/documentation/api).
* **Deployment**: Vercel with custom `vercel.json` for Server-side rewrites.
* **UI Design**: Minimalist Dark Theme with Glassmorphism effects.

---

## 📸 Interface Preview

<img width="1794" height="2185" alt="image" src="https://github.com/user-attachments/assets/a77a5d75-f5e2-471e-84bb-4d63420f7a91" />
<img width="1794" height="1772" alt="image" src="https://github.com/user-attachments/assets/6a60f040-bfde-4d77-98e8-a7e3751a3327" />
<img width="1794" height="1772" alt="image" src="https://github.com/user-attachments/assets/bd0dc43f-d843-4914-a989-19622cf54e36" />
<img width="1794" height="865" alt="image" src="https://github.com/user-attachments/assets/a4a3619c-f65f-443a-85e9-f09b9afdd7f2" />
<img width="1794" height="3336" alt="image" src="https://github.com/user-attachments/assets/c83a1ac3-5094-4b58-9da0-f3e3a9993978" />
<img width="1794" height="2777" alt="image" src="https://github.com/user-attachments/assets/3490c8f6-73b0-4370-a6c0-f2391e4428f7" />



---

## ⚙️ Local Development

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/yourusername/regional-search.git](https://github.com/yourusername/regional-search.git)
    ```
2.  **Get your API Key:**
    Sign up at [TMDB](https://www.themoviedb.org/) to obtain your free API Key.
3.  **Configuration:**
    Open the files and replace the `API_KEY` variable with your own key.
4.  **Run the project:**
    Simply open `index.html` in your browser or use the *Live Server* extension in VS Code.

---

## 🚀 Vercel Deployment Configuration

This project utilizes `vercel.json` to handle clean URL routing:

```json
{
  "cleanUrls": true,
  "rewrites": [
    { "source": "/movies/:id", "destination": "/detail.html?id=:id&type=movie" },
    { "source": "/tv/:id", "destination": "/detail.html?id=:id&type=tv" }
  ]
}
