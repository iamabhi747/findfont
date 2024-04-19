import urllib.request
from hashlib import sha256
from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path
app = Flask(__name__)
CORS(app)

out_dir = 'dataset/train'

def data_uri_to_png(data_uri, filename):
    response = urllib.request.urlopen(data_uri)
    with open(filename, 'wb') as f:
        f.write(response.file.read())

@app.route('/datauri', methods=['POST'])
def datauri():
    data = request.json
    Path(out_dir, data['fontid']).mkdir(parents=True, exist_ok=True)
    data_uri_to_png(data['data_uri'], out_dir + '/' + data['fontid'] + '/' +  sha256(data['text'].encode()).hexdigest()[:8]+'.png')
    return jsonify({'status': 'ok'})

# if __name__ == '__main__':
#     app.run(port=5000)