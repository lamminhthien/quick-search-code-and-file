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

# Enhancement 4
Let store search result file in ~/Desktop/Search_Code_Pro_Result

# Enhancement 5
Skip search in openapi-spec.json

# Enhancement 6
Let use finder to open folder which contains result search file

# Enhancement 7 ✅ COMPLETED
I want to search with multiple keywords, a behavior is that the prompt input will let user to type many of keywords after press enter. And when user press i button, it will complete collect multiple keywords and start to search. Goal is that will search file that contain many keywords

**Implementation Details:**
- Added "Multiple keywords search" mode in interactive mode
- Users can enter keywords one by one
- Type "done" to finish collecting keywords and start search
- The search finds files that contain ALL specified keywords
- Result files show which keywords matched on each line
- Filename includes all keywords in the format: `search-keyword1-and-keyword2-in-folder-timestamp.md`
- Works with both markdown and text export formats

# Enhancement 8 ✅ COMPLETED
I want build mac app have icon, please find icon in folder AppIcon.appiconset

**Implementation Details:**
- Created `create-icon.sh` script to convert WebP images from AppIcon.appiconset to macOS .icns format
- Uses `sips` to convert images to PNG format first
- Uses `iconutil` to create proper macOS icon bundle
- Updated `build-app.sh` to automatically generate and include the icon in the app bundle
- Icon is properly placed in `dist/Search Code Pro.app/Contents/Resources/`
- Info.plist correctly references the icon file

# Enhancement 9 ✅ COMPLETED
For search with multiple keywords, I only want search result contain file which contain all of keywords matches

**Implementation Details:**
- This feature was already implemented in Enhancement 7
- The `searchCode()` function uses `searchTerms.every()` to ensure ALL keywords are present in a file before including it in results (line 107-109 in index.js)
- Only files containing ALL keywords are included in the search results
- Individual lines are then shown with indicators of which keywords matched on each line

# Enhancement 10 ✅ COMPLETED
For option browse and select folder, please let user start from ~/ directory

**Implementation Details:**
- Updated `folderPicker` function to accept a `startPath` parameter (already existed)
- Modified `interactiveMode` to pass `os.homedir()` when calling `folderPicker()` for the picker method
- When users select "Browse and select folder (Interactive)", the folder picker now starts from the home directory (~/) instead of the current working directory
- Users can still navigate to parent directories using the ".. (Parent directory)" option


# Enhancement 11 ✅ COMPLETED
I want feature to store history, or recent folder path which have used in previous search. Data can be store in folder ~/Search_Code_Pro_Data

**Implementation Details:**
- Created history management system that stores recent folder paths in `~/Search_Code_Pro_Data/folder_history.json`
- Added three new functions:
  - `ensureHistoryDir()`: Creates the data directory if it doesn't exist
  - `loadFolderHistory()`: Loads the folder history from the JSON file
  - `saveFolderToHistory()`: Saves a folder path to history with timestamp
  - `getRelativeTime()`: Formats timestamps into human-readable relative time (e.g., "2 hours ago", "3 days ago")
- When users select folder in interactive mode, a new option "Select from recent folders" appears if history exists
- Recent folders are displayed with their last used time in a friendly format
- History is automatically saved after each successful search (both interactive and CLI mode)
- Maximum of 10 recent folders are stored, with oldest entries being removed automatically
- Most recently used folders appear at the top of the list
- If a folder is used again, it moves to the top with an updated timestamp

# Enhancement 12 ✅ COMPLETED
When interactive with terminal, let add press backspace to go back function

**Implementation Details:**
- Added "← Go back" option in folder picker that returns to folder selection method
- Added "← Go back" option in recent folders list
- Added "← Go back" option in search mode selection
- Added "back" keyword support in file pattern input
- When user selects go back, the interactive mode restarts from the beginning
- This allows users to navigate back through the prompts if they made a wrong choice

# Enhancement 13 ✅ COMPLETED
Along with build mac os app, let copy binary to ~/ folder and register to ~/.zshrc and ~/.bashrc

**Implementation Details:**
- Updated `build-app.sh` to automatically copy the binary to `~/search-code-pro`
- Added function `add_alias_to_config()` to safely add alias to shell config files
- Automatically adds `alias scp='~/search-code-pro'` to both `~/.zshrc` and `~/.bashrc`
- Checks if alias already exists before adding to prevent duplicates
- Creates config files if they don't exist
- Users can run `scp` from terminal after sourcing their config file
- Binary is also available directly at `~/search-code-pro`

# Enhancement 14 ✅ COMPLETED
Add option select current directory

**Implementation Details:**
- Added "Current directory" as the first option in folder selection menu
- When selected, uses `process.cwd()` to get current working directory
- Allows users to quickly search in their current location without browsing
- Positioned at the top of the choices list for easy access