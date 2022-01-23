
from .models import TokenUser, ShoppingCart, ShoppingCartItem
def create_tokens(db):
    try:
        for i in range(5):
            db.session.add(TokenUser(token_length=256))
        db.session.commit()
        print("Added 5 users.")
    except Exception as E:
        print("Errro %s" % E)
    

def create_shopping_carts(db):
    try:
        users = TokenUser.query.all()
        carts = range(1, len(users)+1)
        for owner,name in zip(users, carts):
            new_cart = ShoppingCart(owner_id=owner.id, name=name)
            db.session.add(new_cart)
            #print("added cart %s" % name)
        db.session.commit()
        print("Added %d shopping carts" % len(carts))
    except Exception as E:
        print("Error %s" % E)

def add_items_to_cart(db, cart):
    try:
        item_names = ["Butter", "Milk", "Eggs", "Soap"]
        for item in item_names:
            db.session.add(ShoppingCartItem(owner=cart.id, name=item))
        db.session.commit()
        print("Added 4 items to cart %s" % cart.name)
    except Exception as E:
        print("Error %s" % E)

def create_items(db):
    carts = ShoppingCart.query.all()
    for cart in carts:
        add_items_to_cart(db, cart)
    print("Added 4 items to %d carts" % len(carts))

def populate_db(db):
    create_tokens(db)
    create_shopping_carts(db)
    create_items(db)
        
    
    
