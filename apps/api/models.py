from .. import db
import random
import string
from datetime import datetime

class TokenUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(256), nullable=False)
    shopping_list = db.relationship('ShoppingCart', backref='owner', lazy=True)

    def __repr__(self):
        return "< User token %s >" % self.token

    def to_dict(self):
        return {
            "id": self.id,
            "token": self.token
        }
    
    @property
    def set_token(self):
        raise AttributeError("Not an attribute")

    @set_token.setter
    def set_token(self, token):
        if token != None:
            self.token = token

    @property
    def token_length(self):
        raise AttributeError("Not an attribute")

    @token_length.setter
    def token_length(self, length=256):
        if self.token != None:
            genstr = string.ascii_uppercase+string.ascii_lowercase+string.digits
            self.token = ''.join([random.choice(genstr) for i in range(length)])

class ShoppingCart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    created_at = db.Column(db.DateTime(), default=datetime.now())
    owner_id = db.Column(db.Integer, db.ForeignKey('token_user.token'), nullable=False)
    items = db.relationship('ShoppingCartItem', backref='shopping_cart', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "owner_id": self.owner_id,
            "items": [item.to_dict() for item in self.items],
            "created_at": self.created_at
        }

class ShoppingCartItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    owner = db.Column(db.Integer, db.ForeignKey('shopping_cart.id'), nullable=True)
    bought = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "owner": self.owner,
            "bought": self.bought
        }