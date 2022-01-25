from flask import Blueprint, jsonify, request
from .models import ShoppingCart, ShoppingCartItem, TokenUser
from .. import db
import json

api = Blueprint('Api for the shoppingcart', __name__, url_prefix='/api')

@api.route("/users")
def get_users():
    users = TokenUser.query.all()
    if users:
        return jsonify([u.to_dict() for u in users])
    return jsonify("There are no users yet.")

@api.route("/user/<token>")
def get_user(token):
    if not token:
        return "Must include id", 400
    user = TokenUser.query.filter_by(token=token).first()
    if not user:
        return "Not such user", 404
    return jsonify(user.to_dict())


 # curl -X POST -H "Content-Type: application/json" -d '{}' http://localhost:5000/api/user/
 # curl -X POST -d '' http://localhost:5000/api/user/
@api.route("/user/", methods=['POST'])
def add_user():
    if 'token_length' not in request.form.keys():
        try:
            user = TokenUser(token_length=256)
            db.session.add(user)
            db.session.commit()
            return jsonify("Ok"), 200
        except Exception as e:
            return e, 400
    try:
        token_length = request.form['token_length']
        user = TokenUser(token_length=int(token_length))
        db.session.add(user)
        db.session.commit()
        return {"token": user.token}
    except Exception as e: 
        return {"error": "Error was %s " % e}, 400

@api.route("/user/<token>", methods=["PUT"])
def update_user(token):
    pass

@api.route("/user/<token>", methods=["DELETE"])
def delete_user(token):
    if not token:
        return jsonify("No token. Please use a valid token.")
    user = TokenUser.query.filter_by(token=token).first()
    if not user:
        return "No such user"
    try:
        db.session.delete(user)
        db.session.commit()
        return user.to_dict()
    except Exception as e:
        return {"error": "Error: %s" % e}, 400

####### CARTS
@api.route("/shoppingcarts/")
def get_shopping_carts():
    carts = ShoppingCart.query.all()
    if not carts:
        return "No shopping carts yet."
    return jsonify([cart.to_dict() for cart in carts])

@api.route("/shoppingcarts/<token>")
def get_shopping_cart_from_token(token):
    carts = ShoppingCart.query.filter_by(owner_id=token).all()
    if not carts:
        return "No shopping carts yet.", 404
    return jsonify([cart.to_dict() for cart in carts])


@api.route("/shoppingcart/<cart_id>")
def get_shopping_cart(cart_id):
    if not cart_id:
        return "Please use a token id"
    try:
        cart = ShoppingCart.query.filter_by(id=cart_id)
        return cart.to_dict()
    except Exception as e:
        return {"error": "Error as %s" % e}, 400

@api.route("/shoppingcart/", methods=["POST"])
def add_shopping_cart():
    try:
        name = request.form["name"]
        token_id = request.form["token_id"]
        user = TokenUser.query.filter_by(token=token_id).first()
        if not user:
            return jsonify("No such user")
        new_cart = ShoppingCart(name=name, owner_id=user.token)
        db.session.add(new_cart)
        db.session.commit()
        return new_cart.to_dict()
    except TypeError:
        return "Typerror"
    except Exception as e:
        print("Error %s " % e)
        return {"Error": "Error at %s" % e}
    return "Error"

@api.route("/shoppingcart/", methods=["PUT"])
def update_shopping_cart(token_id):
    pass

@api.route("/shoppingcart/<cart_id>", methods=["DELETE"])
def delete_shopping_cart(cart_id):
    if not cart_id:
        print("Cart id")
        return jsonify("No token. Please use a valid token.")
    cart = ShoppingCart.query.filter_by(id=cart_id).first()
    if not cart:
        return "No such Cart"
    try:
        db.session.delete(cart)
        db.session.commit()
        return cart.to_dict()
    except Exception as e:
        return {"error": "Error: %s" % e}, 400


######### Items
@api.route("/shoppingcart/<cart_id>/items/")
def get_items(cart_id):
    cart = ShoppingCart.query.filter_by(id=cart_id).first()
    if not cart:
        return {"error": "No such cart"}
    return jsonify([item.to_dict() for item in cart.items])

@api.route("/shoppingcart/<cart_id>/item/<item_id>")
def get_item(cart_id, item_id):
    cart = ShoppingCart.query.filter_by(id=cart_id).first()
    if not cart:
        return {"error": "No such cart"}
    item = ShoppingCartItem.query.filter_by(id=item_id, owner=cart.id).first()
    if not cart:
        return {"error": "No such item"}
    return jsonify(item.to_dict())

@api.route("/shoppingcart/<cart_id>/item/", methods=["POST"])
def add_item(cart_id):
    if not cart_id:
        return {"error": "Error no ids"}
    try:
        name = request.form['name']
        new_item = ShoppingCartItem(name=name,owner=cart_id)
        db.session.add(new_item)
        db.session.commit()
        return jsonify(new_item.to_dict())
    except Exception as e:
        return {"error": "Error as %s" % e}

@api.route("/shoppingcart/<cart_id>/item/<item_id>", methods=["PUT"])
def update_item(cart_id, item_id):
    pass

@api.route("/shoppingcart/<cart_id>/item/<item_id>", methods=["DELETE"])
def delete_item(cart_id, item_id):
    if not cart_id or not item_id:
        return {"error": "Error no ids"}
    try:
        item = ShoppingCartItem.query.filter_by(id=item_id, owner=cart.id).first()
        print(item)
        db.session.delete(item)
        db.session.commit()
        return jsonify(new_item.to_dict())
    except Exception as e:
        return {"error": "Error as %s" % e}
