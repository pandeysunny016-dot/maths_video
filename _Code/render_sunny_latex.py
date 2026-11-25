import os
import subprocess
import tempfile
import cv2
import numpy as np

OUT_DIR = "/Users/abhimanraj/MATHS-VIDEO/eigen-film/lemo-opuscar/films/functions-sunny/assets/tex"
os.makedirs(OUT_DIR, exist_ok=True)

# Light-theme ink (#1C2127) and Royal Blue (#1D4ED8) LaTeX formulas
INK = (0x1C, 0x21, 0x27)
BLUE = (0x1D, 0x4E, 0xD8)
RED = (0xD9, 0x38, 0x1E)

FORMULAS = {
    "tex_s1": (r"$\mathrm{Input}\;(x) \;\longrightarrow\; \boxed{\;f(x)\;} \;\longrightarrow\; \mathrm{Output}\;(y)$", INK),
    "tex_s2": (r"$f(x) = 2x + 1$", BLUE),
    "tex_s3": (r"$y = 2x + 1 \qquad (\mathrm{Linear\ Graph})$", BLUE),
    "tex_s4_0": (r"$f(0) = 2(0) + 1 = 1 \;\implies\; (0, 1)$", INK),
    "tex_s4_1": (r"$f(1) = 2(1) + 1 = 3 \;\implies\; (1, 3)$", INK),
    "tex_s4_2": (r"$f(2) = 2(2) + 1 = 5 \;\implies\; (2, 5)$", INK),
    "tex_s4_3": (r"$f(3) = 2(3) + 1 = 7 \;\implies\; (3, 7)$", INK),
    "tex_s5": (r"$C(x) = 20x \qquad (\mathrm{Total\ Cost\ in\ Rupees})$", RED),
    "tex_s6": (r"$\mathrm{Formula} \;\equiv\; \mathrm{Table} \;\equiv\; \mathrm{Graph}$", INK),
}

TEX_TEMPLATE = r"""\documentclass[border=4pt]{standalone}
\usepackage{amsmath}
\usepackage{amssymb}
\begin{document}
%s
\end{document}
"""

with tempfile.TemporaryDirectory() as tmp:
    env = os.environ.copy()
    env["TEXMFVAR"] = "/tmp/texmf-var"
    for name, (expr, rgb) in FORMULAS.items():
        tex_path = os.path.join(tmp, f"{name}.tex")
        pdf_path = os.path.join(tmp, f"{name}.pdf")
        png_prefix = os.path.join(tmp, name)

        with open(tex_path, "w") as f:
            f.write(TEX_TEMPLATE % expr)

        subprocess.run(
            ["/Library/TeX/texbin/pdflatex", "-interaction=nonstopmode", "-output-directory", tmp, tex_path],
            check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env=env
        )
        subprocess.run(
            ["/opt/homebrew/bin/pdftoppm", "-png", "-r", "450", "-singlefile", pdf_path, png_prefix],
            check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )

        raw = cv2.imread(png_prefix + ".png", cv2.IMREAD_GRAYSCALE)
        alpha = 255 - raw
        h, w = alpha.shape
        rgba = np.zeros((h, w, 4), dtype=np.uint8)
        rgba[:, :, 0] = rgb[2]
        rgba[:, :, 1] = rgb[1]
        rgba[:, :, 2] = rgb[0]
        rgba[:, :, 3] = alpha

        out_png = os.path.join(OUT_DIR, f"{name}.png")
        cv2.imwrite(out_png, rgba)
        print(f"Compiled Light-Theme LaTeX {name}: {w}x{h}")
