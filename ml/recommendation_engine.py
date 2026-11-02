"""
AI Mock Interview Portal - Recommendation Engine
Uses scikit-learn and numpy for performance analysis and topic recommendations.
This script analyzes interview performance data and generates personalized study recommendations.
"""

import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import json
import os

# ============================================
# Sample data structure (replace with DB data)
# ============================================

TOPICS = [
    "dsa", "system-design", "behavioral", "database",
    "oop", "web-dev", "devops", "networking",
    "operating-systems", "ai-ml"
]

TOPIC_NAMES = {
    "dsa": "Data Structures & Algorithms",
    "system-design": "System Design",
    "behavioral": "Behavioral Interviews",
    "database": "Database Design",
    "oop": "Object-Oriented Programming",
    "web-dev": "Web Development",
    "devops": "DevOps & Cloud",
    "networking": "Computer Networks",
    "operating-systems": "Operating Systems",
    "ai-ml": "AI & Machine Learning"
}


class PerformanceAnalyzer:
    """Analyzes interview performance and generates recommendations."""

    def __init__(self):
        self.scaler = StandardScaler()
        self.topics = TOPICS

    def analyze_performance(self, session_data):
        """
        Analyze performance data from interview sessions.
        Input: list of dicts with topic, score, difficulty, num_questions
        Output: analysis report with weak areas and recommendations
        """
        if not session_data or len(session_data) < 2:
            return {
                "recommendations": [],
                "insights": ["Complete more interviews to get personalized recommendations."],
                "confidence": 0.0
            }

        # Extract topic scores
        topic_scores = {}
        for session in session_data:
            topic = session.get("topic", "")
            score = session.get("overallScore", 0)
            if topic not in topic_scores:
                topic_scores[topic] = []
            topic_scores[topic].append(score)

        # Calculate averages per topic
        topic_averages = {}
        for topic, scores in topic_scores.items():
            topic_averages[topic] = np.mean(scores)

        # Identify weak areas (below 70)
        weak_topics = [(t, s) for t, s in topic_averages.items() if s < 70]
        weak_topics.sort(key=lambda x: x[1])  # Sort by score ascending

        # Cluster topics into performance groups
        if len(topic_averages) >= 2:
            clusters = self._cluster_topics(topic_averages)
        else:
            clusters = {"weak": list(weak_topics), "average": [], "strong": []}

        # Generate recommendations
        recommendations = []
        for topic, score in weak_topics[:5]:  # Top 5 weak areas
            improvement_needed = 100 - score
            confidence = min(95.0, improvement_needed * 0.8 + np.random.uniform(0, 10))

            recommendations.append({
                "topic": TOPIC_NAMES.get(topic, topic),
                "current_score": round(score, 1),
                "target_score": 80.0,
                "improvement_needed": round(improvement_needed, 1),
                "priority": "high" if score < 50 else "medium" if score < 70 else "low",
                "confidence": round(confidence, 1),
                "study_suggestions": self._get_study_suggestions(topic, improvement_needed)
            })

        return {
            "recommendations": recommendations,
            "topic_averages": {t: round(s, 1) for t, s in topic_averages.items()},
            "overall_average": round(np.mean(list(topic_averages.values())), 1),
            "total_sessions": len(session_data),
            "insights": self._generate_insights(topic_averages),
            "clusters": clusters,
            "confidence": round(np.mean([r["confidence"] for r in recommendations]) if recommendations else 0, 1)
        }

    def _cluster_topics(self, topic_averages):
        """Use KMeans to cluster topics into performance groups."""
        scores = list(topic_averages.values())
        topics = list(topic_averages.keys())

        if len(scores) < 3:
            return {
                "weak": [(t, s) for t, s in zip(topics, scores) if s < 60],
                "average": [(t, s) for t, s in zip(topics, scores) if 60 <= s < 80],
                "strong": [(t, s) for t, s in zip(topics, scores) if s >= 80]
            }

        X = np.array(scores).reshape(-1, 1)
        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X)

        cluster_centers = kmeans.cluster_centers_.flatten()
        cluster_order = np.argsort(cluster_centers)

        clusters = {"weak": [], "average": [], "strong": []}
        cluster_names = ["weak", "average", "strong"]

        for topic, score, label in zip(topics, scores, labels):
            rank = list(cluster_order).index(label)
            clusters[cluster_names[rank]].append((topic, score))

        return clusters

    def _generate_insights(self, topic_averages):
        """Generate textual insights from performance data."""
        insights = []
        if not topic_averages:
            return ["No data available yet."]

        avg = np.mean(list(topic_averages.values()))
        topics_by_score = sorted(topic_averages.items(), key=lambda x: x[1], reverse=True)

        if avg >= 80:
            insights.append("Great overall performance! Focus on maintaining consistency.")
        elif avg >= 60:
            insights.append("Good progress! Focus on your weaker topics to improve further.")
        else:
            insights.append("Keep practicing! Consistent daily practice will improve your scores.")

        best_topic, best_score = topics_by_score[0]
        worst_topic, worst_score = topics_by_score[-1]

        insights.append(f"Strongest area: {TOPIC_NAMES.get(best_topic, best_topic)} ({round(best_score)}%)")
        insights.append(f"Weakest area: {TOPIC_NAMES.get(worst_topic, worst_topic)} ({round(worst_score)}%)")

        return insights

    def _get_study_suggestions(self, topic, improvement_needed):
        """Return study suggestions based on topic and improvement needed."""
        suggestions = {
            "dsa": ["Practice on LeetCode (Easy → Medium → Hard)", "Review data structure implementations", "Solve 5 problems daily with timed sessions"],
            "system-design": ["Read 'System Design Interview' by Alex Xu", "Study real-world system architectures", "Practice designing systems on paper before coding"],
            "behavioral": ["Practice STAR method responses", "Prepare stories for common behavioral questions", "Record yourself answering and review"],
            "database": ["Practice SQL queries on HackerRank", "Study normalization and indexing concepts", "Learn about distributed databases"],
            "oop": ["Review SOLID principles with code examples", "Study common design patterns", "Practice refactoring legacy code"],
            "web-dev": ["Build full-stack projects", "Study React/Node.js best practices", "Learn about security vulnerabilities"],
            "devops": ["Set up CI/CD pipelines locally", "Learn Docker and Kubernetes basics", "Study cloud architecture patterns"],
            "networking": ["Review OSI model thoroughly", "Study HTTP/HTTPS protocols in depth", "Practice network troubleshooting"],
            "operating-systems": ["Study process scheduling algorithms", "Review memory management concepts", "Practice OS-level programming"],
            "ai-ml": ["Study ML algorithms with scikit-learn", "Build projects with TensorFlow/PyTorch", "Practice explaining algorithms simply"],
        }

        base = suggestions.get(topic, ["Study fundamentals", "Practice regularly", "Review past mistakes"])

        # Add intensity based on improvement needed
        if improvement_needed > 40:
            base.insert(0, "This is a high-priority area - dedicate extra study time")
        elif improvement_needed > 20:
            base.insert(0, "Moderate improvement needed - consistent practice will help")

        return base


