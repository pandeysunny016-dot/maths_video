import os
import shutil
import subprocess
import tempfile
from PIL import Image

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "tex")
os.makedirs(OUT_DIR, exist_ok=True)

def find_bin(name: str, fallback: str) -> str:
    """Resolve binary from PATH or fallback location, raising a clear error if missing."""
    path = shutil.which(name) or (fallback if os.path.isfile(fallback) else None)
    if not path:
        raise FileNotFoundError(
            f"Required binary '{name}' not found in PATH or '{fallback}'. "
            "Install MacTeX/BasicTeX (pdflatex) and poppler (pdftoppm) to render LaTeX."
        )
    return path

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

PDFLATEX = find_bin("pdflatex", "/Library/TeX/texbin/pdflatex")
PDFTOPPM = find_bin("pdftoppm", "/opt/homebrew/bin/pdftoppm")

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
            [PDFLATEX, "-interaction=nonstopmode", "-output-directory", tmp, tex_path],
            check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env=env
        )
        subprocess.run(
            [PDFTOPPM, "-png", "-r", "450", "-singlefile", pdf_path, png_prefix],
            check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )

        gray = Image.open(png_prefix + ".png").convert("L")
        alpha = gray.point(lambda p: 255 - p)
        w, h = gray.size
        rgba = Image.merge("RGBA", (
            Image.new("L", (w, h), rgb[0]),
            Image.new("L", (w, h), rgb[1]),
            Image.new("L", (w, h), rgb[2]),
            alpha,
        ))

        out_png = os.path.join(OUT_DIR, f"{name}.png")
        rgba.save(out_png)
        print(f"Compiled Light-Theme LaTeX {name}: {w}x{h}")
