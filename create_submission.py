import shutil
import os

def zip_project():
    source_dir = os.getcwd()
    output_filename = 'TaskManagementSystem_Submission'
    
    # Create a temporary directory or just zip with exclusion
    # shutil.make_archive does not support easy exclusion pattern in older python
    # So we will use zipfile manually or just exclude via filter if possible.
    # Easiest: zip everything, but that includes venv.
    
    import zipfile
    
    with zipfile.ZipFile(f'{output_filename}.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # Exclude venv, node_modules, .git, .gemini, __pycache__
            dirs[:] = [d for d in dirs if d not in ['venv', 'node_modules', '.git', '.gemini', '__pycache__', 'dist']]
            
            for file in files:
                if file.endswith('.zip') or file.endswith('. sqlite3'):
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, source_dir)
                zipf.write(file_path, arcname)
                
    print(f"Created {output_filename}.zip")

if __name__ == '__main__':
    zip_project()
