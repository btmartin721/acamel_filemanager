import React, { useState } from 'react';
import PropTypes from 'prop-types';  // Import PropTypes for type-checking

function ProjectFolderDropdown({ folders, onFolderChange }) {
    // Local state to keep track of the currently selected folder
    const [selectedFolder, setSelectedFolder] = useState('');

    // Function to handle folder selection from dropdown
    const handleFolderChange = (e) => {
        const newSelectedFolder = e.target.value;
        setSelectedFolder(newSelectedFolder);
        if (onFolderChange) {
            onFolderChange(newSelectedFolder);
        }
    };

    // Check if folders is an array before mapping over it
    const folderOptions = Array.isArray(folders) ? folders.map((folder, index) => (
        <option key={index} value={folder}>
            {folder}
        </option>
    )) : null;

    return (
        <div>
            <label htmlFor="projectFolder">Select Project Folder:</label>
            <select
                id="projectFolder"
                value={selectedFolder}
                onChange={handleFolderChange}
            >
                <option value="" disabled>Select a folder</option>
                {folderOptions}
            </select>
        </div>
    );
}

// Add PropTypes for better debugging and documentation
ProjectFolderDropdown.propTypes = {
    folders: PropTypes.array,
    onFolderChange: PropTypes.func
};

export default ProjectFolderDropdown;
