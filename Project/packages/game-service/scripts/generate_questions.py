import os
import re
import json
import random
import kagglehub
import pandas as pd

# Define target words and their respective distractor pools
POOLS = {
    "prepositions": {
        "words": ["in", "on", "at", "under", "above", "behind", "between", "through", "before", "after", "with", "for", "about", "by", "from", "to", "into", "during", "without", "against", "towards"],
        "pool": ["in", "on", "at", "under", "above", "behind", "between", "through", "before", "after", "with", "for", "about", "by", "from", "to", "into", "during", "without", "against", "towards"]
    },
    "articles": {
        "words": ["a", "an", "the", "this", "that", "these", "those"],
        "pool": ["a", "an", "the", "this", "that", "these", "those", "some", "any"]
    },
    "conjunctions": {
        "words": ["and", "but", "or", "because", "so", "although", "while", "since", "unless", "until"],
        "pool": ["and", "but", "or", "because", "so", "although", "while", "since", "unless", "until"]
    },
    "pronouns": {
        "words": ["he", "she", "it", "they", "we", "him", "her", "them", "us", "his", "their", "our", "its", "my", "your", "me", "you"],
        "pool": ["he", "she", "it", "they", "we", "him", "her", "them", "us", "his", "their", "our", "its", "my", "your", "me", "you"]
    },
    "modals_aux": {
        "words": ["can", "could", "should", "would", "must", "may", "might", "is", "are", "was", "were", "am", "been", "has", "have", "had"],
        "pool": ["can", "could", "should", "would", "must", "may", "might", "is", "are", "was", "were", "am", "been", "has", "have", "had"]
    }
}

def split_into_sentences(text):
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)
    # Split sentences by . ? ! followed by space or end of string
    raw_sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    cleaned = []
    for s in raw_sentences:
        s = s.strip()
        # Clean quotes at edges
        s = re.sub(r'^["\'“‘]+|["\'”’]+$', '', s)
        # Filter for reasonable length (5 to 15 words)
        words_count = len(s.split())
        if 5 <= words_count <= 15:
            cleaned.append(s)
    return cleaned

def match_case(word, template):
    """Matches the capitalization of template word."""
    if template.istitle():
        return word.capitalize()
    if template.isupper():
        return word.upper()
    return word.lower()

def create_question_from_sentence(sentence, q_id, difficulty):
    # Find all words in the sentence that exist in any of our pools
    potential_omissions = []
    
    # Tokenize sentence words to find exact word matches
    words = re.findall(r'\b\w+\b', sentence)
    
    for word in words:
        word_lower = word.lower()
        for category, config in POOLS.items():
            if word_lower in config["words"]:
                potential_omissions.append((word, category, config["pool"]))
                
    if not potential_omissions:
        return None
        
    # Pick one target word randomly
    target_word, category, pool = random.choice(potential_omissions)
    
    # Omit it in the text. We replace only the first occurrence of this word boundary
    # to avoid omitting multiple words if the same word appears twice.
    pattern = rf'\b{re.escape(target_word)}\b'
    blanked_text = re.sub(pattern, "___", sentence, count=1)
    
    # Get distractors from the pool (excluding the target word)
    distractor_pool = [w for w in pool if w.lower() != target_word.lower()]
    if len(distractor_pool) < 3:
        return None
        
    selected_distractors = random.sample(distractor_pool, 3)
    
    # Construct options list with capitalization matching target word
    correct_opt = {
        "id": target_word.lower(),
        "text": target_word,
        "isCorrect": True
    }
    
    options = [correct_opt]
    for dist in selected_distractors:
        case_matched_dist = match_case(dist, target_word)
        options.append({
            "id": dist.lower(),
            "text": case_matched_dist,
            "isCorrect": False
        })
        
    # Shuffle options
    random.shuffle(options)
    
    return {
        "id": q_id,
        "text": blanked_text,
        "imageUrl": None,
        "difficulty": difficulty,
        "points": 10,
        "options": options,
        "active": True
    }

def main():
    print("📥 Downloading CEFR Levelled English Texts dataset from Kaggle...")
    path = kagglehub.dataset_download("amontgomerie/cefr-levelled-english-texts")
    print(f"✅ Dataset downloaded to: {path}")
    
    # Find the CSV file in the downloaded path
    csv_file = None
    for file in os.listdir(path):
        if file.endswith(".csv"):
            csv_file = os.path.join(path, file)
            break
            
    if not csv_file:
        raise FileNotFoundError(f"Could not find any CSV file in downloaded path: {path}")
        
    print(f"📊 Loading CSV file: {csv_file}")
    df = pd.read_csv(csv_file)
    
    # Inspect columns
    print(f"Columns in dataset: {df.columns.tolist()}")
    text_col = 'text' if 'text' in df.columns else df.columns[0]
    label_col = 'label' if 'label' in df.columns else df.columns[1]
    
    # Map CEFR labels to difficulties
    # A1 -> beginner, A2 -> basic, B1 -> intermediate
    label_map = {
        'A1': 'beginner',
        'A2': 'basic',
        'B1': 'intermediate'
    }
    
    questions_by_level = {
        'beginner': [],
        'basic': [],
        'intermediate': []
    }
    
    print("⚙️ Processing texts into sentences and questions...")
    
    # We want 300 of each level. Let's process the dataframe.
    # We will shuffle the rows to get a diverse selection of sentences.
    df_shuffled = df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    q_counters = {'beginner': 0, 'basic': 0, 'intermediate': 0}
    
    for idx, row in df_shuffled.iterrows():
        cefr_label = str(row[label_col]).strip()
        if cefr_label not in label_map:
            continue
            
        difficulty = label_map[cefr_label]
        text_content = str(row[text_col])
        
        sentences = split_into_sentences(text_content)
        
        for s in sentences:
            # Generate unique ID
            q_id = f"sent-{difficulty}-{q_counters[difficulty] + 1:04d}"
            q = create_question_from_sentence(s, q_id, difficulty)
            
            if q is not None:
                questions_by_level[difficulty].append(q)
                q_counters[difficulty] += 1
                
    # Collect exactly 300 from each difficulty level (or all if we didn't reach 300, but there should be plenty)
    final_questions = []
    for level, questions in questions_by_level.items():
        print(f"Generated {len(questions)} potential questions for level: {level}")
        # Shuffle again for variety
        random.shuffle(questions)
        selected = questions[:300]
        # Re-index IDs to be contiguous 1 to 300
        for i, q in enumerate(selected):
            q["id"] = f"sent-{level}-{i + 1:03d}"
            final_questions.append(q)
        print(f"Selected {len(selected)} questions for level: {level}")
        
    output_dir = os.path.dirname(os.path.abspath(__file__))
    # Output path to packages/game-service/src/data/sentenceCompletionQuestions.json
    output_path = os.path.join(output_dir, "../src/data/sentenceCompletionQuestions.json")
    output_path = os.path.abspath(output_path)
    
    print(f"💾 Writing {len(final_questions)} questions to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(final_questions, f, ensure_ascii=False, indent=2)
        
    print("🎉 Done successfully!")

if __name__ == "__main__":
    main()
