import os
from flask import Flask
from apps import db
from apps.home import Home
from apps.api import api

def create_app():
    app = Flask(__name__)
    if app.config['ENV'] == 'production':
        app.config.from_object('config.ProductionConfig')
    else:
        app.config.from_object('config.DevelopmentConfig')
    # Change delimeter so that flask and vue can work together
    jinja_options = Flask.jinja_options.copy()
    jinja_options.update(dict(
        block_start_string='<%',
        block_end_string='%>',
        variable_start_string='%%',
        variable_end_string='%%',
        comment_start_string='<#',
        comment_end_string='#>',
    ))
    app.jinja_options = jinja_options

    db.init_app(app)

    @app.cli.command("create_db")
    def create_db():
        with app.app_context():
            db.create_all()

    @app.cli.command("drop_tables")
    def drop_tables():
        with app.app_context():
            db.drop_all()

    """
    @app.cli.command("populate_db")
    def populate_db():
        populate()
    """

    app.register_blueprint(Home)
    app.register_blueprint(api)

    return app

if __name__ == '__main__':
    create_app().run()