from flask import Blueprint, render_template, jsonify, request
import json

Home = Blueprint('home', __name__, url_prefix="", template_folder="./templates")

@Home.route("/")
def home():
    return render_template("index.html")
