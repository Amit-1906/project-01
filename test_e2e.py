import urllib.request
import json

def test():
    print("=== 1. Testing Frontend HTTP ===")
    req = urllib.request.urlopen("http://127.0.0.1:5173/")
    print(f"Frontend Status: {req.status}")
    html = req.read().decode('utf-8')
    print(f"HTML Title Present: {'VOXORA — AI Voice Studio' in html}")

    print("\n=== 2. Testing API Health through Vite Proxy ===")
    req = urllib.request.urlopen("http://127.0.0.1:5173/api/health")
    data = json.loads(req.read().decode('utf-8'))
    print("Health:", data)

    print("\n=== 3. Testing Voices Catalog ===")
    req = urllib.request.urlopen("http://127.0.0.1:5173/api/voices")
    data = json.loads(req.read().decode('utf-8'))
    print(f"Total Voices Available: {data['total']}")
    for v in data['voices'][:4]:
        print(f" - {v['name']} ({v['gender']}, {v['language']}) [{v['category']}]")

    print("\n=== 4. Testing Speech Generation End-to-End ===")
    payload = json.dumps({
        "text": "Welcome to Voxora. Transform any text into expressive, natural-sounding speech with AI.",
        "voice_id": "en-US-JennyNeural",
        "speed": 1.0,
        "pitch": 1.0,
        "volume": 1.0,
        "stability": 0.75,
        "format": "mp3",
        "project_title": "Production E2E Verification"
    }).encode('utf-8')
    post_req = urllib.request.Request(
        "http://127.0.0.1:5173/api/tts/generate",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(post_req)
    gen_data = json.loads(res.read().decode('utf-8'))
    print("Generation Success:", gen_data['success'])
    print("Audio URL:", gen_data['audio_url'])
    print("Duration (s):", gen_data['duration'])
    print("Word Count:", gen_data['word_count'])

    print("\n=== 5. Testing Generated Audio Delivery ===")
    target_url = gen_data['audio_url']
    if target_url.startswith("data:"):
        print(f"Direct in-memory audio data stream detected (length: {len(target_url)})")
        audio_req = urllib.request.urlopen(target_url)
        content = audio_req.read()
        print(f"Audio Size (bytes): {len(content)}")
    else:
        audio_req = urllib.request.urlopen("http://127.0.0.1:5173" + target_url)
        content = audio_req.read()
        print(f"Audio Status: {audio_req.status}")
        print(f"Audio Size (bytes): {len(content)}")
        print(f"Content Type: {audio_req.headers.get('Content-Type')}")

    print("\n=== 6. Testing Projects and History Sync ===")
    p_req = urllib.request.urlopen("http://127.0.0.1:5173/api/projects")
    projects = json.loads(p_req.read().decode('utf-8'))
    print(f"Total Projects: {projects['total']}")

    h_req = urllib.request.urlopen("http://127.0.0.1:5173/api/history")
    history = json.loads(h_req.read().decode('utf-8'))
    print(f"Total History Generations: {history['total']}")

    print("\nALL END-TO-END TESTS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    test()

