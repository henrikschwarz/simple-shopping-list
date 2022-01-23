from ..apps.api.models import TokenUser, ShoppingCart, ShoppingCartItem
from apps import db
def create_tokens():
    try:
        for i in range(5):
            db.session.add(TokenUser())
        db.session.commit()
        print("Added 5 users.")
    except Exception as E:
        print("Errro %s" % E)
    

def create_shopping_carts():
    try:
        shoppingcarts = ["Cart 1", "Cart 2", "Cart 3", "Cart 4", "Cart 5"]
        users = TokenUser.query.all()
        for owner,name in zip(users, shoppingcarts):
            new_cart = ShoppingCart(owner_id=owner.id, name=name)
            db.session.add(new_cart)
        db.session.commit()
    except Exception as E:
        print("Error %s" % E)

def create_items(shoppinglist):
    item_names = ["Butter", "Milk", "Eggs", "Soap"]
    shopping_carts = ShoppingCart.query.all()
    for cart in shopping_carts:
        for item in item_names:
            db.session.add(ShoppingCartItem(owner=cart.id, name=item))
    db.session.commit()

def populate_db():
    create_tokens()

