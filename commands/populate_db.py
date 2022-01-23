from ..apps.api.models import TokenUser, ShoppingCart, ShoppingCartItem
from .. import db
def create_tokens():
    for i in range(5):
        db.session.add(TokenUser())
    db.session.commit()

def create_shopping_carts():
    shoppingcarts = ["Cart 1", "Cart 2", "Cart 3", "Cart 4", "Cart 5"]
    users = TokenUser.query.all()
    for owner,name in zip(users, shoppingcarts):
        new_cart = ShoppingCart(owner_id=owner.id, name=name)
        db.session.add(new_cart)
    db.session.commit()