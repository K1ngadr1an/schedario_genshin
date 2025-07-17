from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os

app = Flask(__name__)
# Permetti richieste da qualsiasi origine (CORS)
CORS(app, resources={r'/*': {'origins': '*'}})

# Aggiungi manualmente gli header CORS a tutte le risposte
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Connection string MongoDB Atlas (password aggiornata)
MONGO_URI = "mongodb+srv://K1ngadr1an:bDlRoZpdwu2dAvf8@cluster0.cpykexo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

client = MongoClient(MONGO_URI)
db = client["genshin"]
characters = db["characters"]
calendars = db["calendars"]

@app.route("/api/character/<name>", methods=["GET"])
def get_character(name):
    doc = characters.find_one({"name": name})
    if doc:
        doc.pop("_id", None)
        return jsonify(doc), 200
    else:
        return jsonify({"error": "Character not found"}), 404

@app.route("/api/character/<name>", methods=["POST"])
def save_character(name):
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    data["name"] = name.strip()  # Forza il nome esatto e senza spazi
    characters.replace_one({"name": name.strip()}, data, upsert=True)
    return jsonify({"status": "ok"})

@app.route("/api/characters", methods=["GET"])
def list_characters():
    docs = list(characters.find({}, {"_id": 0, "name": 1}))
    return jsonify(docs)

@app.route("/api/calendar/<username>", methods=["GET"])
def get_calendar(username):
    doc = calendars.find_one({"username": username})
    if doc and "tasks" in doc:
        return jsonify(doc["tasks"]), 200
    else:
        return jsonify({}), 200  # Nessun calendario trovato, restituisci oggetto vuoto

@app.route("/api/calendar/<username>", methods=["POST"])
def save_calendar(username):
    data = request.json
    if not isinstance(data, dict):
        return jsonify({"error": "Invalid data"}), 400
    calendars.replace_one({"username": username}, {"username": username, "tasks": data}, upsert=True)
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True) 