from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allow all origins by default

# Load models
with open('model/tfidf_matrix.pkl', 'rb') as f:
    tfidf_matrix = pickle.load(f)

with open('model/movie_indices.pkl', 'rb') as f:
    movie_indices = pickle.load(f)

with open('model/cosine_sim.pkl', 'rb') as f:
    cosine_sim = pickle.load(f)

# Load movies data if needed
movies = pd.read_csv('model/movies.csv')

# Function to recommend movies
def recommend_movies(movie_ids):
    sim_scores = {}
    
    for movie_id in movie_ids:
        idx = movie_indices.get(movie_id)
        if idx is not None:
            scores = list(enumerate(cosine_sim[idx]))
            for i, score in scores:
                if i not in movie_ids:  # Avoid recommending the input movies
                    sim_scores[i] = sim_scores.get(i, 0) + score
    
    sorted_scores = sorted(sim_scores.items(), key=lambda x: x[1], reverse=True)
    recommended_movie_indices = [i for i, _ in sorted_scores[:20]]
    recommended_movies = movies.iloc[recommended_movie_indices][['movieId', 'title']].to_dict(orient='records')
    
    return recommended_movies

# Routes
@app.route('/')
def index():
    return "Aether Movie Match Backend is Running!"

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    movie_ids = data.get('movie_ids', [])
    
    if not movie_ids:
        return jsonify({"error": "No movie_ids provided."}), 400
    
    recommendations = recommend_movies(movie_ids)
    return jsonify(recommendations)

# Run the app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
