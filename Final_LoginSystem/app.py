import pandas as pd
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.utils import to_categorical
from flask import Flask, request, jsonify
from flask_cors import CORS

# Flask app setup
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Load the pre-trained model
model = load_model('password_generation_model.h5')

# Load and preprocess dataset
data = pd.read_csv('password_strength_dataset.csv')
data['Password'] = data['Password'].apply(lambda x: x[:12])  # Truncate passwords to 12 characters
data = data[data['Password'].apply(len) == 12]

# Character mappings
chars = sorted(list(set(''.join(data['Password']))))  # Unique characters
char_to_int = {c: i for i, c in enumerate(chars)}
int_to_char = {i: c for i, c in enumerate(chars)}
n_vocab = len(chars)

seq_length = 12 - 1  # Sequence length is fixed at 11 for input

# Flask API endpoint to generate a password
@app.route('/generate-password', methods=['POST'])
def generate_password():
 try:
        # Automatically generate a random seed (no user input)
        seed = ''.join(np.random.choice(chars, seq_length))  # Random seed

        # Debugging: Print the seed
        print(f"Generated Seed: {seed}")

        # Ensure the seed is valid
        if len(seed) > seq_length:
            return jsonify({'error': 'Seed length exceeds the allowed sequence length'}), 400

        # Pad seed if shorter than the required length
        seed = seed.ljust(seq_length, np.random.choice(chars))
        password = seed
        pattern = [char_to_int[char] for char in seed]

        # Debugging: Print the initial pattern
        print(f"Initial pattern: {pattern}")

        # Generate the password
        for _ in range(12 - len(seed)):
            x = np.reshape(pattern, (1, len(pattern), 1)) / float(n_vocab)  # Normalize input
            print(f"Model input shape: {x.shape}")  # Debugging: Check input shape
            char_prediction, strength_prediction = model.predict(x, verbose=0)

            # Debugging: Print the predictions
            print(f"Char Prediction: {char_prediction}")
            print(f"Strength Prediction: {strength_prediction}")

            # Sample the next character
            preds = np.log(char_prediction[0]) / 1  # Temperature = 1
            exp_preds = np.exp(preds)
            preds = exp_preds / np.sum(exp_preds)
            
            next_char_index = np.random.choice(range(len(chars)), p=preds)
            next_char = int_to_char[next_char_index]

            password += next_char
            pattern.append(next_char_index)
            pattern = pattern[1:]

        # Predict final strength
        x_strength = np.reshape(pattern, (1, len(pattern), 1)) / float(n_vocab)
        _, strength_prediction = model.predict(x_strength, verbose=0)
        predicted_strength = np.argmax(strength_prediction)

        # Return the generated password and strength
        return jsonify({'password': password, 'strength': int(predicted_strength)})
 except Exception as e:
        # Debugging: Print the error
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)
