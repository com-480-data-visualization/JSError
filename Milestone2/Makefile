all: M2-description.html M2-description.pdf

M2-description.html: README.md
	pandoc --toc -o $@ --template toc-sidebar.html --css=css/cg_report.css -s $<

M2-description.pdf: README.md
	pandoc --toc -o $@ --pdf-engine=wkhtmltopdf -s $<