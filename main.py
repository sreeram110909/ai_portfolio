from src.chat import chatwith_resume
from src.parsers import resume_parser
from src.reader import read_resume


def main():
    print("Reading and parsing resume...")
    resume_text = read_resume("resume/resume.pdf")
    parsed_resume = resume_parser(resume_text)
    chatwith_resume(parsed_resume)


if __name__ == "__main__":
    main()
