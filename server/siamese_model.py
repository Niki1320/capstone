import os
import sys
import json
import numpy as np
import tensorflow as tf
import librosa
import soundfile as sf
from moviepy.editor import AudioFileClip
import io

# Enable unsafe deserialization
tf.keras.config.enable_unsafe_deserialization()

# Ensure stdout and stderr use UTF-8 encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Custom distance layer (unchanged if you're using a custom one)
@tf.keras.utils.register_keras_serializable()
class CustomDistanceLayer(tf.keras.layers.Layer):
    def __init__(self, **kwargs):
        super(CustomDistanceLayer, self).__init__(**kwargs)

    def call(self, inputs):
        anchor, positive = inputs
        return tf.reduce_sum(tf.square(anchor - positive), axis=1, keepdims=True)

    def get_config(self):
        config = super(CustomDistanceLayer, self).get_config()
        return config


# Custom Contrastive Loss Function
@tf.keras.utils.register_keras_serializable()
def contrastive_loss(y_true, y_pred):
    margin = 1.0
    return tf.reduce_mean((1 - y_true) * tf.square(y_pred) +
                          y_true * tf.square(tf.maximum(margin - y_pred, 0)))

def convert_mp3_to_wav(mp3_path, wav_path):
    try:
        audio = AudioFileClip(mp3_path)
        audio.write_audiofile(wav_path, codec='pcm_s16le')
    except Exception as e:
        print(f"Error converting {mp3_path} to {wav_path}: {e}", file=sys.stderr)

def extract_features(y, sr):
    # Extract features and return as a numpy array
    try:
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        spectral_contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
        tonnetz = librosa.feature.tonnetz(y=y, sr=sr)
        zero_crossing_rate = librosa.feature.zero_crossing_rate(y=y)
        rms = librosa.feature.rms(y=y)
        mel_spectrogram = librosa.feature.melspectrogram(y=y, sr=sr)

        # Average features
        return np.concatenate([
            np.mean(mfcc.T, axis=0),
            np.mean(chroma.T, axis=0),
            np.mean(spectral_contrast.T, axis=0),
            np.mean(tonnetz.T, axis=0),
            np.mean(zero_crossing_rate.T, axis=0),
            np.mean(rms.T, axis=0),
            np.mean(mel_spectrogram.T, axis=0)
        ])
    except Exception as e:
        print(f"Error extracting features: {e}", file=sys.stderr)
        raise

def split_audio(file_path, clip_duration=30):
    try:
        y, sr = librosa.load(file_path, sr=None)
        total_duration = librosa.get_duration(y=y, sr=sr)
        clip_offsets = np.arange(0, total_duration, clip_duration)
        return clip_offsets, clip_duration
    except Exception as e:
        print(f"Error splitting audio file {file_path}: {e}", file=sys.stderr)
        return [], clip_duration

def process_audio_clips(file_path, clip_duration=30):
    clips_dir = 'clips'
    if not os.path.exists(clips_dir):
        os.makedirs(clips_dir)

    offsets, _ = split_audio(file_path, clip_duration)
    
    clip_paths = []
    for idx, offset in enumerate(offsets):
        clip_path = os.path.join(clips_dir, f"clip_{idx}.wav")
        try:
            y, sr = librosa.load(file_path, sr=None, offset=offset, duration=clip_duration)
            sf.write(clip_path, y, sr)
            clip_paths.append(clip_path)
        except Exception as e:
            print(f"Error processing clip {clip_path}: {e}", file=sys.stderr)

    yield from clip_paths

    for clip_path in clip_paths:
        try:
            os.remove(clip_path)
        except Exception as e:
            print(f"Error deleting clip {clip_path}: {e}", file=sys.stderr)

def compare_audio_files(model, file_path1, file_path2):
    similarity_scores = []
    
    # Maximum score for scaling (set this to the maximum observed score)
    max_score = 0.5095  # Replace this with the actual maximum score obtained
    
    for wav_path1 in process_audio_clips(file_path1):
        for wav_path2 in process_audio_clips(file_path2):
            try:
                y1, sr1 = librosa.load(wav_path1, sr=None)
                y2, sr2 = librosa.load(wav_path2, sr=None)

                if len(y1) == 0 or len(y2) == 0:
                    print(f"Warning: One of the audio clips is empty ({wav_path1} or {wav_path2}), skipping...", file=sys.stderr)
                    continue
                
                features1 = extract_features(y1, sr1)
                features2 = extract_features(y2, sr2)
                
                features1 = np.expand_dims(features1, axis=0)
                features2 = np.expand_dims(features2, axis=0)

                # Calculate similarity score
                similarity_score = model.predict([features1, features2])[0][0]

                # Scale the score to be between 0 and 1 based on max_score
                if max_score > 0:
                    scaled_similarity_score = (similarity_score / max_score)  # Scale to [0, 1]
                else:
                    scaled_similarity_score = similarity_score  # Avoid division by zero

                similarity_scores.append({
                    'clip1': wav_path1,
                    'clip2': wav_path2,
                    'similarity_score': float(scaled_similarity_score)
                })
            except Exception as e:
                print(f"Error processing clips {wav_path1} and {wav_path2}: {e}", file=sys.stderr)

    similarity_scores.sort(key=lambda x: x['similarity_score'], reverse=True)
    
    return similarity_scores


def main():
    if len(sys.argv) != 3:
        print("Usage: python siamese_model.py <file_path1> <file_path2>", file=sys.stderr)
        sys.exit(1)

    file_path1 = sys.argv[1]
    file_path2 = sys.argv[2]

    try:
        # Load your pre-trained ensemble model
        model = tf.keras.models.load_model(
            'C:/Users/DELL/Capstone/notebooks/pair-compare/ensemble_model_2_2.keras',
            custom_objects={
                'CustomDistanceLayer': CustomDistanceLayer,
                'contrastive_loss': contrastive_loss
            }
        )
        print("Model loaded successfully.", file=sys.stderr)
    except Exception as e:
        print(f"Error loading model: {e}", file=sys.stderr)
        sys.exit(1)

    try:
        # Compare the audio files using the loaded model
        result = compare_audio_files(model, file_path1, file_path2)
        if result is None:
            print("Error processing audio files.", file=sys.stderr)
            sys.exit(1)
    except Exception as e:
        print(f"Error during comparison: {e}", file=sys.stderr)
        sys.exit(1)

    try:
        # Create the JSON output structure
        json_output = json.dumps(result, ensure_ascii=False, indent=2)
        
        # Print JSON output with markers
        print("START_JSON_OUTPUT")
        print(json_output)  # Output the JSON to stdout
        print("END_JSON_OUTPUT")
    except Exception as e:
        print(f"Error writing output: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
