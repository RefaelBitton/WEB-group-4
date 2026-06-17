import os
import json
import zipfile
import random
import urllib.request

LEVELS = {
    "beginner": ["dog", "cat", "bird", "apple", "banana", "orange", "car", "book", "chair", "bed", "cup", "clock", "bicycle", "person", "boat"],
    "basic": ["pizza", "cake", "couch", "tv", "laptop", "mouse", "keyboard", "cell phone", "umbrella", "backpack", "handbag", "suitcase", "tennis racket", "broccoli", "carrot", "donut", "sandwich", "bottle", "bowl", "fork", "knife", "spoon", "toilet", "sink", "oven", "refrigerator"],
    "intermediate": ["motorcycle", "airplane", "bus", "train", "truck", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "sports ball", "kite", "skateboard", "surfboard", "tie", "vase", "scissors", "teddy bear", "toothbrush"]
}

# Reverse mapping for category lookup
CATEGORY_TO_LEVEL = {}
for level, words in LEVELS.items():
    for word in words:
        CATEGORY_TO_LEVEL[word] = level

def download_and_extract():
    url = "http://images.cocodataset.org/annotations/annotations_trainval2017.zip"
    zip_path = "annotations_trainval2017.zip"
    extracted_dir = "temp_coco"
    target_file = "annotations/instances_val2017.json"
    
    if not os.path.exists(extracted_dir):
        os.makedirs(extracted_dir)
        
    full_target_path = os.path.join(extracted_dir, target_file)
    if os.path.exists(full_target_path):
        print(f"ℹ️ Found existing annotations at {full_target_path}")
        return full_target_path
        
    print(f"📥 Downloading COCO annotations from {url}...")
    # Using urllib for built-in download with simple block monitoring
    def report(block_num, block_size, total_size):
        read_so_far = block_num * block_size
        if total_size > 0:
            percent = min(100, read_so_far * 100 / total_size)
            print(f"\rDownloading: {percent:.1f}%", end="")
        else:
            print(f"\rDownloaded: {read_so_far} bytes", end="")
            
    urllib.request.urlretrieve(url, zip_path, reporthook=report)
    print("\n✅ Download completed successfully.")
    
    print(f"📦 Unzipping only {target_file}...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extract(target_file, extracted_dir)
        
    print("🧹 Cleaning up zip archive...")
    if os.path.exists(zip_path):
        os.remove(zip_path)
        
    return full_target_path

def main():
    try:
        ann_path = download_and_extract()
    except Exception as e:
        print(f"❌ Failed to download/extract COCO annotations: {e}")
        return
        
    print(f"📖 Loading JSON annotations: {ann_path}")
    with open(ann_path, 'r') as f:
        coco_data = json.load(f)
        
    print("⚙️ Parsing categories, images, and annotations...")
    
    # Map category_id -> name
    categories = {cat["id"]: cat["name"] for cat in coco_data["categories"]}
    
    # Map image_id -> image info
    images = {}
    for img in coco_data["images"]:
        images[img["id"]] = {
            "url": img["coco_url"],
            "width": img["width"],
            "height": img["height"]
        }
        
    # Group annotations by image_id
    image_annotations = {}
    for ann in coco_data["annotations"]:
        image_id = ann["image_id"]
        if image_id not in image_annotations:
            image_annotations[image_id] = []
        image_annotations[image_id].append(ann)
        
    questions_by_level = {
        "beginner": [],
        "basic": [],
        "intermediate": []
    }
    
    # Process each image to see if it qualifies
    # A qualifying image has a prominent category that belongs to our target word lists
    for image_id, anns in image_annotations.items():
        if image_id not in images:
            continue
            
        img_info = images[image_id]
        img_area = img_info["width"] * img_info["height"]
        if img_area <= 0:
            continue
            
        # Find the annotation with the largest relative area
        best_ann = None
        best_relative_area = 0.0
        
        for ann in anns:
            cat_name = categories.get(ann["category_id"])
            if not cat_name or cat_name not in CATEGORY_TO_LEVEL:
                continue
                
            # bbox is [x, y, width, height]
            bbox = ann.get("bbox", [])
            if len(bbox) >= 4:
                ann_area = bbox[2] * bbox[3]
                rel_area = ann_area / img_area
                if rel_area > best_relative_area:
                    best_relative_area = rel_area
                    best_ann = ann
                    
        # Check if the most prominent annotation is significant (e.g. at least 15% of the image)
        if best_ann is not None and best_relative_area >= 0.15:
            cat_name = categories[best_ann["category_id"]]
            level = CATEGORY_TO_LEVEL[cat_name]
            
            # Construct question
            questions_by_level[level].append({
                "image_id": image_id,
                "coco_url": img_info["url"],
                "target_word": cat_name,
                "level": level
            })
            
    print("📊 Potential questions found in validation set:")
    for level, q_list in questions_by_level.items():
        print(f"  {level}: {len(q_list)} potential images")
        
    # Build final questions
    final_questions = []
    
    for level in ["beginner", "basic", "intermediate"]:
        q_list = questions_by_level[level]
        if len(q_list) < 300:
            print(f"⚠️ Warning: Level '{level}' only has {len(q_list)} images (requested 300).")
            selected = q_list
        else:
            # Shuffle and select 300
            random.shuffle(q_list)
            selected = q_list[:300]
            
        print(f"Selected {len(selected)} questions for level: {level}")
        
        # Build options for each selected question
        level_words = LEVELS[level]
        
        for i, q in enumerate(selected):
            correct_word = q["target_word"]
            
            # Select 3 distractors from the same level pool
            distractors = [w for w in level_words if w != correct_word]
            selected_distractors = random.sample(distractors, 3)
            
            options = [{
                "id": correct_word.lower(),
                "text": correct_word.capitalize(),
                "isCorrect": True
            }]
            for dist in selected_distractors:
                options.append({
                    "id": dist.lower(),
                    "text": dist.capitalize(),
                    "isCorrect": False
                })
                
            random.shuffle(options)
            
            # Re-index question IDs
            q_id = f"img-{level}-{i + 1:03d}"
            
            final_questions.append({
                "id": q_id,
                "text": "",
                "imageUrl": q["coco_url"],
                "difficulty": level,
                "points": 10,
                "options": options,
                "active": True
            })
            
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(output_dir, "../src/data/imageRecognitionQuestions.json")
    output_path = os.path.abspath(output_path)
    
    print(f"💾 Writing {len(final_questions)} questions to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(final_questions, f, ensure_ascii=False, indent=2)
        
    # Clean up temp extracted dir
    print("🧹 Cleaning up extracted annotation files...")
    import shutil
    if os.path.exists("temp_coco"):
        shutil.rmtree("temp_coco")
        
    print("🎉 Done successfully!")

if __name__ == "__main__":
    main()
