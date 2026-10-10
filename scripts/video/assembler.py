# Assemble image + musique, son normalise a -16 LUFS (deux passes loudnorm), H.264 + AAC, lecture rapide sur le web.
# python assembler.py brut.mp4 musique.wav sortie.mp4 crf
import sys, subprocess, json, re
brut, musique, sortie, crf = sys.argv[1:5]
mesure = subprocess.run(['ffmpeg', '-hide_banner', '-i', musique, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
m = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', mesure).group(0))
filtre = (f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=44100")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', brut, '-i', musique, '-map', '0:v', '-map', '1:a', '-af', filtre,
                '-c:v', 'libx264', '-preset', 'slow', '-crf', crf, '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
                '-c:a', 'aac', '-b:a', '128k', '-shortest', sortie], check=True)
verif = subprocess.run(['ffmpeg', '-hide_banner', '-i', sortie, '-af', 'loudnorm=print_format=json', '-vn', '-f', 'null', '-'], capture_output=True, text=True).stderr
v = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', verif).group(0))
print(sortie, 'LUFS', v['input_i'], 'crete', v['input_tp'])
