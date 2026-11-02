# AI Mock Interview Portal - Setup Guide

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React.js (JSX) + Tailwind CSS + Vite |
| Backend | Java Spring Boot + Spring Security + JWT |
| Database | MySQL |
| AI Service | OpenAI API (integrated in Spring Boot) |
| ML (Optional) | Python + scikit-learn + numpy |

---

## Prerequisites

1. **Java JDK 17+** - Download from https://adoptium.net/
2. **Maven 3.9+** - Download from https://maven.apache.org/download.cgi
3. **Node.js 18+** - Download from https://nodejs.org/
4. **MySQL 8.0+** - Download from https://dev.mysql.com/downloads/
5. **Python 3.10+** (optional) - Download from https://python.org/

---

## Step 1: Setup MySQL Database

1. Install MySQL and start the MySQL service
2. Open MySQL Workbench or command line
3. Run the database initialization script:

```sql
mysql -u root -p < database/init.sql
```

Or copy-paste the contents of `database/init.sql` into MySQL Workbench and execute it.

---

## Step 2: Setup Spring Boot Backend

1. Navigate to the backend folder:
```bash
cd backend
```

2. Update `src/main/resources/application.properties` with your MySQL credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/mock_interview_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

3. Add your OpenAI API key in `application.properties`:
```properties
app.openai.api-key=sk-your-openai-api-key-here
```

4. Generate a JWT secret key:
```properties
app.jwt.secret=YourVerySecretKeyThatIsAtLeast32CharactersLong!!!
```

5. Build and run the backend:
```bash
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

---

## Step 3: Setup React.js Frontend

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

The Vite proxy is configured to forward `/api` requests to `http://localhost:8080`.

---

## Step 4: (Optional) Run Python ML Engine

1. Navigate to the ml folder:
```bash
cd ml
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run the recommendation engine:
```bash
python recommendation_engine.py
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user info |
| GET | `/api/interview/topics` | Get available topics |
| POST | `/api/interview/start` | Start new interview session |
| GET | `/api/interview/session/{id}` | Get session details |
| POST | `/api/interview/submit-answer` | Submit answer for evaluation |
| POST | `/api/interview/complete/{id}` | Complete session |
| GET | `/api/dashboard/sessions` | Get all sessions |
| GET | `/api/dashboard/stats` | Get profile stats |
| GET | `/api/dashboard/topic-stats` | Get topic-wise stats |
| GET | `/api/dashboard/recommendations` | Get topic recommendations |
| GET | `/api/dashboard/score-history` | Get score history for charts |

---

## Project Structure

```
mock-interview-portal-standalone/
├── backend/                    # Spring Boot Java Backend
│   ├── pom.xml
│   └── src/main/java/com/interviewai/
│       ├── MockInterviewApplication.java
│       ├── config/
│       │   ├── SecurityConfig.java
│       │   ├── CorsConfig.java
│       │   └── OpenAIConfig.java
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── InterviewController.java
│       │   └── DashboardController.java
│       ├── entity/
│       │   ├── User.java
│       │   ├── InterviewSession.java
│       │   ├── SessionQuestion.java
│       │   ├── QuestionEvaluation.java
│       │   ├── TopicStat.java
│       │   └── Recommendation.java
│       ├── repository/
│       │   ├── UserRepository.java
│       │   ├── InterviewSessionRepository.java
│       │   ├── SessionQuestionRepository.java
│       │   ├── QuestionEvaluationRepository.java
│       │   ├── TopicStatRepository.java
│       │   └── RecommendationRepository.java
│       ├── security/
│       │   ├── JwtTokenProvider.java
│       │   ├── JwtAuthenticationFilter.java
│       │   └── CustomUserDetailsService.java
│       └── service/
│           └── AiService.java
├── frontend/                   # React.js JSX Frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api.js
│       ├── AuthContext.jsx
│       ├── index.css
│       └── pages/
│           ├── Home.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── InterviewSetup.jsx
│           ├── InterviewSession.jsx
│           ├── InterviewResults.jsx
│           ├── Dashboard.jsx
│           └── Profile.jsx
├── database/
│   └── init.sql                # MySQL schema
├── ml/
│   ├── recommendation_engine.py
│   └── requirements.txt
└── SETUP_GUIDE.md
```

---

## Troubleshooting

**MySQL connection refused:** Make sure MySQL service is running. On Windows, open Services and start "MySQL80".

**Port 8080 already in use:** Change the port in `application.properties`:
```properties
server.port=8081
```
Also update `vite.config.js` proxy target.

**OpenAI API errors:** The system has fallback questions built-in. Even without an API key, the app works with pre-defined questions.

**CORS errors:** Make sure the backend CORS config allows `http://localhost:3000`.

**npm install fails:** Try:
```bash
npm install --legacy-peer-deps
```

---

## Test Account

After running `database/init.sql`, a test user is created:
- Email: `test@test.com`
- Password: `test123`
