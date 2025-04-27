# backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)  # Allow CORS for frontend communication

# Load movies metadata
movies = pd.read_csv('model/movies_metadata.csv')

# Load saved model files
with open('model/tfidf_matrix.pkl', 'rb') as f:
    tfidf_matrix = pickle.load(f)

with open('model/movie_indices.pkl', 'rb') as f:
    movie_indices = pickle.load(f)

with open('model/cosine_sim.pkl', 'rb') as f:
    cosine_sim = pickle.load(f)

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    selected_movie_ids = data.get('movieIds')

    if not selected_movie_ids or len(selected_movie_ids) < 5:
        return jsonify({'error': 'Please select at least 5 movies.'}), 400

    recommended = []

    for movie_id in selected_movie_ids:
        idx = movie_indices.get(movie_id)
        if idx is not None:
            sim_scores = list(enumerate(cosine_sim[idx]))
            sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
            sim_scores = sim_scores[1:20]  # Get top 20 similar movies

            movie_indices_similar = [i[0] for i in sim_scores]
            recommended.extend(movies.iloc[movie_indices_similar]['movieId'].values)

    # Count how many times each movie is recommended
    recommended = pd.Series(recommended)
    final_recommendations = recommended.value_counts().head(20).index.tolist()

    return jsonify(final_recommendations)

if __name__ == '__main__':
    app.run(debug=True, port=5000)

