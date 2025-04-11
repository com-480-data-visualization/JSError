
all: M2-description.html

M2-description.html: README.md
	pandoc --toc -o M2-description.html --template toc-sidebar.html --css=css/cg_report.css -s README.md