class ScorePredictor:
    """Predicts future performance using simple regression."""

    def __init__(self):
        self.model_data = {}

    def predict_next_score(self, topic, historical_scores):
        """
        Simple linear regression to predict next session score.
        Uses trend analysis from historical data.
        """
        if len(historical_scores) < 3:
            return {
                "predicted_score": np.mean(historical_scores) if historical_scores else 50,
                "confidence": 0.3,
                "trend": "insufficient_data"
            }

        scores = np.array(historical_scores)
        x = np.arange(len(scores)).reshape(-1, 1)

        # Simple linear regression
        from sklearn.linear_model import LinearRegression
        model = LinearRegression()
        model.fit(x, scores)

        predicted = model.predict([[len(scores)]])[0]
        predicted = np.clip(predicted, 0, 100)

        # Calculate trend
        if len(scores) >= 3:
            recent_trend = np.mean(scores[-3:]) - np.mean(scores[:3])
            if recent_trend > 5:
                trend = "improving"
            elif recent_trend < -5:
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "insufficient_data"

        confidence = min(0.8, len(scores) / 10.0)

        return {
            "predicted_score": round(float(predicted), 1),
            "confidence": round(confidence, 2),
            "trend": trend,
            "topic": topic
        }


# ============================================
# Main execution - demo with sample data
# ============================================

