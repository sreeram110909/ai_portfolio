from pathlib import Path
from typing import BinaryIO
from pypdf import PdfReader


def read_pdf(file_path: Path | str | BinaryIO) -> str:
    """Extracts text content from all pages of a PDF file or binary stream."""
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text


def read_resume(file_path: str | Path) -> str:
    """
    Reads resume PDF with automatic path resolution.
    Checks relative path, root project directory, and the 'resume/' subfolder.
    """
    path = Path(file_path)

    if not path.is_absolute() and not path.exists():
        project_root = Path(__file__).parent.parent
        candidates = [
            project_root / path,
            project_root / "resume" / path.name,
            project_root / "resumes" / path.name,
            Path(__file__).parent / path,
        ]
        for candidate in candidates:
            if candidate.exists():
                path = candidate
                break

    if not path.exists():
        raise FileNotFoundError(f"Resume file not found: {file_path}")

    if path.suffix.lower() == ".pdf":
        return read_pdf(path)
    else:
        raise ValueError(f"Unsupported file type: {path.suffix}. Only PDF resumes are supported.")
