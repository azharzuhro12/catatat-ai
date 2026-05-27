import google.generativeai as genai
genai.configure(api_key='AIzaSyAogFIXmLExXD27El_hti87YkHJ1HtKtnI')
model = genai.GenerativeModel('gemini-2.0-flash')
r = model.generate_content('test')
print('OK:', r.text[:100])