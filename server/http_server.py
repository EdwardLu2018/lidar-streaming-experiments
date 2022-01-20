from flask import Flask, render_template, Response
from camera import Camera

app = Flask(__name__)
# app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 300

# @app.route('/')
# def index():
#     return render_template('index.html')

def gen(camera):
    while True:
        frame = camera.get_frame()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/lidarstream')
def lidar_stream():
    response = Response(gen(Camera()),
                    mimetype='multipart/x-mixed-replace; boundary=frame')
    # response.headers.add('Access-Control-Allow-Origin', '*')
    # response.headers.add('Cache-Control', 'no-cache, no-store, must-revalidate')
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, threaded=True)
