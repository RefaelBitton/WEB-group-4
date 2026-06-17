import os
import json
import random
import urllib.request
import pandas as pd
from deep_translator import GoogleTranslator

def translate_batch(words_list):
    """Translates a list of words to Hebrew in one API call, preserving alignment."""
    translator = GoogleTranslator(source='en', target='iw')
    text_to_translate = "\n".join(words_list)
    try:
        translated_text = translator.translate(text_to_translate)
        translated_words = [w.strip() for w in translated_text.split("\n")]
        
        # Verify alignment
        if len(translated_words) == len(words_list):
            return translated_words
        else:
            print(f"⚠️ Warning: Batch alignment mismatch (expected {len(words_list)}, got {len(translated_words)}). Falling back to word-by-word.")
    except Exception as e:
        print(f"⚠️ Translation error: {e}. Falling back to word-by-word.")
        
    # Fallback: Translate one by one
    translated_words = []
    for word in words_list:
        try:
            translation = translator.translate(word)
            translated_words.append(translation.strip())
        except Exception as e:
            print(f"❌ Failed to translate '{word}': {e}")
            translated_words.append(word) # Fallback to original
    return translated_words

def main():
    csv_url = "https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/master/cefrj-vocabulary-profile-1.5.csv"
    temp_csv = "cefrj-vocabulary-profile-1.5.csv"
    
    print(f"📥 Downloading CEFR vocabulary from {csv_url}...")
    urllib.request.urlretrieve(csv_url, temp_csv)
    print("✅ Download completed.")
    
    print(f"📊 Loading CSV file: {temp_csv}")
    df = pd.read_csv(temp_csv)
    
    # Inspect columns
    print(f"Columns in dataset: {df.columns.tolist()}")
    word_col = 'headword'
    level_col = 'CEFR'
    
    # Map CEFR levels
    level_map = {
        'A1': 'beginner',
        'A2': 'basic',
        'B1': 'intermediate'
    }
    
    words_by_level = {
        'beginner': [],
        'basic': [],
        'intermediate': []
    }
    
    # Clean and group words
    for idx, row in df.iterrows():
        raw_word = str(row[word_col]).strip()
        raw_level = str(row[level_col]).strip().upper()
        
        # Remove words with slashes/dots/spaces (e.g. "a.m./A.M./am/AM" or "able to")
        if not raw_word.isalpha() or not (3 <= len(raw_word) <= 10):
            continue
            
        if raw_level in level_map:
            difficulty = level_map[raw_level]
            word_lower = raw_word.lower()
            if word_lower not in words_by_level[difficulty]:
                words_by_level[difficulty].append(word_lower)
                
    # Select exactly 300 words for each level
    selected_words_by_level = {}
    for level, words_list in words_by_level.items():
        print(f"Level '{level}' has {len(words_list)} potential words.")
        if len(words_list) < 300:
            raise ValueError(f"Not enough words in level '{level}' (only {len(words_list)}, need 300).")
        # Shuffle for variety
        random.shuffle(words_list)
        selected_words_by_level[level] = words_list[:300]
        
    # Translate and build questions
    final_questions = []
    
    for level in ['beginner', 'basic', 'intermediate']:
        print(f"🗣️ Translating words for level: {level}...")
        words_list = selected_words_by_level[level]
        
        # Translate in batches of 100
        batch_size = 100
        translations = []
        for i in range(0, len(words_list), batch_size):
            batch = words_list[i : i + batch_size]
            print(f"  Translating batch {i // batch_size + 1} of {len(words_list) // batch_size}...")
            translations.extend(translate_batch(batch))
            
        print(f"✅ Translated all words for level: {level}")
        
        # Build questions
        level_words = selected_words_by_level[level]
        for idx, (eng_word, heb_word) in enumerate(zip(words_list, translations)):
            # Distractors from same level pool
            distractors = [w for w in level_words if w != eng_word]
            selected_distractors = random.sample(distractors, 3)
            
            options = [{
                "id": eng_word,
                "text": eng_word.capitalize(),
                "isCorrect": True
            }]
            for dist in selected_distractors:
                options.append({
                    "id": dist,
                    "text": dist.capitalize(),
                    "isCorrect": False
                })
                
            random.shuffle(options)
            
            q_id = f"trans-{level}-{idx + 1:03d}"
            
            final_questions.append({
                "id": q_id,
                "text": heb_word,
                "imageUrl": None,
                "difficulty": level,
                "points": 10,
                "options": options,
                "active": True
            })
            
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(output_dir, "../src/data/quickTranslationQuestions.json")
    output_path = os.path.abspath(output_path)
    
    print(f"💾 Writing {len(final_questions)} questions to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(final_questions, f, ensure_ascii=False, indent=2)
        
    # Clean up temp CSV file
    print("🧹 Cleaning up temporary CSV file...")
    if os.path.exists(temp_csv):
        os.remove(temp_csv)
        
    print("🎉 Done successfully!")

if __name__ == "__main__":
    main()