if __name__ == "__main__":
    # Sample session data
    sample_sessions = [
        {"topic": "dsa", "overallScore": 45, "difficulty": "medium", "numQuestions": 5},
        {"topic": "dsa", "overallScore": 52, "difficulty": "medium", "numQuestions": 5},
        {"topic": "system-design", "overallScore": 65, "difficulty": "medium", "numQuestions": 5},
        {"topic": "behavioral", "overallScore": 78, "difficulty": "easy", "numQuestions": 5},
        {"topic": "database", "overallScore": 55, "difficulty": "medium", "numQuestions": 5},
        {"topic": "web-dev", "overallScore": 82, "difficulty": "hard", "numQuestions": 5},
        {"topic": "dsa", "overallScore": 58, "difficulty": "hard", "numQuestions": 5},
        {"topic": "oop", "overallScore": 70, "difficulty": "medium", "numQuestions": 5},
        {"topic": "networking", "overallScore": 42, "difficulty": "medium", "numQuestions": 5},
        {"topic": "devops", "overallScore": 60, "difficulty": "medium", "numQuestions": 5},
    ]

    print("=" * 60)
    print("AI Mock Interview - Performance Analysis Engine")
    print("=" * 60)

    # Performance Analysis
    analyzer = PerformanceAnalyzer()
    analysis = analyzer.analyze_performance(sample_sessions)

    print(f"\nTotal Sessions: {analysis['total_sessions']}")
    print(f"Overall Average: {analysis['overall_average']}%")
    print(f"Confidence: {analysis['confidence']}%")

    print("\nTopic Averages:")
    for topic, score in sorted(analysis['topic_averages'].items(), key=lambda x: x[1]):
        bar = "█" * int(score / 5)
        print(f"  {topic:20s}: {score:.1f}%  {bar}")

    print("\nRecommendations:")
    for rec in analysis['recommendations']:
        print(f"  [{rec['priority'].upper()}] {rec['topic']}")
        print(f"    Current: {rec['current_score']}% → Target: {rec['target_score']}%")
        print(f"    Confidence: {rec['confidence']}%")
        print(f"    Suggestions: {', '.join(rec['study_suggestions'][:2])}")
        print()

    print("Insights:")
    for insight in analysis['insights']:
        print(f"  • {insight}")

    # Score Prediction
    print("\n" + "=" * 60)
    print("Score Predictions")
    print("=" * 60)

    predictor = ScorePredictor()
    dsa_scores = [45, 52, 58]
    prediction = predictor.predict_next_score("dsa", dsa_scores)
    print(f"\nDSA Prediction: {prediction['predicted_score']}% (trend: {prediction['trend']})")
    print(f"Confidence: {prediction['confidence']}")

    # Save results to JSON
    output = {
        "analysis": analysis,
        "predictions": {
            "dsa": predictor.predict_next_score("dsa", dsa_scores),
            "behavioral": predictor.predict_next_score("behavioral", [78, 80, 75]),
        }
    }

    with open("recommendation_results.json", "w") as f:
        json.dump(output, f, indent=2)

    print("\nResults saved to recommendation_results.json")
    print("\n" + "=" * 60)
    print("Setup complete! Run this with: python recommendation_engine.py")
    print("=" * 60)
