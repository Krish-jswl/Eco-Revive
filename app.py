from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)

ISSUES_FILE = "data/issues.json"

os.makedirs("data", exist_ok=True)

def read_json(path, default=None):
    if default is None:
        default = []
    if not os.path.exists(path):
        write_json(path, default)
        return default
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default

def write_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/raise_issues")
def raise_issues():
    issues = read_json(ISSUES_FILE)
    return render_template("raise_issues.html", issues=issues)

@app.route("/take_issues")
def take_issues():
    issues = read_json(ISSUES_FILE)
    return render_template("take_issues.html", issues=issues)

@app.route("/api/issues", methods=["POST"])
def api_create_issue():
    issues = read_json(ISSUES_FILE)

    title = request.json.get("title", "").strip()
    description = request.json.get("description", "").strip()
    target_amount = int(request.json.get("target_amount", 0))

    new_issue = {
        "id": (issues[-1]["id"] if issues else 0) + 1,
        "title": title,
        "description": description,
        "target_amount": target_amount,
        "collected_amount": 0,
        "status": "open",
        "taken_by": None
    }

    issues.append(new_issue)
    write_json(ISSUES_FILE, issues)

    return jsonify({"success": True})

@app.route("/api/issues/<int:issue_id>/take", methods=["POST"])
def api_take_issue(issue_id):
    issues = read_json(ISSUES_FILE)
    issue = next((i for i in issues if i["id"] == issue_id), None)

    if not issue or issue["status"] != "open":
        return jsonify({"error": "Issue not available"}), 400

    worker = request.json.get("worker", "").strip()
    if not worker:
        return jsonify({"error": "Name required"}), 400

    issue["status"] = "in_progress"
    issue["taken_by"] = worker

    write_json(ISSUES_FILE, issues)
    return jsonify({"success": True})

@app.route("/api/issues/<int:issue_id>/complete", methods=["POST"])
def api_complete_issue(issue_id):
    issues = read_json(ISSUES_FILE)
    issue = next((i for i in issues if i["id"] == issue_id), None)

    if not issue:
        return jsonify({"error": "Issue not found"}), 404

    issue["status"] = "completed"
    write_json(ISSUES_FILE, issues)
    return jsonify({"success": True})

# ✅ DEMO CONTRIBUTION ENDPOINT
@app.route("/api/issues/<int:issue_id>/contribute", methods=["POST"])
def api_contribute(issue_id):
    issues = read_json(ISSUES_FILE)
    issue = next((i for i in issues if i["id"] == issue_id), None)

    if not issue:
        return jsonify({"error": "Issue not found"}), 404

    amount = int(request.json.get("amount", 0))
    if amount <= 0:
        return jsonify({"error": "Invalid amount"}), 400

    issue["collected_amount"] += amount
    write_json(ISSUES_FILE, issues)

    return jsonify({"success": True})

if __name__ == "__main__":
    app.run(debug=True)

