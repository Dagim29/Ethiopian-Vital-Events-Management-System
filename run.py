from app import create_app

app = create_app()

if __name__ == '__main__':
    if app:
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        print("❌ Failed to create Flask app")
