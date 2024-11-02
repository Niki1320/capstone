import sys
import os
import librosa
import numpy as np
import torch
from pymongo import MongoClient
from conv_autoencoder import ConvAutoencoder  # Assume the model definition is in conv_autoencoder.py
import json
import re

def extract_duration(clip_path):
    # Use regex to capture start and end durations from the file path
    match = re.search(r'-([\d]+)-([\d]+)\.mp3$', clip_path)
    if match:
        start_duration = int(match.group(1))
        end_duration = int(match.group(2))
        return f"{start_duration}-{end_duration} seconds"
    return "Unknown duration"

def extract_features(y, sr, max_length=36441):
    mel_spectrogram = librosa.feature.melspectrogram(y=y, sr=sr)
    mfcc = librosa.feature.mfcc(S=librosa.power_to_db(mel_spectrogram), sr=sr)
    chroma = librosa.feature.chroma_stft(S=mel_spectrogram, sr=sr)
    spectral_contrast = librosa.feature.spectral_contrast(S=mel_spectrogram, sr=sr)
    zero_crossing_rate = librosa.feature.zero_crossing_rate(y)
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    
    mfcc_flat = mfcc.flatten()[:max_length]
    chroma_flat = chroma.flatten()[:max_length - len(mfcc_flat)]
    spectral_contrast_flat = spectral_contrast.flatten()[:max_length - len(mfcc_flat) - len(chroma_flat)]
    zero_crossing_rate_flat = zero_crossing_rate.flatten()[:max_length - len(mfcc_flat) - len(chroma_flat) - len(spectral_contrast_flat)]
    tempo_array_flat = np.array([tempo]).flatten()[:max_length - len(mfcc_flat) - len(chroma_flat) - len(spectral_contrast_flat) - len(zero_crossing_rate_flat)]
    
    features_combined = np.concatenate((mfcc_flat, chroma_flat, spectral_contrast_flat, zero_crossing_rate_flat, tempo_array_flat))
    
    return features_combined

def get_signature_from_model(model, input_data):
    input_data = torch.tensor(input_data, dtype=torch.float32).unsqueeze(0).unsqueeze(0)
    signature = model.get_signature(input_data)
    return signature.cpu().numpy()

def calculate_similarity(signature1, signature2, max_euclidean_distance=400):
    euclidean_dist = np.linalg.norm(signature1 - signature2)
    normalized_euclidean_dist = 1 - min(euclidean_dist / max_euclidean_distance, 1)
    return normalized_euclidean_dist

def split_audio(file_path, clip_duration=32):
    y, sr = librosa.load(file_path, sr=None)
    clip_length = clip_duration * sr
    
    # If the audio length is less than the clip length, return the entire audio as a single clip
    if len(y) < clip_length:
        return [(y, sr)]
    
    # Otherwise, split into multiple clips of the specified duration
    clips = [(y[i:i + clip_length], sr) for i in range(0, len(y), clip_length) if len(y[i:i + clip_length]) == clip_length]
    return clips


def process_audio(file_path, model, collection, threshold=0.6):
    clips = split_audio(file_path)
    
    if not clips:
        return []

    similar_clips = []
    
    for i, (clip, sr) in enumerate(clips):
        features = extract_features(clip, sr)
        signature = get_signature_from_model(model, features)
        
        for doc in collection.find():
            for db_clip in doc['clips']:
                db_signature = np.array(db_clip['signature'])
                
                if np.std(db_signature) == 0:
                    continue
                
                similarity_score = calculate_similarity(signature, db_signature)
                
                if similarity_score > threshold:
                    duration = extract_duration(db_clip.get('clip_path', ''))
                    
                    similar_clips.append({
                        'artist': doc['metadata'].get('artist'),
                        'album': doc['metadata'].get('album'),
                        'song_name': doc['metadata'].get('song_name'),
                        'clip_path': db_clip.get('clip_path'),
                        'duration': duration,
                        'similarity_score': similarity_score
                    })
    
    # Sort similar_clips in descending order based on similarity_score
    similar_clips.sort(key=lambda x: x['similarity_score'], reverse=True)
    
    return similar_clips

if __name__ == "__main__":
    file_path = sys.argv[1]
    
    # MongoDB setup
    client = MongoClient("mongodb+srv://nikithav678:sYJ48Y2WGCtKbaV4@capstone1.gcjwe8n.mongodb.net/?retryWrites=true&w=majority&appName=Capstone1")
    db = client["capstone-final"]
    collection = db["conv-final"]
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = ConvAutoencoder(input_channels=1).to(device)
    model.load_state_dict(torch.load(r"C:\Users\DELL\Capstone\notebooks\sig-match\conv_autoencoder3.pth", map_location=device))
    model.eval()
    
    similar_clips = process_audio(file_path, model, collection)
    
    # Print the similar clips with similarity scores greater than the threshold
    print(json.dumps(similar_clips))