# This file is use for brainstorm idea
AS you can know when we are using the visual studio code or github, we often search code to see which file and which line have the same code. But it just use on the single repository and only in vscode, that is not inconvinience, and also it not support export the search result, and not support open multi file. So I have an idea that I want a terminal tool using nodejs and can interact with search file on the folder or workspace we choose, after search, it also support export search result as txt file or markdown file. Also, if great, it can have option to open file have keyword search in default code editor


# Enhancement 1
In the search file, Let user choose one of 2 option:
Option 1: Enter the folder path
Option 2: Show folder popup selection to easily choose folder (I don't want to manual copy and past folder path)

# Enhancement 2
For search pattern, let don't search on some file or folder which is ignore by .gitignore
Skip search on NodeModules

# Enhancement 3
Instead of show everything in terminal, let default export to Markdown file
and show the path of this file, also for the file name, let include the search keywords and the root folder search location