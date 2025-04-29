"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { AlertCircle, ChevronDown, Terminal, Download } from "lucide-react"

export default function BackendSetupGuide() {
  const [isOpen, setIsOpen] = useState(false)

  const handleDownloadBackend = () => {
    // Create a blob with the Flask backend code
    const backendCode = `
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
`

    const blob = new Blob([backendCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    // Create a temporary link and trigger download
    const a = document.createElement("a")
    a.href = url
    a.download = "app.py"
    document.body.appendChild(a)
    a.click()

    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3 mb-2">
        <AlertCircle className="text-amber-400 w-5 h-5" />
        <h3 className="font-medium">Backend Setup Required</h3>
      </div>

      <p className="text-slate-300 mb-4">
        To get personalized movie recommendations, you need to run the Flask backend locally.
      </p>

      <div className="flex flex-wrap gap-3 mb-4">
        <Button onClick={handleDownloadBackend} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Backend Code
        </Button>
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="flex items-center justify-between w-full">
            <span>View Setup Instructions</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "transform rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Step 1: Create a project directory
              </h4>
              <pre className="bg-slate-900 p-3 rounded-md overflow-x-auto text-sm">
                <code>mkdir movie-recommender-backend cd movie-recommender-backend</code>
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Step 2: Create a virtual environment
              </h4>
              <pre className="bg-slate-900 p-3 rounded-md overflow-x-auto text-sm">
                <code>
                  # For Windows python -m venv venv venv\Scripts\activate # For macOS/Linux python3 -m venv venv source
                  venv/bin/activate
                </code>
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Step 3: Install dependencies
              </h4>
              <pre className="bg-slate-900 p-3 rounded-md overflow-x-auto text-sm">
                <code>pip install flask flask-cors pandas numpy scikit-learn</code>
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Step 4: Save the downloaded app.py file to your project directory
              </h4>
              <p className="text-slate-300 text-sm">
                Move the downloaded app.py file to your movie-recommender-backend directory.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Step 5: Create model directory and download required files
              </h4>
              <p className="text-slate-300 text-sm mb-2">
                Create a directory named "model" in your project folder and download these files:
              </p>
              <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                <li>movies_metadata.csv</li>
                <li>tfidf_matrix.pkl</li>
                <li>movie_indices.pkl</li>
                <li>cosine_sim.pkl</li>
              </ul>
              <p className="text-slate-300 text-sm mt-2">
                Note: Since we don't have access to the original files, you may need to create these files using a movie
                dataset like MovieLens.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Step 6: Run the Flask app
              </h4>
              <pre className="bg-slate-900 p-3 rounded-md overflow-x-auto text-sm">
                <code>python app.py</code>
              </pre>
            </div>

            <p className="text-slate-300">
              Once the Flask app is running, it will be available at http://localhost:5000. The frontend will
              automatically connect to it for personalized recommendations.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
